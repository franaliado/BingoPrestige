'use client';

import React from 'react';
import { Home, Globe, Bell, User, LayoutGrid } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound-system';

export type TabKey = 'lobby' | 'rooms' | 'game' | 'notifications' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  className?: string;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  const handleTap = (tab: TabKey) => {
    soundManager.playChipClick();
    onTabChange(tab);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-3 pt-1 select-none pointer-events-none ${className}`}
    >
      {/* Floating Dark Glass Curved Nav Bar */}
      <div className="relative flex items-center justify-between px-3 py-2 bg-[#0C111C]/95 backdrop-blur-xl rounded-3xl border border-[#20293D] shadow-[0_10px_35px_rgba(0,0,0,0.8)] pointer-events-auto">
        {/* 1. Home / Lobby */}
        <button
          onClick={() => handleTap('lobby')}
          aria-label="Lobby"
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'lobby' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Home className="w-5 h-5" />
        </button>

        {/* 2. Globe / Rooms */}
        <button
          onClick={() => handleTap('rooms')}
          aria-label="Salas de Bingo"
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'rooms' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Globe className="w-5 h-5" />
        </button>

        {/* 3. Central Raised Glowing Action Button: Play Live Game */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={() => handleTap('game')}
            aria-label="Jugar En Vivo"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#A855F7] to-[#C026D3] flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.6),inset_0_2px_4px_rgba(255,255,255,0.6)] active:scale-95 transition-all cursor-pointer border-2 border-white/20"
          >
            {/* 9-dot grid icon representing Bingo Card */}
            <LayoutGrid className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* 4. Notifications */}
        <button
          onClick={() => handleTap('notifications')}
          aria-label="Notificaciones"
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'notifications' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => handleTap('profile')}
          aria-label="Perfil"
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

