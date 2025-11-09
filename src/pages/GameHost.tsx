import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoundDisplay } from '@/components/game/RoundDisplay';
import { Scoreboard } from '@/components/game/Scoreboard';
import { PlayerList } from '@/components/game/PlayerList';
import {
  getGameByCode,
  getPlayers,
  getQuestions,
  subscribeToGame,
  subscribeToPlayers,
} from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { Crown, Users } from 'lucide-react';

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

const GameHost = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    const isHost = localStorage.getItem(`is_host_${code}`) === 'true';
    if (!isHost) {
      toast({
        title: 'Không có quyền',
        description: 'Chỉ người tổ chức mới có thể truy cập trang này',
        variant: 'destructive',
      });
      navigate(`/game/lobby/${code}`);
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

        if (gameData.status === 'waiting') {
          navigate(`/game/lobby/${code}`);
          return;
        }

        setGame(gameData);

        const refreshPlayers = async () => {
          const { players: playersData, error: playersError } = await getPlayers(gameData.id);
          if (!playersError && playersData) {
            // Filter out host from players list
            setPlayers(playersData.filter((p) => !p.is_host));
          }
        };

        await refreshPlayers();

        // Subscribe to game changes
        unsubscribeGame = subscribeToGame(gameData.id, (updatedGame) => {
          setGame(updatedGame);
        });

        // Subscribe to players changes
        unsubscribePlayers = subscribeToPlayers(gameData.id, (updatedPlayers) => {
          setPlayers(updatedPlayers.filter((p) => !p.is_host));
        });

        // Polling fallback
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

  const playingPlayers = players.filter((p) => !p.is_host);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="h-8 w-8 text-yellow-400" />
              <h1 className="text-4xl font-bold">Bảng điều khiển người tổ chức</h1>
            </div>
            <p className="text-xl text-blue-100">Mã game: {code}</p>
            <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-300/20 inline-block">
              <p className="text-yellow-200 text-sm">
                👑 Bạn là người tổ chức - Theo dõi tiến trình game
              </p>
            </div>
          </div>

          {/* Round Display */}
          <div className="mb-8">
            <RoundDisplay currentRound={game.current_round} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Scoreboard */}
            <div className="lg:col-span-2 space-y-6">
              <Scoreboard players={playingPlayers} showPositions={true} />
            </div>

            {/* Right Column - Players */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Người chơi ({playingPlayers.length}/4)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayerList players={playingPlayers} maxPlayers={4} />
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6">
                  <div className="space-y-2 text-sm">
                    <p className="text-blue-200">
                      <strong>Trạng thái:</strong> {game.status === 'playing' ? 'Đang chơi' : 'Đã kết thúc'}
                    </p>
                    <p className="text-blue-200">
                      <strong>Vòng hiện tại:</strong>{' '}
                      {game.current_round === 'khoi_dong'
                        ? 'Khởi động'
                        : game.current_round === 'vuot_chuong_ngai_vat'
                          ? 'Vượt chướng ngại vật'
                          : game.current_round === 'tang_toc'
                            ? 'Tăng tốc'
                            : 'Về đích'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHost;

