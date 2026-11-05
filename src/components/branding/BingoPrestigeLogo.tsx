'use client';

import React from 'react';

interface BingoPrestigeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  className?: string;
}

export const BingoPrestigeLogo: React.FC<BingoPrestigeLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { emblemSize: 36, titleSize: 'text-base', subSize: 'text-[9px]' },
    md: { emblemSize: 52, titleSize: 'text-xl', subSize: 'text-[10px]' },
    lg: { emblemSize: 68, titleSize: 'text-2xl', subSize: 'text-xs' },
    hero: { emblemSize: 92, titleSize: 'text-3xl sm:text-4xl', subSize: 'text-sm' },
  };

  const { emblemSize, titleSize, subSize } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D Gilded Crown + Flowing Neon Gradient 'B' + Glossy Dice */}
      <div className="relative flex items-center justify-center">
        {/* Soft aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-lg transform scale-125" />

        <svg
          width={emblemSize}
          height={emblemSize * 0.9}
          viewBox="0 0 120 108"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_8px_20px_rgba(168,85,247,0.35)]"
        >
          <defs>
            {/* Crown Gold Gradient */}
            <linearGradient id="logoCrownGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8D6" />
              <stop offset="40%" stopColor="#F5CD58" />
              <stop offset="75%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#966D1B" />
            </linearGradient>

            {/* Vibrant Pink to Purple to Cyan gradient for the 'B' */}
            <linearGradient id="neonGradientB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3377" />
              <stop offset="45%" stopColor="#C026D3" />
              <stop offset="80%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>

            {/* 3D Dice Gradients */}
            <linearGradient id="diceTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#D1D5DB" />
            </linearGradient>
            <linearGradient id="diceSide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E5E7EB" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
            <linearGradient id="diceDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9CA3AF" />
              <stop offset="100%" stopColor="#6B7280" />
            </linearGradient>
          </defs>

          {/* Golden Crown on top of letter B */}
          <path
            d="M 45 32 L 40 18 L 51 24 L 60 12 L 69 24 L 80 18 L 75 32 Z"
            fill="url(#logoCrownGold)"
            stroke="#966D1B"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Jewels on Crown Tips */}
          <circle cx="40" cy="18" r="2.2" fill="#FFFFFF" />
          <circle cx="51" cy="23" r="2" fill="#FF5376" />
          <circle cx="60" cy="12" r="2.6" fill="#00E5FF" />
          <circle cx="69" cy="23" r="2" fill="#FFB800" />
          <circle cx="80" cy="18" r="2.2" fill="#FFFFFF" />

          {/* Stylized Modern Gradient 'B' */}
          <path
            d="M 42 35 C 42 32 44 30 47 30 L 64 30 C 73 30 80 36 80 44 C 80 49 77 53 72 55 C 78 57 82 62 82 69 C 82 78 74 85 64 85 L 47 85 C 44 85 42 83 42 80 Z"
            fill="url(#neonGradientB)"
            filter="drop-shadow(0 4px 10px rgba(192, 38, 211, 0.4))"
          />
          {/* Inner counter top */}
          <path
            d="M 52 40 L 63 40 C 67 40 70 42 70 46 C 70 50 67 52 63 52 L 52 52 Z"
            fill="#0F1420"
          />
          {/* Inner counter bottom */}
          <path
            d="M 52 60 L 64 60 C 69 60 72 63 72 67 C 72 71 69 74 64 74 L 52 74 Z"
            fill="#0F1420"
          />

          {/* 3D Dice on the left of B */}
          <g transform="translate(18, 52) rotate(-15)">
            {/* Top face */}
            <polygon points="12,0 24,6 12,12 0,6" fill="url(#diceTop)" />
            {/* Left face */}
            <polygon points="0,6 12,12 12,24 0,18" fill="url(#diceSide)" />
            {/* Right face */}
            <polygon points="12,12 24,6 24,18 12,24" fill="url(#diceDark)" />
            {/* Dice pips */}
            <circle cx="12" cy="6" r="1.5" fill="#C026D3" />
            <circle cx="5" cy="13" r="1.3" fill="#1F2937" />
            <circle cx="7" cy="17" r="1.3" fill="#1F2937" />
            <circle cx="17" cy="13" r="1.3" fill="#1F2937" />
            <circle cx="19" cy="17" r="1.3" fill="#1F2937" />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col items-center mt-0.5">
        <div className="flex items-center tracking-wider font-black leading-none">
          <span className={`text-white ${titleSize} font-sans tracking-[0.14em] drop-shadow-md`}>
            BINGO
          </span>
          <span className={`ml-1.5 vip-gradient-gold-text ${titleSize} font-sans tracking-[0.18em]`}>
            PRESTIGE
          </span>
        </div>

        {showSubtitle && (
          <span className={`${subSize} tracking-[0.24em] font-semibold uppercase text-cyan-400/90 font-mono mt-0.5`}>
            75 BALLS • ENTERTAINMENT
          </span>
        )}
      </div>
    </div>
  );
};
