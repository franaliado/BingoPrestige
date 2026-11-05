'use client';

import React from 'react';
import { Wallet as WalletIcon, Plus, Crown } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound-system';

interface WalletBadgeProps {
  balance: number;
  vipLevel?: number;
  onDepositClick: () => void;
  className?: string;
}

export const WalletBadge: React.FC<WalletBadgeProps> = ({
  balance,
  vipLevel = 1,
  onDepositClick,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* VIP Badge */}
      <div className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black">
        <Crown className="w-3.5 h-3.5 text-amber-400" />
        <span>VIP {vipLevel}</span>
      </div>

      {/* Wallet Balance Pill */}
      <div className="flex items-center bg-[#0d131f]/90 border border-amber-500/30 rounded-2xl p-1 pl-2.5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1.5 mr-2">
          <WalletIcon className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono text-slate-400 leading-none">
              Saldo
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono leading-tight">
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quick Deposit Button */}
        <button
          onClick={() => {
            soundManager.playChipClick();
            onDepositClick();
          }}
          className="p-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold active:scale-95 transition-all shadow cursor-pointer"
          title="Recargar fondos demo"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

