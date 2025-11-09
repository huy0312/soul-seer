import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCode } from '@/components/game/QRCode';
import { GameCode } from '@/components/game/GameCode';
import { PlayerList } from '@/components/game/PlayerList';
import {
  getGameByCode,
  getPlayers,
  startGame,
  subscribeToGame,
  subscribeToPlayers,
} from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { Play, Users } from 'lucide-react';

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

const GameLobby = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    let unsubscribeGame: (() => void) | null = null;
    let unsubscribePlayers: (() => void) | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;

    const loadGame = async () => {
      try {
        const { game: gameData, error: gameError } = await getGameByCode(code);
        if (gameError || !gameData) {
          throw gameError || new Error('Game not found');
        }

        setGame(gameData);

        const refreshPlayers = async () => {
          const { players: playersData, error: playersError } = await getPlayers(gameData.id);
          if (!playersError && playersData) {
            setPlayers(playersData);
          }
        };

        // Load initial players
        await refreshPlayers();

        // Subscribe to game changes
        unsubscribeGame = subscribeToGame(gameData.id, (updatedGame) => {
          setGame(updatedGame);
          if (updatedGame.status === 'playing') {
            navigate(`/game/room/${code}`);
          }
        });

        // Subscribe to players changes
        unsubscribePlayers = subscribeToPlayers(gameData.id, (updatedPlayers) => {
          setPlayers(updatedPlayers);
        });

        // Polling fallback - refresh players every 2 seconds
        pollingInterval = setInterval(refreshPlayers, 2000);

        setLoading(false);
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể tải game',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    loadGame();

    return () => {
      if (unsubscribeGame) unsubscribeGame();
      if (unsubscribePlayers) unsubscribePlayers();
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [code, navigate]);

  const handleStartGame = async () => {
    if (!game || players.length < 2) {
      toast({
        title: 'Lỗi',
        description: 'Cần ít nhất 2 người chơi để bắt đầu game',
        variant: 'destructive',
      });
      return;
    }

    setStarting(true);
    try {
      const { error } = await startGame(game.id);
      if (error) throw error;

      toast({
        title: 'Game đã bắt đầu!',
        description: 'Đang chuyển đến phòng game...',
      });

      navigate(`/game/room/${code}`);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể bắt đầu game',
        variant: 'destructive',
      });
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  const canStart = players.length >= 2 && players.length <= 4 && game.status === 'waiting';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Phòng chờ</h1>
            <p className="text-xl text-blue-100">Mã game: {code}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Game Info */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6">
                  <GameCode code={code || ''} />
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-blue-100 mb-2">Quét mã QR để tham gia</p>
                    <QRCode value={`${window.location.origin}/game/join/${code}`} size={200} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Players */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6">
                  <PlayerList players={players} maxPlayers={4} />
                </CardContent>
              </Card>

              {canStart && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6">
                    <Button
                      onClick={handleStartGame}
                      disabled={starting}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {starting ? 'Đang bắt đầu...' : 'Bắt đầu game'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {players.length < 2 && (
                <Card className="bg-yellow-500/20 backdrop-blur-lg border-yellow-300/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-yellow-200">
                      <Users className="h-5 w-5" />
                      <p>Cần ít nhất 2 người chơi để bắt đầu game</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {players.length > 4 && (
                <Card className="bg-red-500/20 backdrop-blur-lg border-red-300/20">
                  <CardContent className="p-6">
                    <p className="text-red-200">
                      Game đã đầy (tối đa 4 người chơi)
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;

