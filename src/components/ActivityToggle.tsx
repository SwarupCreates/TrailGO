import { useNavigationStore } from '../app/navigationStore';

export function ActivityToggle() {
  const activity = useNavigationStore((state) => state.activityType);
  const setActivity = useNavigationStore((state) => state.setActivityType);

  return (
    <div className="pointer-events-auto absolute left-5 top-28 z-20 flex items-center rounded-full bg-white/[0.08] border border-white/10 p-1 shadow-lg backdrop-blur-[12px]">
      <button
        onClick={() => setActivity('walk')}
        className={`flex h-10 w-12 items-center justify-center rounded-full transition-colors ${
          activity === 'walk' ? 'bg-slate-700' : 'bg-transparent hover:bg-white/5'
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${activity === 'walk' ? 'text-white' : 'text-slate-400'}`}>
          directions_walk
        </span>
      </button>
      <button
        onClick={() => setActivity('bike')}
        className={`flex h-10 w-12 items-center justify-center rounded-full transition-colors ${
          activity === 'bike' ? 'bg-[#ff6b00]' : 'bg-transparent hover:bg-white/5'
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${activity === 'bike' ? 'text-white' : 'text-slate-400'}`}>
          directions_bike
        </span>
      </button>
    </div>
  );
}
