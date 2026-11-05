'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Game, GameWinner, BingoColumn } from '@/lib/types/database';
import { getLetterForNumber } from '@/lib/bingo/rules';
import { soundManager } from '@/lib/audio/sound-system';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeGameProps {
  gameCode?: string;
  initialDrawnNumbers?: number[];
  initialCurrentBall?: number | null;
  onNewBallDrawn?: (ball: number, letter: BingoColumn, allDrawn: number[]) => void;
  onWinnerAnnounced?: (winner: GameWinner) => void;
}

export function useRealtimeGame({
  gameCode = 'BP-ROYALE-001',
  initialDrawnNumbers = [],
  initialCurrentBall = null,
  onNewBallDrawn,
  onWinnerAnnounced,
}: UseRealtimeGameProps) {
  const [currentBall, setCurrentBall] = useState<number | null>(initialCurrentBall);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>(initialDrawnNumbers);
  const [gameState, setGameState] = useState<Game['status']>('waiting');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Check if valid supabase URL is provided (not placeholder)
    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder.supabase.co');

    if (!isConfigured) {
      // Local simulated mode
      setIsConnected(false);
      return;
    }

    // Create Realtime Channel for the room
    const channel = supabase
      .channel(`room:${gameCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `game_code=eq.${gameCode}`,
        },
        (payload) => {
          const updatedGame = payload.new as Game;
          if (updatedGame) {
            setGameState(updatedGame.status);
            setDrawnNumbers(updatedGame.drawn_numbers || []);

            if (updatedGame.current_ball !== null && updatedGame.current_ball !== currentBall) {
              const ball = updatedGame.current_ball;
              const letter = getLetterForNumber(ball);
              setCurrentBall(ball);

              // Sound & Voice
              soundManager.playBallDrop();
              soundManager.announceBall(letter, ball);

              if (onNewBallDrawn) {
                onNewBallDrawn(ball, letter, updatedGame.drawn_numbers);
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_winners',
        },
        (payload) => {
          const winner = payload.new as GameWinner;
          if (winner && onWinnerAnnounced) {
            onWinnerAnnounced(winner);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [gameCode, currentBall, onNewBallDrawn, onWinnerAnnounced]);

  return {
    currentBall,
    drawnNumbers,
    gameState,
    isConnected,
    setCurrentBall,
    setDrawnNumbers,
  };
}

