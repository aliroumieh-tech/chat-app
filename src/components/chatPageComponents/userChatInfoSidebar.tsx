import { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import dropDownIcon from "../../assets/icons8-drop-down-50.png";
import useChatsStore from "../../store/useChatsStore";
import { auth, db } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import useUsersStore from "../../store/useUsersStore";
import avatar from "../../assets/avatar.png";
import { useNavigate } from "react-router-dom";

const UserChatInfoSidebar = () => {
  const ClickedUser = useChatsStore((state) => state.clickedUser);
  const isUserBlocked = useChatsStore.getState().isUserBlocked;
  const isReceiverBlocked = useChatsStore.getState().isReceiverBlocked;
  const chats = useChatsStore((state) => state.chat);

  const [user] = useAuthState(auth);
  const [isPhotosDropdownOpen, setPhotosDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const images = chats?.filter((chat) => chat.image);

  const currentUser = useUsersStore((state) => state.currentUser);

  const blockUser = async () => {
    if (!user || !currentUser) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        ...currentUser,
        blocked: [...(currentUser.blocked || []), ClickedUser?.id],
      });
    }
  };

  const logOut = () => {
    signOut(auth)
      .then(() => {
        toast.success("You have logged out successfully!");
        navigate("/");
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  return (
    <>
      {" "}
      <ToastContainer position="top-left" />
      <div className="hidden flex-col text-white border-l-[1px] border-gray-500 lg:flex flex-1">
        <div className="flex items-center flex-col p-5 border-b-[1px] flex-[2] border-gray-500 min-h-0">
          <img
            src={isUserBlocked ? avatar : ClickedUser?.avatar}
            alt="Avatar"
            className="rounded-full w-20 h-20"
          />
          <p className="text-xl font-bold mt-2 mb-1">
            {isUserBlocked ? "User" : ClickedUser?.username}
          </p>
          <p className="text-md">
            {isUserBlocked ? "User has blocked you!" : ClickedUser?.bio}
          </p>
        </div>

        <div className="px-5 py-3 flex flex-col flex-[3] border-b-[1px] min-h-0 border-gray-500">
          <div className="flex justify-between items-center mb-1">
            <p>Chat Settings</p>
            <img
              src={dropDownIcon}
              alt="Dropdown"
              className="w-9 rounded-full cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center mb-1">
            <p>Privacy & Help</p>
            <img
              src={dropDownIcon}
              alt="Dropdown"
              className="w-9 rounded-full cursor-pointer"
            />
          </div>

          <div className="flex flex-col mb-1">
            <div className="flex justify-between items-center">
              <p>Shared Photos</p>
              <img
                src={dropDownIcon}
                alt="Dropdown"
                className="w-9 rounded-full cursor-pointer"
                onClick={() => setPhotosDropdownOpen(!isPhotosDropdownOpen)}
              />
            </div>

            {isPhotosDropdownOpen && (
              <div className="mt-3 space-y-2">
                {images?.length && images.length > 0 ? (
                  images?.map((image, index) => (
                    <div className="flex items-center gap-4">
                      <img
                        key={index}
                        src={image.image}
                        alt={`Shared photo ${index}`}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                      <p className="text-sm">
                        {image.text
                          ? image.text
                          : "Thier is no text with image!"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No shared photos</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-1">
            <p>Shared Files</p>
            <img
              src={dropDownIcon}
              alt="Dropdown"
              className="w-9 rounded-full cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col p-5">
          <button
            className="bg-red-600 p-2 rounded-sm cursor-pointer mb-6"
            onClick={blockUser}
            disabled={isReceiverBlocked}
          >
            {isReceiverBlocked ? "User Blocked" : "Block"}
          </button>
          <button
            className="bg-sky-600 p-2 rounded-sm cursor-pointer"
            onClick={logOut}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default UserChatInfoSidebar;
