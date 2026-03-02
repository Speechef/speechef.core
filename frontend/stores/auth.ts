import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, isAuthenticated } from '@/lib/auth';

interface AuthState {
  isLoggedIn: boolean;
  login: (username: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: typeof window !== 'undefined' ? isAuthenticated() : false,

  login: async (username, password, remember = false) => {
    await apiLogin(username, password, remember);
    set({ isLoggedIn: true });
  },

  logout: () => {
    apiLogout();
    set({ isLoggedIn: false });
  },
}));
