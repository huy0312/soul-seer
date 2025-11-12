import { useState, useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';
import { subscribeToPlayers } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';

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

        <div className="mt-8 text-center">
          <p className="text-blue-200 text-lg">
            Host đang chấm điểm cho phần thi Về đích...
          </p>
        </div>
      </div>
    </div>
  );
};
