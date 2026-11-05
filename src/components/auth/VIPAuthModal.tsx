'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInAction, signUpAction, AuthResponse } from '@/app/actions/authActions';
import { soundManager } from '@/lib/audio/sound-system';
import { BingoPrestigeLogo } from '@/components/branding/BingoPrestigeLogo';
import {
  X,
  Lock,
  Mail,
  User,
  Crown,
  Sparkles,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';

interface VIPAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthSuccess: (user: NonNullable<AuthResponse['user']>) => void;
  defaultTab?: 'login' | 'register';
  isMandatory?: boolean;
}

export const VIPAuthModal: React.FC<VIPAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultTab = 'login',
  isMandatory = false,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playChipClick();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await signInAction({ email, password });
        if (res.success && res.user) {
          setSuccessMessage(res.message || 'Bienvenido al Salón VIP');
          soundManager.playBallDrop();
          setTimeout(() => {
            onAuthSuccess(res.user!);
            if (onClose) onClose();
          }, 600);
        } else {
          setErrorMessage(res.error || 'Credenciales no válidas');
        }
      } else {
        const res = await signUpAction({ email, password, username, fullName });
        if (res.success && res.user) {
          setSuccessMessage(res.message || 'Membresía creada con éxito');
          soundManager.playBallDrop();
          setTimeout(() => {
            onAuthSuccess(res.user!);
            if (onClose) onClose();
          }, 800);
        } else {
          setErrorMessage(res.error || 'No se pudo completar el registro');
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg">
          {!isMandatory && onClose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0"
            />
          )}

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#141b2b] via-[#0d121c] to-[#080b11] rounded-3xl border border-amber-500/40 p-5 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.15)] overflow-hidden"
          >
            {/* Top decorative gold line */}
            <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            {!isMandatory && onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Logo and Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <BingoPrestigeLogo size="md" showSubtitle={true} className="justify-center" />
              <p className="text-xs text-slate-400 font-mono mt-2">
                Acceso exclusivo al Salón Royale VIP
              </p>
            </div>

            {/* Tabs: Login / Register */}
            <div className="grid grid-cols-2 p-1 bg-[#090d14] rounded-2xl border border-amber-500/20 mb-5">
              <button
                type="button"
                onClick={() => {
                  soundManager.playChipClick();
                  setTab('login');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${tab === 'login'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Acceso VIP
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playChipClick();
                  setTab('register');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${tab === 'register'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Nueva Membresía
              </button>
            </div>

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">
                      Nombre de Usuario VIP
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ej: LordPrestige"
                        className="w-full bg-[#0a0e17] border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">
                      Nombre Completo (Opcional)
                    </label>
                    <div className="relative">
                      <Crown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre oficial"
                        className="w-full bg-[#0a0e17] border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vip@bingoprestige.com"
                    className="w-full bg-[#0a0e17] border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">
                  Contraseña Secreta
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0e17] border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tab === 'register' && (
                <div className="p-2.5 bg-[#080c14] rounded-xl border border-white/5 text-[10px] text-amber-300/80 font-mono text-center">
                  ⚠️ Membresía VIP pura: Saldo inicial $0.00 USD (sin bono de bienvenida).
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <span>
                      {tab === 'login' ? 'Entrar a la Sala' : 'Activar Membresía'}
                    </span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

