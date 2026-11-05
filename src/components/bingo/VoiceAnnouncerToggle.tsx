'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound-system';

export const VoiceAnnouncerToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
    if (!next) soundManager.playChipClick();
  };

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    soundManager.setVoiceEnabled(next);
    soundManager.playChipClick();
  };

  return (
    <div className="flex items-center gap-1 bg-[#0e1422]/80 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
      {/* Sound FX Toggle */}
      <button
        onClick={toggleMute}
        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
          !isMuted ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-400'
        }`}
        title={isMuted ? 'Activar Sonidos' : 'Silenciar'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Voice Announcer Toggle */}
      <button
        onClick={toggleVoice}
        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
          voiceEnabled ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-400'
        }`}
        title={voiceEnabled ? 'Locución de voz activa' : 'Locución de voz desactivada'}
      >
        {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </button>
    </div>
  );
};

