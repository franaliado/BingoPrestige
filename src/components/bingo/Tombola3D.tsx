'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLetterForNumber } from '@/lib/bingo/rules';
import { BingoColumn } from '@/lib/types/database';
import { soundManager } from '@/lib/audio/sound-system';

interface Tombola3DProps {
  currentBall: number | null;
  drawnNumbers: number[];
  isSpinning?: boolean;
  onDrawManual?: () => void;
  className?: string;
}

const BALL_COLORS = [
  { bg: 'from-cyan-400 via-sky-500 to-blue-600', shadow: 'rgba(56, 189, 248, 0.6)' },
  { bg: 'from-pink-400 via-rose-500 to-fuchsia-600', shadow: 'rgba(244, 63, 94, 0.6)' },
  { bg: 'from-amber-300 via-yellow-400 to-amber-500', shadow: 'rgba(251, 191, 36, 0.6)' },
  { bg: 'from-emerald-300 via-green-400 to-emerald-600', shadow: 'rgba(52, 211, 153, 0.6)' },
  { bg: 'from-purple-400 via-violet-500 to-indigo-600', shadow: 'rgba(168, 85, 247, 0.6)' },
];

export const Tombola3D: React.FC<Tombola3DProps> = ({
  currentBall,
  drawnNumbers,
  isSpinning = false,
  onDrawManual,
  className = '',
}) => {
  const currentLetter: BingoColumn = useMemo(() => {
    if (!currentBall) return 'N';
    return getLetterForNumber(currentBall);
  }, [currentBall]);

  // Floating glossy balls inside the faceted crystal dome
  const insideBalls = useMemo(() => {
    return [
      { id: 1, label: 'N', x: 26, y: 55, size: 28, color: BALL_COLORS[1] },
      { id: 2, label: currentBall ? String(currentBall) : '35', x: 44, y: 40, size: 38, color: BALL_COLORS[0], isMain: true },
      { id: 3, label: '3', x: 68, y: 52, size: 26, color: BALL_COLORS[3] },
      { id: 4, label: 'B', x: 38, y: 22, size: 24, color: BALL_COLORS[0] },
      { id: 5, label: '12', x: 58, y: 26, size: 24, color: BALL_COLORS[1] },
      { id: 6, label: 'G', x: 32, y: 68, size: 25, color: BALL_COLORS[4] },
      { id: 7, label: '54', x: 54, y: 66, size: 27, color: BALL_COLORS[2] },
    ];
  }, [currentBall]);

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* 1. Neon Glowing Ball Callout Badge (Exact match: [ N 35 ]) */}
      <motion.div
        animate={isSpinning ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="relative px-6 py-2 rounded-2xl bg-[#0e1422]/90 backdrop-blur-md mb-2 flex items-center justify-center border-2 border-transparent shadow-[0_0_25px_rgba(0,229,255,0.35),0_0_20px_rgba(255,51,119,0.3)]"
        style={{
          borderImage: 'linear-gradient(135deg, #FF3377 0%, #C026D3 50%, #00E5FF 100%) 1',
          borderRadius: '16px',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Neon Pink/Magenta Letter */}
          <span className="text-2xl sm:text-3xl font-black text-[#FF3377] tracking-wider drop-shadow-[0_0_12px_rgba(255,51,119,0.8)]">
            {currentLetter}
          </span>
          {/* Neon Cyan/White Number */}
          <span className="text-3xl sm:text-4xl font-black text-[#00E5FF] tracking-tight drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]">
            {currentBall ?? 35}
          </span>
        </div>
      </motion.div>

      {/* 2. Faceted Polyhedron Crystal Glass Tómbola */}
      <div
        onClick={() => {
          soundManager.playTombolaRoll();
          if (onDrawManual) onDrawManual();
        }}
        className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center cursor-pointer group"
        title="Toca para cantar bola"
      >
        {/* Outer Crystal Facet Cage (SVG Icosahedron) */}
        <svg
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_30px_rgba(56,189,248,0.25)] pointer-events-none z-20"
          viewBox="0 0 200 200"
          fill="none"
        >
          {/* Polyhedron Outer Edge */}
          <polygon
            points="100,10 165,45 190,110 160,175 100,195 40,175 10,110 35,45"
            fill="url(#crystalGrad)"
            stroke="url(#crystalStroke)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Internal Facet Triangles / Geometric Planes */}
          <line x1="100" y1="10" x2="100" y2="70" stroke="#7DD3FC" strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="70" x2="165" y2="45" stroke="#7DD3FC" strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="70" x2="35" y2="45" stroke="#7DD3FC" strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="70" x2="150" y2="120" stroke="#7DD3FC" strokeWidth="1" opacity="0.5" />
          <line x1="100" y1="70" x2="50" y2="120" stroke="#7DD3FC" strokeWidth="1" opacity="0.5" />
          <line x1="50" y1="120" x2="100" y2="150" stroke="#7DD3FC" strokeWidth="1" opacity="0.6" />
          <line x1="150" y1="120" x2="100" y2="150" stroke="#7DD3FC" strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="150" x2="100" y2="195" stroke="#7DD3FC" strokeWidth="1" opacity="0.7" />
          <line x1="50" y1="120" x2="10" y2="110" stroke="#7DD3FC" strokeWidth="1" opacity="0.5" />
          <line x1="150" y1="120" x2="190" y2="110" stroke="#7DD3FC" strokeWidth="1" opacity="0.5" />

          {/* Top highlight specular facet */}
          <polygon
            points="100,10 140,32 100,50 60,32"
            fill="url(#specularGleam)"
            opacity="0.4"
          />

          <defs>
            <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0E1726" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#1E293B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0B111E" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="crystalStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="30%" stopColor="#38BDF8" />
              <stop offset="70%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="specularGleam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating 3D Glossy Bingo Balls inside the Faceted Polyhedron */}
        <div className="absolute inset-4 rounded-full overflow-hidden flex items-center justify-center z-10">
          {insideBalls.map((b) => (
            <motion.div
              key={b.id}
              className={`absolute rounded-full bg-gradient-to-br ${b.color.bg} flex items-center justify-center font-black text-slate-950 shadow-lg`}
              style={{
                width: b.size,
                height: b.size,
                left: `${b.x}%`,
                top: `${b.y}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 15px ${b.color.shadow}, inset 2px 2px 4px rgba(255,255,255,0.7), inset -2px -2px 4px rgba(0,0,0,0.5)`,
              }}
              animate={
                isSpinning
                  ? {
                      x: [0, (Math.random() - 0.5) * 40, 0],
                      y: [0, (Math.random() - 0.5) * 40, 0],
                      rotate: [0, 360],
                    }
                  : {
                      y: [0, -4, 0],
                    }
              }
              transition={{
                duration: isSpinning ? 0.3 : 2 + b.id * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Ball highlight sheen */}
              <div className="absolute top-1 left-1.5 w-2.5 h-2 rounded-full bg-white/60 transform -rotate-45 pointer-events-none" />
              <span className={`leading-none ${b.isMain ? 'text-base font-black' : 'text-xs font-bold'}`}>
                {b.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
