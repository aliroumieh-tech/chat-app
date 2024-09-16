import { create } from "zustand";

interface userChatsData {
  chatId: string;
  receiverId: string;
  lastMessage: string;
  updatedAt: Date;
  isSeen: boolean;
}

interface UsersStore {
  userChats: userChatsData[];
  setUserChats: (userChats: userChatsData[]) => void;
}

const useUserChatsStore = create<UsersStore>((set) => ({
  userChats: [],
  setUserChats: (userChats: userChatsData[]) => set({ userChats }),
}));

export default useUserChatsStore;
