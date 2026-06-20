import React from 'react';
import {
  BarChart3,
  Sparkles,
  CheckSquare,
  MessageSquare,
  MapPin,
  BookOpen,
  Info,
  Leaf,
  Database,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userLevel: number;
}

export default function Sidebar({ currentTab, setCurrentTab, userLevel }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'assessment', label: 'AI Assessment', icon: Sparkles },
    { id: 'action_plan', label: 'Eco Action Plan', icon: CheckSquare },
    { id: 'coach', label: 'AI Carbon Coach', icon: MessageSquare },
    { id: 'transit', label: 'Eco Transit', icon: MapPin },
    { id: 'learning', label: 'Learning Hub', icon: BookOpen },
    { id: 'validation', label: 'Validation Hub', icon: Info },
  ];

  return (
    <aside
      id="sidebar-container"
      className="w-68 bg-white border-r border-slate-200 text-slate-800 flex flex-col justify-between p-4 shrink-0 transition-all duration-300 shadow-xs"
    >
      <div>
        {/* Brand Banner */}
        <div id="brand-header" className="flex items-center gap-3 py-4 mb-4 select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold font-sans text-lg tracking-tight text-slate-900">
                EcoTracker
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md border border-emerald-200">
                AI
              </span>
            </div>
            <p className="text-[9px] font-mono tracking-wider text-emerald-600 uppercase font-semibold">
              PROMPTWARS CHAMPION
            </p>
          </div>
        </div>

        {/* Gamified Level Status */}
        <div
          id="level-badge-card"
          className="bg-slate-50 border border-slate-200 p-3 rounded-2xl mb-6 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex flex-col items-center justify-center border border-emerald-200">
            <span className="text-[9px] font-mono text-emerald-700 font-medium">RANK</span>
            <span className="text-xl font-extrabold text-emerald-950">{userLevel}</span>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-950">Eco Warrior</h4>
            <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
              Level {userLevel} Specialist
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-navigation" className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Powered taggers */}
      <div id="powered-taggers" className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p className="text-[8px] font-mono text-emerald-700/80 uppercase tracking-widest text-center mb-1.5 select-none font-bold">
          POWERED BY GOOGLE
        </p>
        <div className="flex justify-center items-center gap-2 text-[9px] font-mono text-slate-500 select-none">
          <span className="flex items-center gap-0.5 text-emerald-600">
            <Cpu className="w-2.5 h-2.5" /> Gemini
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-0.5 text-blue-600">
            <Database className="w-2.5 h-2.5" /> Firebase
          </span>
        </div>
      </div>
    </aside>
  );
}
