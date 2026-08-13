import { useNavigationStore } from '../app/navigationStore';

export function MapControls() {
  const isFollowing = useNavigationStore((state) => state.isFollowing);
  const compassMode = useNavigationStore((state) => state.compassMode);
  const mapActions = useNavigationStore((state) => state.mapActions);
  const liveLocation = useNavigationStore((state) => state.liveLocation);

  if (!liveLocation || !mapActions) return null;

  return (
    <div className="pointer-events-none flex flex-col gap-3 transition-all duration-300 ease-in-out">
      {!isFollowing && (
        <button
          onClick={mapActions.recenter}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/10 text-blue-500 shadow-lg backdrop-blur-md transition-all active:scale-95 hover:bg-white/10"
          aria-label="Recenter Map"
        >
          <span className="material-symbols-outlined text-[24px]">my_location</span>
        </button>
      )}
      
      <button
        onClick={mapActions.toggleCompass}
        className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg border border-white/10 backdrop-blur-md transition-all active:scale-95 ${
          compassMode === 'compass' ? 'bg-[#ff6b00] text-white' : 'bg-white/[0.08] text-slate-300 hover:bg-white/10'
        }`}
        aria-label="Toggle Compass Mode"
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {compassMode === 'compass' ? 'explore' : 'navigation'}
        </span>
      </button>
    </div>
  );
}
