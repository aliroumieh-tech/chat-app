import exitIcon from "../../assets/icons8-exit-30.png";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import useUsersStore from "../../store/useUsersStore";
import useUserChatsStore from "../../store/useUserChatsStore";

interface AddNewUserProps {
  setOpenAddNewUser: (openAddNewUser: boolean) => void;
}

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  blocked?: string[];
  bio?: string;
}

const AddNewUser: React.FC<AddNewUserProps> = ({ setOpenAddNewUser }) => {
  const [inputValue, setInputValue] = useState<string>();
  const [addedUser, setAddedUser] = useState<User>();
  const [user] = useAuthState(auth);

  const findUser = useUsersStore((state) => state.findUser);
  const userChats = useUserChatsStore((state) => state.userChats);

  const handleSearchUser = () => {
    if (!inputValue?.trim() || inputValue?.trim() === "") {
      toast.warning("please enter valid username!");
      return;
    }
    const foundUser = findUser(inputValue) as User;

    const alreadyAddedUser = userChats.find(
      (chat) => chat.receiverId == foundUser.id
    );

    if (!foundUser || foundUser.id === user?.uid || alreadyAddedUser) {
      toast.warning("no user found!");
      return;
    } else {
      setAddedUser(foundUser);
    }
  };

  const handleAddUser = async () => {
    if (!user || !addedUser) return;

    const userChatsDocRef = doc(db, "userChats", user.uid);
    const addedUserChatsDocRef = doc(db, "userChats", addedUser.id);

    const userChatRef = collection(db, "chats");
    const userChatDoc = doc(userChatRef);

    const userChatsDoc = await getDoc(userChatsDocRef);
    const addedUserChatDoc = await getDoc(addedUserChatsDocRef);

    const userChatData = {
      chatId: userChatDoc.id,
      receiverId: addedUser.id,
      lastMessage: "",
      updatedAt: new Date(),
      isSeen: false,
    };

    const addedUserChatData = {
      chatId: userChatDoc.id,
      receiverId: user.uid,
      lastMessage: "",
      updatedAt: new Date(),
      isSeen: false,
    };

    if (addedUserChatDoc.exists()) {
      await updateDoc(addedUserChatsDocRef, {
        chats: arrayUnion(addedUserChatData),
      });
    } else {
      await setDoc(addedUserChatsDocRef, {
        id: addedUser.id,
        chats: arrayUnion(addedUserChatData),
      });

      await setDoc(userChatDoc, {
        createdAt: new Date(),
        messages: arrayUnion(),
      });
    }

    if (userChatsDoc.exists()) {
      await updateDoc(userChatsDocRef, {
        chats: arrayUnion(userChatData),
      });
    } else {
      await setDoc(userChatsDocRef, {
        id: user.uid,
        chats: arrayUnion(userChatData),
      });

      await setDoc(userChatDoc, {
        createdAt: new Date(),
        messages: arrayUnion(),
      });
    }

    if (userChatsDoc.exists() && addedUserChatDoc.exists()) {
      await setDoc(userChatDoc, {
        createdAt: new Date(),
        messages: arrayUnion(),
      });
    }

    setOpenAddNewUser(false);
  };

  return (
    <div className="bg-black p-5 rounded-md shadow-uniform-white ">
      <ToastContainer position="top-left" />
      <div>
        <div className="flex justify-between items-center mb-5 text-white">
          <h2 className=" inline font-bold text-lg">Add New User</h2>
          <img
            className="bg-white w-8 rounded-full cursor-pointer"
            src={exitIcon}
            onClick={() => setOpenAddNewUser(false)}
          />
        </div>

        <div>
          <input
            type="text"
            className=" p-3 rounded-md  focus:outline-none mr-3"
            placeholder="username"
            onChange={(e) => setInputValue(e.currentTarget.value)}
          />
          <button
            className="bg-sky-600 p-3 text-white rounded-md"
            onClick={handleSearchUser}
          >
            Search
          </button>
        </div>
      </div>
      {addedUser && (
        <div className="flex justify-between items-center mt-5 text-white ">
          <div className="flex items-center gap-3">
            <img
              src={addedUser.avatar}
              alt="user pfp"
              className="rounded-full w-10"
            />
            <p>{addedUser.username}</p>
          </div>
          <button
            className="bg-sky-600 h-10 w-18 text-sm p-2 rounded-md"
            onClick={handleAddUser}
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
};

export default AddNewUser;
