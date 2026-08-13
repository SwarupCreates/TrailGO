import { useState } from 'react';

export function BottomNav() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'routes', icon: 'route', label: 'Routes' },
    { id: 'activities', icon: 'exercise', label: 'Activities' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <div className="pointer-events-auto absolute bottom-5 left-5 right-5 z-30 rounded-[40px] bg-white/[0.08] p-4 pb-4 shadow-lg backdrop-blur-[12px] border border-white/10">
      <div className="flex items-center justify-between px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
            >
              <div
                className={`flex h-12 w-16 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-[#ff6b00]' : 'bg-transparent hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {tab.icon}
              </span>
              </div>
              <span className={`text-[11px] font-semibold tracking-wide ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
