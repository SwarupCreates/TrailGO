

export function TopBar() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex w-full items-center justify-between px-5 pt-12 pb-4">
      {/* Left side: Menu and Logo */}
      <div className="flex items-center gap-4 pointer-events-auto drop-shadow-md">
        <button className="text-white hover:text-slate-300">
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="TrailGO" className="h-5 drop-shadow-md" />
        </div>
      </div>

      {/* Right side: User avatar */}
      <div className="pointer-events-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-700/50 bg-slate-800 drop-shadow-md">
        <img
          src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f59e0b"
          alt="User Avatar"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
