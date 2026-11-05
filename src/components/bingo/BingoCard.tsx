'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BingoCardMatrix, BingoColumn } from '@/lib/types/database';
import { evaluateCard, matrixToRows } from '@/lib/bingo/rules';
import { soundManager } from '@/lib/audio/sound-system';

interface BingoCardProps {
  cardNumber?: number;
  matrix: BingoCardMatrix;
  drawnNumbers: number[];
  onCellClick?: (cellVal: number | 'FREE', row: number, col: number) => void;
  isInteractive?: boolean;
  className?: string;
}

// Exact colors matching reference image Screen 1:
const COLUMN_HEADERS: Array<{ letter: BingoColumn; bg: string; text: string }> = [
  { letter: 'B', bg: 'bg-[#FF4769]', text: 'text-white' }, // Coral Red
  { letter: 'I', bg: 'bg-[#FFAA00]', text: 'text-white' }, // Amber Yellow
  { letter: 'N', bg: 'bg-[#10E797]', text: 'text-slate-950 font-black' }, // Mint Green
  { letter: 'G', bg: 'bg-[#00C2FF]', text: 'text-white' }, // Cyan Sky Blue
  { letter: 'O', bg: 'bg-[#A855F7]', text: 'text-white' }, // Rich Purple
];

export const BingoCard: React.FC<BingoCardProps> = ({
  cardNumber,
  matrix,
  drawnNumbers,
  onCellClick,
  isInteractive = true,
  className = '',
}) => {
  const drawnSet = useMemo(() => new Set(drawnNumbers), [drawnNumbers]);
  const rows = useMemo(() => matrixToRows(matrix), [matrix]);

  const evalResult = useMemo(() => {
    return evaluateCard(matrix, drawnNumbers);
  }, [matrix, drawnNumbers]);

  const handleCellTap = (cellVal: number | 'FREE', r: number, c: number) => {
    if (!isInteractive) return;
    soundManager.playChipClick();
    if (cellVal !== 'FREE' && drawnSet.has(cellVal)) {
      soundManager.playDaub();
    }
    if (onCellClick) {
      onCellClick(cellVal, r, c);
    }
  };

  return (
    <div
      className={`relative w-full max-w-[340px] sm:max-w-[360px] mx-auto rounded-3xl p-3 sm:p-4 bg-[#141926]/90 backdrop-blur-md border border-[#232B3E] shadow-[0_12px_40px_rgba(0,0,0,0.8)] select-none transition-all duration-300 ${
        evalResult.hasBingo
          ? 'border-2 border-amber-400 shadow-[0_0_35px_rgba(250,204,21,0.5)]'
          : evalResult.hasLine
          ? 'border border-cyan-400/80 shadow-[0_0_20px_rgba(0,194,255,0.3)]'
          : ''
      } ${className}`}
    >
      {/* 5-Column Colorful Headers (B - I - N - G - O) */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {COLUMN_HEADERS.map(({ letter, bg, text }) => (
          <div
            key={letter}
            className={`aspect-square sm:aspect-auto sm:h-12 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-md ${bg} ${text}`}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* 5x5 Number Grid */}
      <div className="grid grid-cols-5 gap-2">
        {rows.map((row, rIdx) =>
          row.map((cellVal, cIdx) => {
            const isFree = cellVal === 'FREE';
            const isDrawn = typeof cellVal === 'number' && drawnSet.has(cellVal);
            const isMarked = isFree || isDrawn;

            return (
              <motion.button
                key={`${rIdx}-${cIdx}`}
                whileTap={isInteractive ? { scale: 0.92 } : undefined}
                onClick={() => handleCellTap(cellVal, rIdx, cIdx)}
                className={`relative aspect-square rounded-2xl flex items-center justify-center font-black transition-all cursor-pointer ${
                  isFree
                    ? 'bg-[#0f1422] border border-amber-500/40 shadow-inner'
                    : isMarked
                    ? 'bg-transparent'
                    : 'bg-[#EFF3F8] hover:bg-white text-slate-900 border border-slate-200/50 shadow-sm'
                }`}
              >
                {/* 1. FREE Center Cell: Golden Star (★) with 'FREE' text */}
                {isFree ? (
                  <div className="flex flex-col items-center justify-center relative">
                    {/* Glowing Star Icon SVG */}
                    <svg
                      className="w-7 h-7 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)] animate-pulse"
                      viewBox="0 0 24 24"
                      fill="url(#starGoldGrad)"
                    >
                      <defs>
                        <linearGradient id="starGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFF8D6" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                    <span className="text-[9px] font-black text-amber-300 font-mono tracking-tighter -mt-1 drop-shadow">
                      FREE
                    </span>
                  </div>
                ) : isMarked ? (
                  /* 2. Marked Cell: Exact 3D Circular Golden Coin Stamp */
                  <div className="w-full h-full rounded-full flex items-center justify-center relative p-0.5">
                    {/* Golden Token Coin Outer Rim */}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFE885] via-[#EAB308] to-[#92400E] p-[2.5px] shadow-[0_4px_12px_rgba(234,179,8,0.5)]">
                      {/* Ribbed Coin Center */}
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFFBEB] via-[#FDE047] to-[#CA8A04] flex items-center justify-center border border-amber-300 shadow-inner">
                        <span className="text-base sm:text-lg font-black text-[#5C3004] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                          {cellVal}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3. Unmarked Cell: Crisp Dark Digits on Light Slate/Off-white */
                  <span className="text-base sm:text-lg font-black text-[#1E293B]">
                    {cellVal}
                  </span>
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {cardNumber !== undefined && (
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="text-amber-400 font-bold">Cartón #{cardNumber}</span>
          <span>{evalResult.hasBingo ? '¡BINGO!' : evalResult.hasLine ? '¡LÍNEA!' : `Faltan: ${evalResult.remainingForBingo}`}</span>
        </div>
      )}
    </div>
  );
};
