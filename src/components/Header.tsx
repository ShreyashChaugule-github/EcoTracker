import React, { useState } from "react";
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  Bell, 
  Settings, 
  User, 
  Sparkles,
  LogOut
} from "lucide-react";

interface HeaderProps {
  displayName: string;
  level: number;
  totalXp: number;
  streak: number;
  onLogout?: () => void;
}

export default function Header({ displayName, level, totalXp, streak, onLogout }: HeaderProps) {
  const [muted, setMuted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Experience calculations: Level threshold is level * 1000 XP
  // Total XP ranges from (level - 1)*1000 to level*1000. Let's showcase progress.
  const prevLevelXp = (level - 1) * 1000;
  const currentLevelXpProgress = totalXp - prevLevelXp;
  const nextLevelThreshold = 1000;
  const xpPercent = Math.min(100, Math.max(5, Math.floor((currentLevelXpProgress / nextLevelThreshold) * 100)));

  const notifications = [
    { id: 1, title: "Commendation!", text: "You completed 3 green action habits in 2 days. +50 XP bonus", time: "2 hrs ago" },
    { id: 2, title: "Insight Alert", text: "Carbon Coach detected 12% lower utility emissions compared to last week.", time: "1 day ago" },
  ];

  return (
    <header id="app-header-container" className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-900 py-3.5 px-6 flex items-center justify-between shadow-xs relative z-30">
      {/* Gamified Streak & XP bar */}
      <div className="flex items-center gap-6 grow max-w-xl">
        {/* Streak Indicator */}
        <div id="streak-indicator" className="flex items-center gap-1.5 bg-orange-50/80 border border-orange-200 px-3 py-1.5 rounded-full select-none cursor-pointer hover:bg-orange-100 transition-colors">
          <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
          <span className="text-orange-700 text-xs font-bold font-sans">{streak}d Streak</span>
        </div>

        {/* XP Progress Slider */}
        <div id="xp-slider" className="flex items-center gap-3 grow select-none">
          <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider shrink-0">XP</span>
          <div className="relative w-full h-2.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-linear-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 shrink-0">
            {currentLevelXpProgress}/{nextLevelThreshold}
          </span>
        </div>
      </div>

      {/* Utility widgets and interactive profiles */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Muted toggle */}
        <button 
          id="sound-player-toggle" 
          onClick={() => setMuted(!muted)}
          title={muted ? "Unmute Eco soundtrack" : "Mute Eco soundtrack"}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            id="notifications-indicator" 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <div id="notifications-backdrop" className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-40 text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-2">
                <h4 className="text-xs font-semibold text-slate-900">Notifications</h4>
                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200/50">2 New</span>
              </div>
              <div className="space-y-3 mt-2">
                {notifications.map(n => (
                  <div key={n.id} className="text-xs hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                    <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3 text-emerald-500" /> {n.title}
                    </p>
                    <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">{n.text}</p>
                    <span className="text-[10px] font-mono text-emerald-600 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button 
          id="settings-trigger"
          title="App settings"
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Profile Card */}
        <div id="user-profile-badge" className="flex items-center gap-2.5">
          <div className="text-right select-none">
            <h5 className="text-xs font-bold text-slate-900 tracking-wide">{displayName}</h5>
            <p className="text-[9px] text-emerald-600 font-mono tracking-wider uppercase mt-0.5 font-bold">Active Warrior</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-sm cursor-pointer shadow-xs">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          {onLogout && (
            <button 
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-all cursor-pointer ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
