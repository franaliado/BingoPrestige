'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateBingoCardMatrix } from '@/lib/bingo/rules';
import { BingoCardMatrix } from '@/lib/types/database';
import { soundManager } from '@/lib/audio/sound-system';
import { X, Sparkles, ShieldCheck, RefreshCw, Wallet as WalletIcon, Layers } from 'lucide-react';

interface PurchaseCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardPrice?: number;
  walletBalance: number;
  onConfirmPurchase: (cards: BingoCardMatrix[]) => Promise<void> | void;
}

export const PurchaseCardModal: React.FC<PurchaseCardModalProps> = ({
  isOpen,
  onClose,
  cardPrice = 5.0,
  walletBalance,
  onConfirmPurchase,
}) => {
  const [selectedCount, setSelectedCount] = useState<number>(2);
  const [generatedCards, setGeneratedCards] = useState<BingoCardMatrix[]>(() => [
    generateBingoCardMatrix(),
    generateBingoCardMatrix(),
  ]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleCountChange = (count: number) => {
    soundManager.playChipClick();
    setSelectedCount(count);
    const newCards: BingoCardMatrix[] = [];
    for (let i = 0; i < count; i++) {
      newCards.push(generateBingoCardMatrix());
    }
    setGeneratedCards(newCards);
  };

  const handleRegenerateCards = () => {
    soundManager.playChipClick();
    const newCards: BingoCardMatrix[] = [];
    for (let i = 0; i < selectedCount; i++) {
      newCards.push(generateBingoCardMatrix());
    }
    setGeneratedCards(newCards);
  };

  const totalCost = selectedCount * cardPrice;
  const hasSufficientBalance = walletBalance >= totalCost;

  const handleBuy = async () => {
    if (!hasSufficientBalance) {
      alert('Saldo insuficiente. Por favor, recarga tu billetera VIP.');
      return;
    }
    soundManager.playChipClick();
    setIsPurchasing(true);
    try {
      await onConfirmPurchase(generatedCards);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg bg-gradient-to-b from-[#161d2d] via-[#10141f] to-[#090c13] rounded-t-3xl sm:rounded-3xl border border-amber-500/30 p-5 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-wide text-white flex items-center gap-1.5">
                    Adquirir Cartones VIP
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h2>
                  <p className="text-xs text-amber-300/80 font-mono">
                    Salón Royale Prestige • 75 Bolas
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Package Selector */}
            <div className="my-4">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 font-mono">
                Selecciona la cantidad de cartones
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 6].map((count) => {
                  const isSelected = selectedCount === count;
                  return (
                    <button
                      key={count}
                      onClick={() => handleCountChange(count)}
                      className={`py-3 rounded-2xl flex flex-col items-center justify-center font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-102 border-2 border-white/40'
                          : 'bg-[#1a2233]/70 hover:bg-[#202b40] text-slate-300 border border-white/10'
                      }`}
                    >
                      <span className="text-base sm:text-lg font-black">{count}</span>
                      <span className="text-[10px] tracking-tight uppercase opacity-85">
                        {count === 1 ? 'Cartón' : 'Cartones'}
                      </span>
                      {count === 6 && (
                        <span className="mt-0.5 text-[8px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-black uppercase">
                          VIP MAX
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lucky Numbers Preview Card */}
            <div className="p-3.5 bg-[#0b0e16]/80 rounded-2xl border border-amber-500/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Números de la suerte generados ({selectedCount})
                </span>
                <button
                  onClick={handleRegenerateCards}
                  className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1 font-mono transition-all cursor-pointer"
                  title="Generar nuevas combinaciones aleatorias"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-mezclar</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {generatedCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[#141a27] rounded-xl border border-white/10 flex-shrink-0 text-center w-28"
                  >
                    <span className="text-[10px] font-mono text-amber-300/80 block">
                      Cartón #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-200 font-bold block truncate">
                      B:{card.B[0]}-{card.B[1]} | O:{card.O[3]}-{card.O[4]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 bg-[#0e131e] rounded-2xl border border-white/10 space-y-2 mb-4 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Precio unitario:</span>
                <span className="text-white">${cardPrice.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cantidad:</span>
                <span className="text-white">{selectedCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tu saldo disponible:</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    hasSufficientBalance ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <WalletIcon className="w-3.5 h-3.5" />
                  ${walletBalance.toFixed(2)} USD
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold">
                <span className="text-white">Total a pagar:</span>
                <span className="text-amber-400 text-base font-black">
                  ${totalCost.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Security Guarantee badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mb-4">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Transacción cifrada y protegida por Supabase RLS</span>
            </div>

            {/* Action Button */}
            <button
              onClick={handleBuy}
              disabled={isPurchasing || !hasSufficientBalance}
              className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hasSufficientBalance
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10'
              }`}
            >
              {isPurchasing ? (
                <span>Confirmando en Servidor...</span>
              ) : hasSufficientBalance ? (
                <>
                  <span>Confirmar Compra • ${totalCost.toFixed(2)}</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <span>Saldo Insuficiente</span>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

