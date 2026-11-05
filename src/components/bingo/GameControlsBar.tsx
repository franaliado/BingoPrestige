'use client';

import React from 'react';
import { Volume2, VolumeX, Zap, ShoppingCart } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound-system';

interface GameControlsBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isAutoDaub: boolean;
  onToggleAutoDaub: () => void;
  onQuickBuy: () => void;
  className?: string;
}

export const GameControlsBar: React.FC<GameControlsBarProps> = ({
  isMuted,
  onToggleMute,
  isAutoDaub,
  onToggleAutoDaub,
  onQuickBuy,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-[360px] mx-auto grid grid-cols-3 gap-2.5 select-none ${className}`}>
      {/* 1. Left Pill: Audio & Voices Control */}
      <button
        onClick={() => {
          soundManager.playChipClick();
          onToggleMute();
        }}
        className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#141926]/90 border border-[#232B3E] hover:border-slate-500/50 active:scale-95 transition-all cursor-pointer shadow-lg"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
          <span className={isMuted ? 'text-slate-500' : 'text-cyan-300'}>
            {isMuted ? 'OFF' : 'ON'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono mt-0.5">Voces</span>
      </button>

      {/* 2. Center Pill: Auto-Marcar (Yellow Lightning ⚡) */}
      <button
        onClick={() => {
          soundManager.playChipClick();
          onToggleAutoDaub();
        }}
        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border active:scale-95 transition-all cursor-pointer shadow-lg ${
          isAutoDaub
            ? 'bg-[#182030] border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            : 'bg-[#141926]/90 border-[#232B3E]'
        }`}
      >
        <div className="flex items-center justify-center text-amber-400">
          <Zap className="w-4 h-4 fill-amber-400" />
        </div>
        <span className="text-[11px] font-bold text-slate-200 mt-0.5">Auto-marcar</span>
      </button>

      {/* 3. Right Pill: Compra Rápida (Vibrant Emerald Gradient) */}
      <button
        onClick={() => {
          soundManager.playChipClick();
          onQuickBuy();
        }}
        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#22E58B] to-[#00C9A7] text-slate-950 font-black text-xs uppercase tracking-tight shadow-[0_4px_16px_rgba(34,229,139,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
      >
        <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
        <span>Compra Rápida</span>
      </button>
    </div>
  );
};
