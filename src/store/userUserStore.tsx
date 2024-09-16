import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  blocked?: string[];
  bio?: string;
}

interface UsersStore {
  user: null | User;
  setUser: (user: User) => void;
}

const useUserStore = create<UsersStore>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
}));

export default useUserStore;
