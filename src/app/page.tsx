'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BingoPrestigeLogo } from '@/components/branding/BingoPrestigeLogo';
import { Tombola3D } from '@/components/bingo/Tombola3D';
import { BingoCard } from '@/components/bingo/BingoCard';
import { GameControlsBar } from '@/components/bingo/GameControlsBar';
import { LobbyView } from '@/components/bingo/LobbyView';
import { CartonesPurchaseView } from '@/components/bingo/CartonesPurchaseView';
import { ProfileView } from '@/components/bingo/ProfileView';
import { BottomTabBar, TabKey } from '@/components/navigation/BottomTabBar';
import { VIPAuthModal } from '@/components/auth/VIPAuthModal';
import { generateBingoCardMatrix, evaluateCard, getLetterForNumber } from '@/lib/bingo/rules';
import { BingoCardMatrix, BingoColumn } from '@/lib/types/database';
import { soundManager } from '@/lib/audio/sound-system';
import { useRealtimeGame } from '@/hooks/useRealtimeGame';
import {
  drawNextBallAction,
  purchaseCardsAction,
  depositFundsAction,
} from './actions/gameActions';
import {
  getCurrentUserAction,
  signOutAction,
  AuthResponse,
} from './actions/authActions';
import {
  Trophy,
  Users,
  Coins,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  X,
  LogIn,
} from 'lucide-react';

