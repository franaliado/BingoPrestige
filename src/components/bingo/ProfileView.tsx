'use client';

import React from 'react';
import { ChevronLeft, LogOut, Shield, Award, Sparkles, Clock, Layers } from 'lucide-react';
import { BingoPrestigeLogo } from '@/components/branding/BingoPrestigeLogo';
import { soundManager } from '@/lib/audio/sound-system';

interface ProfileViewProps {
  balance: number;
  username?: string;
  onBack: () => void;
  onLogout: () => void;
  className?: string;
}

const RECENT_HISTORY = [
  { id: '1', title: 'Partida Cartón #1', date: '04 Nov 2026', room: 'Sala Bronce', status: 'Finalizado' },
  { id: '2', title: 'Partida Cartón #2', date: '04 Nov 2026', room: 'Sala Plata', status: 'Premio Línea' },
  { id: '3', title: 'Partida Cartón #3', date: '03 Nov 2026', room: 'Sala Oro', status: 'Finalizado' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  balance,
  username = 'LordPrestige',
  onBack,
  onLogout,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-md mx-auto flex flex-col gap-4 select-none pb-28 ${className}`}>
      {/* 1. Header with Back Button */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#141926] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-white tracking-wide">Perfil</h1>
        <button
          onClick={() => {
            soundManager.playChipClick();
            onLogout();
          }}
          className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:text-rose-300 transition cursor-pointer"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Brand Identity Logo (Exact Screen 4) */}
      <div className="flex flex-col items-center justify-center py-2">
        <BingoPrestigeLogo size="lg" showSubtitle={false} />
        <span className="text-xs text-slate-400 font-mono mt-1">Usuario: {username}</span>
      </div>

      {/* 3. Achievements / Logros (3 Geometric 3D Gem Badges) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono px-1">
          Logros Desbloqueados
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Badge 1: Purple 3D Cube Gem */}
          <div className="p-3 rounded-2xl bg-[#141a27]/90 border border-purple-500/30 flex flex-col items-center justify-center shadow-lg group hover:border-purple-400 transition">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-400 p-2 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] mb-1">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-300 text-center">Maestro</span>
          </div>

          {/* Badge 2: Golden Shield / Laurel Crest */}
          <div className="p-3 rounded-2xl bg-[#141a27]/90 border border-amber-500/30 flex flex-col items-center justify-center shadow-lg group hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-2 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] mb-1">
              <Award className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <span className="text-[10px] font-bold text-slate-300 text-center">Campeón</span>
          </div>

          {/* Badge 3: Cyan Hexagonal Tech Crest */}
          <div className="p-3 rounded-2xl bg-[#141a27]/90 border border-cyan-500/30 flex flex-col items-center justify-center shadow-lg group hover:border-cyan-400 transition">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 p-2 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-1">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-300 text-center">Prestige</span>
          </div>
        </div>
      </div>

      {/* 4. Balance Bar (Screen 4 exact) */}
      <div className="p-3.5 rounded-2xl bg-[#121824]/90 border border-[#20293D] flex items-center justify-between shadow-md">
        <span className="text-sm font-bold text-slate-300">Balance</span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-black border border-amber-400/40">
            $
          </span>
          <span className="text-base font-black text-amber-300">
            ${balance.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* 5. Recent History (Recente historio) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono px-1">
          Historial Reciente
        </h3>

        <div className="space-y-2">
          {RECENT_HISTORY.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-[#121724]/90 border border-[#20293D] flex items-center justify-between shadow-sm hover:border-slate-600 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1b2333] flex items-center justify-center text-cyan-400 border border-white/5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{item.date} • {item.room}</span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

