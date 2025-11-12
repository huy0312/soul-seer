import { useState, useEffect, useRef } from 'react';
import type { Database } from '@/integrations/supabase/types';
import { subscribeToPlayers, emitVeDichSignal, createVeDichTimerChannel } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Hand } from 'lucide-react';

type Player = Database['public']['Tables']['players']['Row'];

interface Round4VeDichProps {
  players: Player[];
  currentPlayerId: string;
  gameId: string;
  onRoundComplete: () => void;
}

export const Round4VeDich: React.FC<Round4VeDichProps> = ({
  players,
  currentPlayerId,
  gameId,
  onRoundComplete,
}) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [hasSignaled, setHasSignaled] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const timerStartRef = useRef<number | null>(null);

  // Initialize from props if available
  useEffect(() => {
    const playerFromProps = players.find((p) => p.id === currentPlayerId);
    if (playerFromProps) {
      setCurrentPlayer(playerFromProps);
    }
  }, [players, currentPlayerId]);

  // Subscribe to player score updates
  useEffect(() => {
    const loadPlayer = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', currentPlayerId)
        .single();
      
      if (!error && data) {
        setCurrentPlayer(data);
      } else {
        // Fallback: try to find from props
        const playerFromProps = players.find((p) => p.id === currentPlayerId);
        if (playerFromProps) {
          setCurrentPlayer(playerFromProps);
        }
      }
    };

    // Load immediately
    loadPlayer();

    const unsubscribe = subscribeToPlayers(gameId, (updatedPlayers) => {
      const player = updatedPlayers.find((p) => p.id === currentPlayerId);
      if (player) {
        setCurrentPlayer(player);
      } else {
        // If not found in updated list, try to reload
        loadPlayer();
      }
    });

    // Polling fallback - refresh every 2 seconds
    const pollingInterval = setInterval(() => {
      loadPlayer();
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(pollingInterval);
    };
  }, [gameId, currentPlayerId, players]);

  // Subscribe to timer events
  useEffect(() => {
    const unsubscribe = createVeDichTimerChannel(gameId, (evt) => {
      if (evt.type === 'start') {
        const durationSec = Number(evt.payload?.durationSec) || 30;
        const startedAt = Number(evt.payload?.startedAt) || Date.now();
        const endAt = startedAt + durationSec * 1000;

        if (timerStartRef.current !== startedAt) {
          timerStartRef.current = startedAt;
          setTimerActive(true);
        }

        if (timerIntervalRef.current) {
          window.clearInterval(timerIntervalRef.current);
        }

        const tick = () => {
          const now = Date.now();
          const remainingMs = Math.max(0, endAt - now);
          setRemaining(Math.ceil(remainingMs / 1000));
          if (remainingMs <= 0) {
            setTimerActive(false);
            if (timerIntervalRef.current) {
              window.clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
          }
        };

        tick();
        timerIntervalRef.current = window.setInterval(tick, 200);
      }

      if (evt.type === 'stop') {
        setTimerActive(false);
        setRemaining(0);
        if (timerIntervalRef.current) {
          window.clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        timerStartRef.current = null;
      }
    });

    return () => {
      unsubscribe();
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameId]);

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <p className="text-blue-200 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">Phần 4 - Về đích</h1>
          <p className="text-2xl text-blue-200 mb-8">{currentPlayer.name}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border-4 border-yellow-400 rounded-3xl p-12 shadow-2xl">
          <div className="text-center">
            <p className="text-3xl text-blue-200 mb-6">Điểm số của bạn</p>
            <div className="text-9xl font-extrabold text-yellow-400 drop-shadow-lg">
              {currentPlayer.score}
            </div>
            <p className="text-xl text-blue-200 mt-6">Điểm số được cập nhật theo thời gian thực</p>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-blue-200 text-lg">
            Host đang chấm điểm cho phần thi Về đích...
          </p>
          
          <Button
            onClick={async () => {
              if (!currentPlayer) return;
              
              try {
                await emitVeDichSignal(gameId, currentPlayerId, currentPlayer.name);
                setHasSignaled(true);
              } catch (error) {
                console.error('Error sending signal:', error);
              }
            }}
            disabled={hasSignaled}
            className={`text-lg px-8 py-6 ${
              hasSignaled
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white font-bold'
            }`}
            size="lg"
          >
            <Hand className="h-6 w-6 mr-2" />
            {hasSignaled ? 'Đã thông báo có câu trả lời' : 'Có câu trả lời'}
          </Button>
        </div>
      </div>
    </div>
  );
};
