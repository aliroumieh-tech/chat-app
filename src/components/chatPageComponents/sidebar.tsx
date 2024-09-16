import moreIcon from "../../assets/more.png";
import videoIcon from "../../assets/video.png";
import editIcon from "../../assets/edit.png";
import searchIcon from "../../assets/search.png";
import addIcon from "../../assets/plus.png";
import avatar from "../../assets/avatar.png";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import useUserChatsStore from "../../store/useUserChatsStore";
import useUsersStore from "../../store/useUsersStore";
import useChatsStore from "../../store/useChatsStore";
import useUserStore from "../../store/userUserStore";

interface SideBarProps {
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

const Sidebar: React.FC<SideBarProps> = ({ setOpenAddNewUser }) => {
  const [user] = useAuthState(auth);
  const setUserChats = useUserChatsStore((state) => state.setUserChats);
  const userChats = useUserChatsStore((state) => state.userChats);
  const addedUsers = useUsersStore((state) => state.addedUsers);
  const setChat = useChatsStore((state) => state.setChat);
  const currentUser = useUsersStore((state) => state.currentUser);
  const users = addedUsers(userChats);
  const [inputValue, setInputValue] = useState("");

  const setUser = useUserStore((state) => state.setUser);
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
    };

    fetchUser();
  }, [setUser, user]);

  const setCurrentUser = useUsersStore((state) => state.setCurrentUser);

  if (user) {
    setCurrentUser(user?.uid);
  }

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "userChats", user.uid), (doc) => {
      if (doc.exists()) {
        if (inputValue.trim()) {
          const foundUsers = userChats?.filter((chat) =>
            users.some(
              (user) =>
                user.username
                  .toLowerCase()
                  .includes(inputValue.toLowerCase()) &&
                chat.receiverId === user.id
            )
          );
          setUserChats(foundUsers);
        } else {
          setUserChats(
            doc
              .data()
              .chats.sort(
                (a: { updatedAt: number }, b: { updatedAt: number }) =>
                  b.updatedAt - a.updatedAt
              )
          );
        }
      }
    });

    return () => unsub();
  }, [user, setUserChats, inputValue, userChats, users]);

  return (
    <div className=" hidden flex-col  border-r-[1px] border-gray-500  min-h-0 md:flex flex-1">
      <header className="flex items-center justify-between p-4 mb-5  min-h-0">
        <div className="flex items-center gap-3 ">
          <img
            src={user?.photoURL || undefined}
            alt="profile pic"
            className="w-12 rounded-full"
          />
          <div className="text-nowrap overflow-auto scrollbar-none w-[110px]">
            <p className="text-white font-bold text-lg">{user?.displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <img src={moreIcon} alt="" className="w-5 cursor-pointer" />
          <img src={videoIcon} alt="" className="w-5 cursor-pointer" />
          <img src={editIcon} alt="" className="w-5 cursor-pointer" />
        </div>
      </header>
      <main className="flex-1 flex flex-col  min-h-0">
        <div className="flex items-center p-4">
          <img
            src={searchIcon}
            alt="search icon"
            className="w-7 absolute pl-2"
          />
          <input
            type="text"
            className="bg-gray-800 text-gray-300 p-2.5 rounded-md placeholder:text-gray-300 pl-10 w-full focus:outline-none"
            placeholder="Search"
            onChange={(e) => setInputValue(e.currentTarget.value)}
          />
          <img
            src={addIcon}
            alt="add user icon"
            className="w-11 h-11 inline-block p-3 ml-5 bg-slate-800 rounded-md cursor-pointer"
            onClick={() => {
              setOpenAddNewUser(true);
              setInputValue("");
            }}
          />
        </div>
        <div className="flex-1 overflow-y-auto text-white divide-y divide-gray-500 scrollbar-custom  min-h-0">
          {userChats.map((chat, i) => {
            const user = users.find((user) => user.id === chat?.receiverId);

            const isBlocked = user?.blocked?.includes(currentUser?.id);

            return (
              <div
                className={`flex gap-5 items-center p-3 cursor-pointer hover:bg-slate-600 ${
                  i === 0 && !chat.isSeen && !isBlocked
                    ? "bg-sky-500"
                    : "bg-none"
                }`}
                onClick={() => setChat(chat?.chatId, user)}
                key={user?.id}
              >
                <img
                  src={isBlocked ? avatar : user?.avatar}
                  alt="user profile"
                  className="rounded-full w-10"
                />

                <span>
                  <p>{isBlocked ? "user" : user?.username}</p>

                  <p className="text-sm text-gray-100">
                    {!isBlocked && chat?.lastMessage}
                  </p>
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