export default function BingoPrestigePage() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<TabKey>('game');

  // Auth state
  const [currentUser, setCurrentUser] = useState<NonNullable<AuthResponse['user']> | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Financial Wallet balance (Zero welcome bonus rule: 0.00 by default, or demo balance)
  const [walletBalance, setWalletBalance] = useState<number>(1250.0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  // Game & Ball state
  const [currentBall, setCurrentBall] = useState<number | null>(35);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([19, 60, 66, 63, 72]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [isAutoDaub, setIsAutoDaub] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // User Cartones
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cards, setCards] = useState<Array<{ id: string; cardNumber: number; matrix: BingoCardMatrix }>>(() => {
    // Generate initial lucky card matching visual sample
    const sampleMatrix = generateBingoCardMatrix();
    return [
      { id: 'card-1', cardNumber: 1, matrix: sampleMatrix },
      { id: 'card-2', cardNumber: 2, matrix: generateBingoCardMatrix() },
      { id: 'card-3', cardNumber: 3, matrix: generateBingoCardMatrix() },
      { id: 'card-4', cardNumber: 4, matrix: generateBingoCardMatrix() },
    ];
  });

  // Victory celebration state
  const [victoryNotification, setVictoryNotification] = useState<{
    type: 'line' | 'bingo';
    amount: number;
    title: string;
  } | null>(null);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load User profile on initial mount
  useEffect(() => {
    async function loadUser() {
      const res = await getCurrentUserAction();
      if (res.success && res.user) {
        setCurrentUser(res.user);
        if (res.user.wallet) {
          setWalletBalance(res.user.wallet.balance);
        }
      }
    }
    loadUser();
  }, []);

  // Supabase Realtime synchronization
  const { isConnected } = useRealtimeGame({
    gameCode: 'BP-ROYALE-001',
    initialDrawnNumbers: drawnNumbers,
    initialCurrentBall: currentBall,
    onNewBallDrawn: (ball, letter, allDrawn) => {
      setCurrentBall(ball);
      setDrawnNumbers(allDrawn);
      checkCardsForWins(allDrawn);
    },
  });

  // Trigger Victory fanfare & fireworks
  const triggerVictory = useCallback((type: 'line' | 'bingo', amount: number) => {
    confetti({
      particleCount: type === 'bingo' ? 120 : 60,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00E5FF', '#10E797', '#FF3377', '#FFAA00', '#D4AF37'],
    });

    if (type === 'bingo') {
      soundManager.playBingoJackpot();
      soundManager.announceVictory('bingo');
    } else {
      soundManager.playLineFanfare();
      soundManager.announceVictory('line');
    }

    setVictoryNotification({
      type,
      amount,
      title: type === 'bingo' ? '¡BINGO PRESTIGE!' : '¡LÍNEA GANADORA!',
    });

    setWalletBalance((prev) => prev + amount);
  }, []);

  // Check cards for line or full house
  const checkCardsForWins = useCallback(
    (allDrawn: number[]) => {
      cards.forEach((card) => {
        const evalResult = evaluateCard(card.matrix, allDrawn);
        if (evalResult.hasBingo) {
          triggerVictory('bingo', 600);
        } else if (
          evalResult.hasLine &&
          evalResult.winningLines.length === 1 &&
          !evalResult.hasBingo
        ) {
          triggerVictory('line', 150);
        }
      });
    },
    [cards, triggerVictory]
  );

  // Extract next ball
  const handleDrawBall = useCallback(async () => {
    if (drawnNumbers.length >= 75) {
      alert('¡Todas las 75 bolas han sido cantadas en esta partida!');
      setIsAutoPlay(false);
      return;
    }

    setIsSpinning(true);
    soundManager.playTombolaRoll();

    try {
      const res = await drawNextBallAction('BP-ROYALE-001', drawnNumbers);
      if (res.success && res.data) {
        const { ball, letter, allDrawn } = res.data;

        setTimeout(() => {
          setIsSpinning(false);
          setCurrentBall(ball);
          setDrawnNumbers(allDrawn);

          soundManager.playBallDrop();
          soundManager.announceBall(letter as BingoColumn, ball);
          checkCardsForWins(allDrawn);
        }, 500);
      }
    } catch (err) {
      setIsSpinning(false);
      console.error(err);
    }
  }, [drawnNumbers, checkCardsForWins]);

  // Auto-play timer loop
  useEffect(() => {
    if (isAutoPlay) {
      autoPlayTimerRef.current = setInterval(() => {
        handleDrawBall();
      }, 4000);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, handleDrawBall]);

  // Card purchase confirmation
  const handleConfirmPurchase = async (quantity: number) => {
    const totalCost = quantity * 5.0;
    if (walletBalance < totalCost) {
      alert('Saldo insuficiente. Por favor, recarga tu saldo.');
      setIsDepositModalOpen(true);
      return;
    }

    const newMatrices: BingoCardMatrix[] = [];
    for (let i = 0; i < quantity; i++) {
      newMatrices.push(generateBingoCardMatrix());
    }

    const res = await purchaseCardsAction('BP-ROYALE-001', newMatrices);
    if (res.success) {
      const startNum = cards.length + 1;
      const newItems = newMatrices.map((mat, i) => ({
        id: `card-${startNum + i}-${Date.now()}`,
        cardNumber: startNum + i,
        matrix: mat,
      }));
      setCards((prev) => [...prev, ...newItems]);
      setWalletBalance((prev) => Math.max(0, prev - totalCost));
      soundManager.playChipClick();
      setActiveTab('game');
    }
  };

  // Deposit funds handler
  const handleDeposit = async (amount: number) => {
    const res = await depositFundsAction(amount);
    if (res.success) {
      setWalletBalance((prev) => prev + amount);
      setIsDepositModalOpen(false);
      soundManager.playChipClick();
    }
  };

  const handleLogout = async () => {
    await signOutAction();
    setCurrentUser(null);
    soundManager.playChipClick();
  };

  const currentCard = cards[activeCardIndex] || cards[0];

  return (
    <div className="min-h-screen w-full bg-[#070A11] text-slate-100 flex flex-col font-sans selection:bg-[#00E5FF] selection:text-black">
      {/* ========================================================================= */}
      {/* DESKTOP TOP NAVIGATION BAR (Visible on >= 1024px)                          */}
      {/* ========================================================================= */}
      <header className="hidden lg:flex w-full items-center justify-between px-8 py-3 bg-[#0B0F19]/95 border-b border-[#1E2638] sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <BingoPrestigeLogo size="sm" showSubtitle={false} className="flex-row gap-2" />

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 font-mono text-xs font-bold">
            <button
              onClick={() => setActiveTab('game')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'game'
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              En Vivo
            </button>
            <button
              onClick={() => setActiveTab('lobby')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'lobby' || activeTab === 'rooms'
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lobby & Salas
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Comprar Cartones
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mi Perfil
            </button>
          </nav>
        </div>

        {/* Right side: Balance badge + User + Sound */}
        <div className="flex items-center gap-3">
          {/* Sound toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              soundManager.setMuted(!isMuted);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#141926] border border-[#232B3E] text-xs font-mono font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            Voces: {isMuted ? 'OFF' : 'ON'}
          </button>

          {/* Golden Balance Badge (Screen 2 exact) */}
          <div className="flex items-center gap-2 bg-[#101624] border border-amber-500/30 rounded-2xl py-1 px-3 shadow-md">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
              $
            </span>
            <span className="text-sm font-black text-amber-300 font-mono">
              ${walletBalance.toFixed(2)}
            </span>
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="p-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition cursor-pointer ml-1"
              title="Recargar fondos"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Profile / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-xs">
                {currentUser.profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-bold text-slate-200">
                {currentUser.profile?.username || 'Miembro'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#10E797] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE TOP BAR (Exact Screen 1 & Screen 2 Mobile View)                     */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full max-w-md mx-auto px-4 pt-3 pb-1 flex items-center justify-between">
        {activeTab === 'game' ? (
          <>
            <button
              onClick={() => setActiveTab('lobby')}
              className="w-9 h-9 rounded-full bg-[#141926] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">Sala Bronce</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#101624] border border-amber-500/30 rounded-2xl py-1 px-2.5 shadow-md">
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-[10px]">
                $
              </span>
              <span className="text-xs font-black text-amber-300 font-mono">
                ${walletBalance.toFixed(2)}
              </span>
            </div>
          </>
        ) : activeTab === 'lobby' ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-xs">
                {currentUser?.profile?.username?.[0]?.toUpperCase() || '👤'}
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#101624] border border-amber-500/30 rounded-2xl py-1 px-3 shadow-md">
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-[10px]">
                $
              </span>
              <span className="text-xs font-black text-amber-300 font-mono">
                ${walletBalance.toFixed(2)}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: ADAPTIVE DESKTOP + 100% FAITHFUL MOBILE                   */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col justify-start">
        {/* VIEW 1: GAME (Exact replica of Screen 1 on Mobile, 3-Column on Desktop) */}
        {activeTab === 'game' && (
          <div className="w-full">
            {/* Desktop 3-Column Layout */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 items-start">
              {/* Left Column: Tómbola & Callout Box & Ball History */}
              <div className="lg:col-span-4 bg-[#0D121F]/90 rounded-3xl p-5 border border-[#1E2638] shadow-xl flex flex-col items-center">
                <Tombola3D
                  currentBall={currentBall}
                  drawnNumbers={drawnNumbers}
                  isSpinning={isSpinning}
                  onDrawManual={handleDrawBall}
                />

                {/* Manual extraction / Auto play desktop controls */}
                <div className="w-full mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDrawBall}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#38BDF8] text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition cursor-pointer"
                  >
                    ¡Cantar Bola!
                  </button>
                  <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border transition cursor-pointer ${
                      isAutoPlay
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isAutoPlay ? 'Auto: ON' : 'Auto: OFF'}
                  </button>
                </div>

                {/* History of Drawn Balls */}
                <div className="w-full mt-4 pt-3 border-t border-white/5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Bolas Extraídas ({drawnNumbers.length}/75)
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {drawnNumbers.slice().reverse().map((num) => {
                      const letter = getLetterForNumber(num);
                      return (
                        <div
                          key={num}
                          className="w-7 h-7 rounded-full bg-[#161D2B] border border-cyan-500/30 flex items-center justify-center text-[10px] font-black text-cyan-300 font-mono shadow-sm"
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Center Column: Interactive 5x5 Bingo Card */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <BingoCard
                  cardNumber={currentCard.cardNumber}
                  matrix={currentCard.matrix}
                  drawnNumbers={drawnNumbers}
                  className="max-w-md w-full"
                />

                {/* Card Switcher tabs */}
                <div className="flex items-center gap-2 mt-3 overflow-x-auto py-1">
                  {cards.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        soundManager.playChipClick();
                        setActiveCardIndex(idx);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                        idx === activeCardIndex
                          ? 'bg-[#10E797] text-slate-950 font-black shadow-md scale-105'
                          : 'bg-[#141926] text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      Cartón #{c.cardNumber}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold hover:bg-purple-500/30 transition cursor-pointer"
                  >
                    + Comprar
                  </button>
                </div>

                {/* Desktop Game Controls Bar */}
                <div className="w-full max-w-md mt-4">
                  <GameControlsBar
                    isMuted={isMuted}
                    onToggleMute={() => {
                      setIsMuted(!isMuted);
                      soundManager.setMuted(!isMuted);
                    }}
                    isAutoDaub={isAutoDaub}
                    onToggleAutoDaub={() => setIsAutoDaub(!isAutoDaub)}
                    onQuickBuy={() => setActiveTab('notifications')}
                  />
                </div>
              </div>

              {/* Right Column: Live Room Info & Prizes Table */}
              <div className="lg:col-span-3 bg-[#0D121F]/90 rounded-3xl p-5 border border-[#1E2638] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-sm font-black text-white">Sala Bronce En Vivo</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    🟢 En Juego
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Bote Acumulado:</span>
                    <span className="text-amber-300 font-bold font-mono">$1,250.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Premio BINGO:</span>
                    <span className="text-white font-bold font-mono">$600.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Premio Línea:</span>
                    <span className="text-white font-bold font-mono">$150.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Jugadores Conectados:</span>
                    <span className="text-cyan-400 font-bold font-mono">24 activos</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#22E58B] to-[#00C9A7] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  Comprar Más Cartones
                </button>
              </div>
            </div>

            {/* Mobile Vertical View (Exact 100% replica of Screen 1) */}
            <div className="lg:hidden flex flex-col items-center gap-2 pb-24">
              {/* Faceted Crystal Tómbola & Callout Box */}
              <Tombola3D
                currentBall={currentBall}
                drawnNumbers={drawnNumbers}
                isSpinning={isSpinning}
                onDrawManual={handleDrawBall}
              />

              {/* Exact 5x5 Bingo Card */}
              <BingoCard
                cardNumber={currentCard.cardNumber}
                matrix={currentCard.matrix}
                drawnNumbers={drawnNumbers}
              />

              {/* Card Switcher thumb dots on mobile */}
              <div className="flex items-center gap-2 my-1">
                {cards.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundManager.playChipClick();
                      setActiveCardIndex(idx);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      idx === activeCardIndex
                        ? 'bg-[#10E797] text-slate-950 shadow-md'
                        : 'bg-[#141926] text-slate-400 border border-white/5'
                    }`}
                  >
                    #{c.cardNumber}
                  </button>
                ))}
              </div>

              {/* Exact 3-Pill Bottom Controls Bar (Voces, Auto-marcar, Compra Rápida) */}
              <GameControlsBar
                isMuted={isMuted}
                onToggleMute={() => {
                  setIsMuted(!isMuted);
                  soundManager.setMuted(!isMuted);
                }}
                isAutoDaub={isAutoDaub}
                onToggleAutoDaub={() => setIsAutoDaub(!isAutoDaub)}
                onQuickBuy={() => setActiveTab('notifications')}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: LOBBY & ROOMS (Exact replica of Screen 2) */}
        {(activeTab === 'lobby' || activeTab === 'rooms') && (
          <LobbyView
            balance={walletBalance}
            onSelectRoom={(roomId) => {
              setActiveTab('game');
            }}
            onOpenQuickBuy={() => setActiveTab('notifications')}
          />
        )}

        {/* VIEW 3: CARTONES PURCHASE (Exact replica of Screen 3) */}
        {activeTab === 'notifications' && (
          <CartonesPurchaseView
            onBack={() => setActiveTab('game')}
            onConfirmPurchase={handleConfirmPurchase}
            cardPrice={5.0}
          />
        )}

        {/* VIEW 4: PERFIL (Exact replica of Screen 4) */}
        {activeTab === 'profile' && (
          <ProfileView
            balance={walletBalance}
            username={currentUser?.profile?.username || 'LordPrestige'}
            onBack={() => setActiveTab('game')}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Floating Bottom Tab Bar for Mobile navigation (Hidden on Desktop) */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        className="lg:hidden"
      />

      {/* Victory Celebration Modal */}
      {victoryNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-gradient-to-b from-[#182338] to-[#0c121e] border-2 border-amber-400 shadow-[0_0_50px_rgba(250,204,21,0.5)] text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl mb-3 animate-bounce">
              <Trophy className="w-9 h-9" />
            </div>

            <h2 className="text-xl font-black text-amber-300 mb-1">
              {victoryNotification.title}
            </h2>
            <p className="text-xs text-slate-300 mb-4 font-mono">
              ¡Premio acreditado a tu billetera!
            </p>

            <div className="py-2 px-6 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-2xl font-black text-amber-300 font-mono mb-5">
              +${victoryNotification.amount.toFixed(2)} USD
            </div>

            <button
              onClick={() => {
                soundManager.playChipClick();
                setVictoryNotification(null);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#10E797] text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer"
            >
              ¡Continuar Jugando!
            </button>
          </div>
        </div>
      )}

      {/* Deposit Modal (Zero bonus, standard top-up) */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-[#121826] border border-[#232B3E] shadow-2xl relative">
            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Recargar Billetera</h3>
                <p className="text-xs text-slate-400 font-mono">Gestión de saldo sin bonos</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {[25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleDeposit(amt)}
                  className="py-3 px-4 rounded-2xl bg-[#192133] hover:bg-[#202b42] border border-amber-500/20 hover:border-amber-400 text-amber-300 font-black text-sm font-mono flex flex-col items-center justify-center transition cursor-pointer"
                >
                  <span>+${amt}.00</span>
                  <span className="text-[10px] text-slate-400 font-sans font-normal">Recarga</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 text-center font-mono">
              Los fondos son acreditados directamente a tu cuenta mediante transacción segura.
            </p>
          </div>
        </div>
      )}

      {/* VIP Auth Modal */}
      <VIPAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user.wallet) {
            setWalletBalance(user.wallet.balance);
          }
        }}
      />
    </div>
  );
}
