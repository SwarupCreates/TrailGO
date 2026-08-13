import { motion } from 'framer-motion';
import { useAuthStore } from '../app/authStore';

export function AuthPage() {
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
  const loginWithGithubMock = useAuthStore((state) => state.loginWithGithubMock);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#15171a] px-6 text-white">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-[#15171a] to-[#15171a] opacity-50" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#ff6b00] opacity-10 blur-[100px]" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500 opacity-10 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 flex w-full max-w-sm flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/[0.08] border border-white/10 shadow-2xl backdrop-blur-xl">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff6b00"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">TrailGO</h1>
          <p className="text-[15px] font-medium text-[#a1a1aa]">Your ultimate offline GPX navigator</p>
        </div>

        <div className="flex w-full flex-col gap-3 mt-4">
          <button
            onClick={loginWithGithubMock}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-[24px] bg-white text-[15px] font-semibold text-black shadow-lg transition hover:bg-slate-200 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={loginAsGuest}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[24px] bg-white/[0.08] border border-white/10 text-[15px] font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/[0.12] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
