'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo, type Variants } from 'framer-motion';
import { BingoCardMatrix } from '@/lib/types/database';
import { BingoCard } from './BingoCard';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound-system';

interface CardItem {
  id: string;
  cardNumber: number;
  matrix: BingoCardMatrix;
}

interface CardSwipeCarouselProps {
  cards: CardItem[];
  drawnNumbers: number[];
  onOpenPurchaseModal: () => void;
}

export const CardSwipeCarousel: React.FC<CardSwipeCarouselProps> = ({
  cards,
  drawnNumbers,
  onOpenPurchaseModal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (cards.length === 0) {
    return (
      <div className="w-full max-w-[340px] sm:max-w-[360px] mx-auto rounded-3xl p-6 vip-glass-card text-center border border-dashed border-amber-500/30 flex flex-col items-center justify-center my-2">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mb-3 text-amber-400">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-amber-200 mb-1">Sin cartones activos</h3>
        <p className="text-xs text-slate-400 mb-4 max-w-xs">
          Adquiere tus cartones de la suerte para participar en el Salón VIP Royale.
        </p>
        <button
          onClick={onOpenPurchaseModal}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
        >
          Comprar Cartones
        </button>
      </div>
    );
  }

  const handlePrev = () => {
    if (cards.length <= 1) return;
    soundManager.playChipClick();
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (cards.length <= 1) return;
    soundManager.playChipClick();
    setDirection(1);
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const currentCard = cards[currentIndex] || cards[0];

  const variants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.92,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.92,
      transition: { duration: 0.2, ease: 'easeIn' },
    }),
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Swipeable Card Area */}
      <div className="relative w-full max-w-[360px] overflow-hidden flex items-center justify-center min-h-[380px] touch-pan-y">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentCard.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing"
          >
            <BingoCard
              cardNumber={currentCard.cardNumber}
              matrix={currentCard.matrix}
              drawnNumbers={drawnNumbers}
            />
          </motion.div>
        </AnimatePresence>

        {/* Side Chevrons (Thumb-friendly on mobile) */}
        {cards.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Cartón anterior"
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-r-xl bg-slate-900/80 border-r border-y border-amber-500/30 text-amber-400 hover:text-white transition-all backdrop-blur-sm z-10 cursor-pointer shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Cartón siguiente"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-l-xl bg-slate-900/80 border-l border-y border-amber-500/30 text-amber-400 hover:text-white transition-all backdrop-blur-sm z-10 cursor-pointer shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Card Navigation Dots / Thumb Switcher */}
      <div className="w-full max-w-[340px] flex items-center justify-between mt-2 px-3 py-1.5 bg-[#0b0f17]/90 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {cards.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                soundManager.playChipClick();
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_10px_rgba(212,175,55,0.4)] scale-105'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border border-white/5'
              }`}
            >
              #{c.cardNumber}
            </button>
          ))}
        </div>

        {/* Quick Add More Cards Pill */}
        <button
          onClick={onOpenPurchaseModal}
          className="ml-2 px-3 py-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          + Cartones
        </button>
      </div>

      <p className="text-[10px] text-slate-500 mt-1 font-mono">
        Desliza horizontalmente (swipe) para alternar cartones
      </p>
    </div>
  );
};
