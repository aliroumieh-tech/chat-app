import { useEffect, useState } from "react";
import AddNewUser from "../../components/chatPageComponents/addNewUser";
import MainChat from "../../components/chatPageComponents/mainChat";
import Sidebar from "../../components/chatPageComponents/sidebar";
import UserChatInfoSidebar from "../../components/chatPageComponents/userChatInfoSidebar";
import useUsersStore from "../../store/useUsersStore";
import useChatsStore from "../../store/useChatsStore";

const ChatPage = () => {
  const [openAddNewUser, setOpenAddNewUser] = useState(false);

  const fetchUsers = useUsersStore((state) => state.fetchUsers);
  const ClickedUser = useChatsStore((state) => state.clickedUser);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="flex bg-custom-grey w-[90vw] h-[90vh] rounded backdrop-blur-sm backdrop-saturate-150">
      <Sidebar setOpenAddNewUser={setOpenAddNewUser} />
      {ClickedUser ? (
        <>
          <MainChat />
          <UserChatInfoSidebar />
        </>
      ) : (
        <div className="flex flex-[3] items-center justify-center text-4xl text-white">
          Start an Conversation
        </div>
      )}

      {openAddNewUser && (
        <div className="fixed  inset-0 bg-black bg-opacity-35 flex  items-center justify-center z-10 ">
          <AddNewUser setOpenAddNewUser={setOpenAddNewUser} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
