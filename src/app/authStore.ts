import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  githubUsername?: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserProfile | null;
  loginAsGuest: () => void;
  loginWithGithubMock: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isGuest: false,
      user: null,
      loginAsGuest: () =>
        set({
          isAuthenticated: true,
          isGuest: true,
          user: {
            id: `guest-${Date.now()}`,
            name: 'Guest Explorer',
          },
        }),
      loginWithGithubMock: () =>
        set({
          isAuthenticated: true,
          isGuest: false,
          user: {
            id: 'gh-12345',
            name: 'TrailGo Pro',
            githubUsername: 'trailgopro',
            avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4', // GitHub logo as mock avatar
          },
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          isGuest: false,
          user: null,
        }),
    }),
    {
      name: 'trailgo-auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
