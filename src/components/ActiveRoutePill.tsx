

type ActiveRoutePillProps = {
  routeName: string;
  onClear: () => void;
};

export function ActiveRoutePill({ routeName, onClear }: ActiveRoutePillProps) {
  const truncatedName = routeName.length > 24 ? routeName.slice(0, 24) + '...' : routeName;

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-24 z-20 flex w-full justify-center px-5">
      <div className="pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/10 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3 truncate">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>location_on</span>
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">
            {truncatedName}
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-500 transition-colors hover:bg-red-500/40"
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 600" }}>close</span>
        </button>
      </div>
    </div>
  );
}
