'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart, Check } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound-system';
import { generateBingoCardMatrix } from '@/lib/bingo/rules';
import { BingoCardMatrix } from '@/lib/types/database';

interface CartonesPurchaseViewProps {
  onBack: () => void;
  onConfirmPurchase: (count: number) => Promise<void> | void;
  cardPrice?: number;
  className?: string;
}

const PREVIEW_CARDS = [
  { id: 1, label: '1' },
  { id: 2, label: '3' },
  { id: 3, label: '3' },
  { id: 4, label: '6' },
  { id: 5, label: '6' },
  { id: 6, label: '12' },
];

export const CartonesPurchaseView: React.FC<CartonesPurchaseViewProps> = ({
  onBack,
  onConfirmPurchase,
  cardPrice = 5.0,
  className = '',
}) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate mini matrices for visual display
  const miniMatrices = React.useMemo(() => {
    return Array.from({ length: 6 }).map(() => generateBingoCardMatrix());
  }, []);

  const handleSelectQty = (qty: number) => {
    soundManager.playChipClick();
    setSelectedQuantity(qty);
  };

  const handleConfirm = async () => {
    soundManager.playChipClick();
    setIsSubmitting(true);
    try {
      await onConfirmPurchase(selectedQuantity);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedQuantity * cardPrice;

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col gap-4 select-none pb-28 ${className}`}>
      {/* 1. Top Header with Back Arrow */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#141926] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-white tracking-wide">Cartones</h1>
        <div className="w-9" />
      </div>

      {/* 2. Quantity Selector Pills (1 | 3 | 6 | 12) */}
      <div className="grid grid-cols-4 gap-2.5">
        {[1, 3, 6, 12].map((qty) => {
          const isSelected = selectedQuantity === qty;
          return (
            <motion.button
              key={qty}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelectQty(qty)}
              className={`py-3 rounded-2xl flex flex-col items-center justify-center font-black transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#182a26] border-2 border-[#10E797] text-white shadow-[0_0_20px_rgba(16,231,151,0.3)] scale-[1.02]'
                  : 'bg-[#121724]/90 border border-[#20293D] text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xl font-black">{qty}</span>
            </motion.button>
          );
        })}
      </div>

      {/* 3. Section Title: Choose cartones */}
      <div className="px-1 pt-1">
        <h2 className="text-sm font-bold text-slate-300 tracking-wide">
          Elegir cartones
        </h2>
      </div>

      {/* 4. Mini Cartones Grid (Exact replication of Screen 3) */}
      <div className="grid grid-cols-3 gap-2.5">
        {PREVIEW_CARDS.map((card, idx) => {
          const isHighlighted = idx < selectedQuantity;
          return (
            <div
              key={card.id}
              className={`rounded-2xl p-2 bg-[#121724]/95 border transition-all flex flex-col items-center justify-between ${
                isHighlighted
                  ? 'border-[#10E797]/60 shadow-[0_4px_16px_rgba(16,231,151,0.15)]'
                  : 'border-[#20293D]'
              }`}
            >
              {/* Mini Colorful B-I-N-G-O bar */}
              <div className="grid grid-cols-5 gap-0.5 w-full mb-1.5">
                <span className="h-3 rounded-sm bg-[#FF4769] text-[7px] font-black text-white flex items-center justify-center">
                  B
                </span>
                <span className="h-3 rounded-sm bg-[#FFAA00] text-[7px] font-black text-white flex items-center justify-center">
                  I
                </span>
                <span className="h-3 rounded-sm bg-[#10E797] text-[7px] font-black text-slate-950 flex items-center justify-center">
                  N
                </span>
                <span className="h-3 rounded-sm bg-[#00C2FF] text-[7px] font-black text-white flex items-center justify-center">
                  G
                </span>
                <span className="h-3 rounded-sm bg-[#A855F7] text-[7px] font-black text-white flex items-center justify-center">
                  O
                </span>
              </div>

              {/* Mini 5x5 Grid representation */}
              <div className="grid grid-cols-5 gap-0.5 w-full aspect-square bg-[#0a0e17] rounded-lg p-1 border border-white/5">
                {Array.from({ length: 25 }).map((_, cIdx) => {
                  const isFree = cIdx === 12;
                  const isFilled = (idx + cIdx) % 3 === 0;
                  return (
                    <div
                      key={cIdx}
                      className={`rounded-sm flex items-center justify-center ${
                        isFree
                          ? 'bg-amber-400/40 text-[6px] text-amber-300 font-bold'
                          : isFilled
                          ? 'bg-slate-300/80'
                          : 'bg-[#182030]'
                      }`}
                    >
                      {isFree && '★'}
                    </div>
                  );
                })}
              </div>

              {/* Label underneath */}
              <span className="text-[10px] font-mono text-slate-400 mt-1 font-bold">
                {card.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 5. Bottom Confirmation Bar (Fixed/Sticky above BottomTabBar) */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 py-2 z-30">
        <div className="text-center text-xs font-bold text-slate-300 font-mono mb-2 drop-shadow">
          Total: <span className="text-white font-black">{selectedQuantity} Cartones</span> •{' '}
          <span className="text-emerald-400 font-black">${totalPrice.toFixed(2)} USD</span>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#22E58B] to-[#00C9A7] text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_4px_25px_rgba(34,229,139,0.4)] hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
          <span>{isSubmitting ? 'Confirmando...' : 'CONFIRMAR COMPRA'}</span>
        </button>
      </div>
    </div>
  );
};

