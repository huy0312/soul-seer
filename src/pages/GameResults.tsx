import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scoreboard } from '@/components/game/Scoreboard';
import { getGameByCode, getPlayers } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { Trophy, Home, RotateCcw } from 'lucide-react';

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

const GameResults = () => {
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

    const loadResults = async () => {
      try {
        const { game: gameData, error: gameError } = await getGameByCode(code);
        if (gameError || !gameData) {
          throw gameError || new Error('Game not found');
        }

        setGame(gameData);

        const { players: playersData, error: playersError } = await getPlayers(gameData.id);
        if (playersError) throw playersError;
        setPlayers(playersData || []);

        setLoading(false);
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể tải kết quả',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    loadResults();
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

  const winner = players.find((p) => p.position === 1);
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.position && b.position) return a.position - b.position;
    return b.score - a.score;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Trophy className="h-16 w-16 text-yellow-400" />
              <h1 className="text-5xl font-bold">Kết quả game</h1>
            </div>
            {winner && (
              <div className="bg-yellow-500/20 backdrop-blur-lg border-yellow-300/20 rounded-lg p-6 mb-6">
                <p className="text-2xl font-bold text-yellow-300 mb-2">🏆 Người chiến thắng 🏆</p>
                <p className="text-3xl font-bold text-white">{winner.name}</p>
                <p className="text-xl text-yellow-200 mt-2">
                  {winner.score} điểm
                </p>
              </div>
            )}
          </div>

          {/* Scoreboard */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Bảng xếp hạng</CardTitle>
            </CardHeader>
            <CardContent>
              <Scoreboard players={sortedPlayers} showPositions={true} />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Home className="h-5 w-5 mr-2" />
              Về trang chủ
            </Button>
            <Button
              onClick={() => navigate(`/game/lobby/${code}`)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Chơi lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameResults;

