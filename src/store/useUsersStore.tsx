import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../config/firebase";

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  blocked?: string[];
  bio?: string;
}

interface userChatsData {
  chatId: string;
  receiverId: string;
  lastMessage: string;
  updatedAt: Date;
  isSeen: boolean;
}

interface UsersStore {
  users: User[];
  currentUser: User | undefined;
  setCurrentUser: (currentUserId: string) => void;
  setUsers: (users: User[]) => void;
  findUser: (inputValue: string) => User | undefined;
  addedUsers: (userChats: userChatsData[]) => User[];
  fetchUsers: () => void;
}

const useUsersStore = create<UsersStore>((set) => ({
  users: [],
  currentUser: undefined,
  setCurrentUser: (currentUserId: string) => {
    const state = useUsersStore.getState();
    const user = state.users.find(
      (user: { id: string }) => user.id === currentUserId
    );

    set({ currentUser: user });
  },
  setUsers: (users) => set({ users }),
  findUser: (inputValue: string): User | undefined => {
    const state = useUsersStore.getState();
    return state.users.find(
      (user: { username: string }) => user.username === inputValue
    );
  },
  addedUsers: (userChats: userChatsData[]): User[] => {
    const state = useUsersStore.getState();
    return state.users.filter((user: User) =>
      userChats.find((chat) => chat.receiverId === user.id)
    );
  },

  fetchUsers: async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: User[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
    set({ users });
  },
}));

export default useUsersStore;
