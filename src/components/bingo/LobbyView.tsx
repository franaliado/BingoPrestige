'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound-system';

interface RoomData {
  id: string;
  name: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  borderColor: string;
  startsIn: string;
  players: number;
  progress: number;
  progressColor: string;
  prize: number;
}

interface LobbyViewProps {
  balance: number;
  onSelectRoom: (roomId: string) => void;
  onOpenQuickBuy: () => void;
  className?: string;
}

const ROOMS: RoomData[] = [
  {
    id: 'sala-bronce',
    name: 'Sala Bronce',
    badge: 'B',
    badgeBg: 'bg-gradient-to-br from-[#df9755] to-[#8c4e16]',
    badgeColor: 'text-amber-100',
    borderColor: 'border-amber-700/40',
    startsIn: '04:10',
    players: 20,
    progress: 65,
    progressColor: 'from-[#00E5FF] to-[#22E58B]',
    prize: 1250,
  },
  {
    id: 'sala-plata',
    name: 'Sala Plata',
    badge: 'P',
    badgeBg: 'bg-gradient-to-br from-[#E2E8F0] to-[#64748B]',
    badgeColor: 'text-slate-900 font-black',
    borderColor: 'border-slate-500/40',
    startsIn: '10:00',
    players: 20,
    progress: 40,
    progressColor: 'from-[#C026D3] to-[#38BDF8]',
    prize: 1250,
  },
  {
    id: 'sala-oro',
    name: 'Sala Oro',
    badge: 'O',
    badgeBg: 'bg-gradient-to-br from-[#FDE047] to-[#CA8A04]',
    badgeColor: 'text-amber-950 font-black',
    borderColor: 'border-amber-400/40',
    startsIn: '15:30',
    players: 24,
    progress: 85,
    progressColor: 'from-[#F59E0B] to-[#EF4444]',
    prize: 2500,
  },
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  balance,
  onSelectRoom,
  onOpenQuickBuy,
  className = '',
}) => {
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  const handleNextRoom = () => {
    soundManager.playChipClick();
    setActiveRoomIndex((prev) => (prev + 1) % ROOMS.length);
  };

  const handlePrevRoom = () => {
    soundManager.playChipClick();
    setActiveRoomIndex((prev) => (prev === 0 ? ROOMS.length - 1 : prev - 1));
  };

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col gap-3 select-none pb-20 ${className}`}>
      {/* 1. Header Bar: Lobby Title with Navigation Arrows */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-black text-white tracking-wide">Lobby</h1>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handlePrevRoom}
            className="p-1 rounded-lg hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextRoom}
            className="p-1 rounded-lg hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Horizontal Rooms Cards (Exact replica of Screen 2) */}
      <div className="grid grid-cols-3 gap-2">
        {ROOMS.map((room, idx) => {
          const isActive = idx === activeRoomIndex;
          return (
            <motion.div
              key={room.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundManager.playChipClick();
                setActiveRoomIndex(idx);
                onSelectRoom(room.id);
              }}
              className={`relative rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer transition-all ${
                isActive
                  ? `bg-[#182030]/95 border-2 ${room.borderColor} shadow-[0_8px_25px_rgba(0,0,0,0.6)]`
                  : 'bg-[#101522]/90 border border-white/5 hover:border-white/10'
              }`}
            >
              {/* Room Circular Badge */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-md ${room.badgeBg} ${room.badgeColor}`}
                >
                  {room.badge}
                </div>
              </div>

              {/* Title & Start Time */}
              <div className="mb-2">
                <h3 className="text-xs font-black text-slate-100 truncate">{room.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Inicia {room.startsIn}
                </span>
              </div>

              {/* Players & Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] text-slate-300 font-mono">
                  <Users className="w-3 h-3 text-cyan-400" />
                  <span>{room.players}</span>
                </div>

                {/* Progress line */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${room.progressColor}`}
                    style={{ width: `${room.progress}%` }}
                  />
                </div>

                {/* Prize */}
                <div className="flex items-center gap-1 text-[11px] font-black text-amber-300 font-mono mt-1">
                  <span className="w-3 h-3 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[8px] font-black border border-amber-400/40">
                    $
                  </span>
                  <span>${room.prize.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        {ROOMS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === activeRoomIndex ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* 3. Game Start & Countdown Card */}
      <div className="rounded-2xl p-4 bg-[#121824]/90 border border-[#20293D] shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200">Inicio de Partida</span>
          </div>
          <span className="text-sm font-black text-white font-mono">$1,250.00</span>
        </div>

        {/* Gradient Neon Progress Meter */}
        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden p-0.5">
          <div className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] via-[#10E797] to-[#A855F7] animate-pulse" style={{ width: '75%' }} />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200">Bote Acumulado</span>
          </div>
          <span className="text-base font-black text-amber-300 font-mono">$1,000.00</span>
        </div>
      </div>

      {/* 4. Prizes Breakdown Card (Prizoses) */}
      <div className="rounded-2xl p-4 bg-[#121824]/90 border border-[#20293D] shadow-lg space-y-3">
        <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider font-mono">
          Tabla de Premios
        </h4>

        {/* Line 1 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Premio BINGO Total</span>
            <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[9px] border border-amber-400/40">
                $
              </span>
              <span>$1,250.00</span>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: '90%' }} />
          </div>
        </div>

        {/* Line 2 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Premio Primera Línea</span>
            <div className="flex items-center gap-1 font-mono font-bold text-white">
              <span>29 jugadores</span>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Line 3 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Premio Segunda Línea</span>
            <span className="font-mono font-bold text-emerald-400">$200.00</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full" style={{ width: '45%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

