import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../config/firebase";
import useUserStore from "./userUserStore";
import { MutableRefObject } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  blocked?: string[];
  bio?: string;
}

interface userMessagesData {
  chatId: string;
  senderId: string;
  text: string;
  image: string;
  createdAt: Timestamp | Date;
}

interface UsersStore {
  chat: userMessagesData[] | null;
  clickedUser: User | null;
  isUserBlocked: boolean;
  isReceiverBlocked: boolean;
  setChat: (chatId: string | undefined, user: User | undefined) => void;
  chatId: string | null;
  scrollToLastMessage: MutableRefObject<HTMLDivElement | null>;
}

const useChatsStore = create<UsersStore>((set) => ({
  chat: null,
  chatId: null,
  clickedUser: null,
  isUserBlocked: false,
  isReceiverBlocked: false,
  scrollToLastMessage: {
    current: null,
  } as MutableRefObject<HTMLDivElement | null>,
  setChat: (chatId, user) => {
    if (!chatId) return;

    const currentUser = useUserStore.getState().user;

    const unsub = onSnapshot(doc(db, "chats", chatId), (doc) => {
      if (doc.data()) {
        set({ chat: doc.data()?.messages as userMessagesData[] });
        set({ chatId: doc.id });

        setTimeout(() => {
          useChatsStore.getState().scrollToLastMessage.current?.scrollIntoView({
            behavior: "smooth",
          });
        }, 0);
      }
    });

    set({ isUserBlocked: false });
    set({ isReceiverBlocked: false });

    if (user) set({ clickedUser: user });

    if (currentUser?.blocked?.includes(user?.id)) {
      set({ isReceiverBlocked: true });
    }

    if (currentUser && user?.blocked?.includes(currentUser.id)) {
      set({ isUserBlocked: true });
    }

    return () => unsub();
  },
}));

export default useChatsStore;
