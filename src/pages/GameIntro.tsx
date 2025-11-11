import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getGameByCode, getPlayers, subscribeToGame } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import { Trophy, Play, Users, Clock, Target, Zap, Crown, AlertCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

const GameIntro = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    const checkHostStatus = async () => {
      try {
        // Check from localStorage first
        const storedIsHost = localStorage.getItem(`is_host_${code}`) === 'true';
        
        // Also verify from database
        const { game: gameData, error: gameError } = await getGameByCode(code);
        if (gameError || !gameData) {
          throw gameError || new Error('Game not found');
        }

        setGame(gameData);

        // Get players to verify host status
        const { players, error: playersError } = await getPlayers(gameData.id);
        if (!playersError && players) {
          const storedPlayerId = localStorage.getItem(`player_${code}`);
          const currentPlayer = players.find((p) => p.id === storedPlayerId);
          if (currentPlayer?.is_host) {
            setIsHost(true);
            // Host should not be on intro page - redirect to host dashboard
            navigate(`/game/host/${code}`);
            return;
          } else {
            setIsHost(false);
          }
        } else {
          if (storedIsHost) {
            // Host should not be on intro page - redirect to host dashboard
            navigate(`/game/host/${code}`);
            return;
          }
          setIsHost(false);
        }

        // If game is already playing, redirect non-host players to play page
        if (gameData.status === 'playing') {
          navigate(`/game/play/${code}`);
          return;
        }

        // Subscribe to game changes - if game starts, redirect non-host players
        // Note: isHost is checked before subscription, so we use storedIsHost
        const unsubscribe = subscribeToGame(gameData.id, (updatedGame) => {
          // Double check host status from localStorage
          const currentIsHost = localStorage.getItem(`is_host_${code}`) === 'true';
          if (updatedGame.status === 'playing' && !currentIsHost) {
            navigate(`/game/play/${code}`);
          }
        });

        setLoading(false);

        return () => {
          unsubscribe();
        };
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể tải thông tin game',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    checkHostStatus();
  }, [code, navigate]);

  const handleStart = () => {
    if (code && isHost) {
      navigate(`/game/play/${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Trophy className="h-20 w-20 text-yellow-400" />
              <h1 className="text-6xl font-bold">Đường lên đỉnh Olympia</h1>
            </div>
            <p className="text-2xl text-blue-100">Cuộc thi kiến thức dành cho học sinh</p>
          </div>

          {/* Introduction Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Chào mừng đến với cuộc thi!</CardTitle>
              <CardDescription className="text-center text-blue-100 text-lg">
                Bạn sắp tham gia một cuộc thi kiến thức đầy thử thách với 4 phần thi hấp dẫn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Users className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">4 Thí sinh</h3>
                    <p className="text-blue-200 text-sm">Tối đa 4 thí sinh cùng thi đấu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Thời gian</h3>
                    <p className="text-blue-200 text-sm">Mỗi phần thi có thời gian riêng</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Target className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Tích điểm</h3>
                    <p className="text-blue-200 text-sm">Trả lời đúng để tích lũy điểm số</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Tốc độ</h3>
                    <p className="text-blue-200 text-sm">Phản ứng nhanh để giành chiến thắng</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules Toggle */}
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowRules(!showRules)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              size="lg"
            >
              {showRules ? 'Ẩn' : 'Xem'} luật chơi
            </Button>
          </div>

          {/* Rules Card */}
          {showRules && (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Luật chơi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">1.</span> Phần 1 - Khởi động
                    </h3>
                    <p className="text-blue-200 ml-6">
                      Các câu hỏi nhanh, mỗi thí sinh lần lượt trả lời. Trả lời đúng sẽ nhận được điểm tương ứng.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">2.</span> Phần 2 - Vượt chướng ngại vật
                    </h3>
                    <p className="text-blue-200 ml-6">
                      Phần thi tương tác với bấm chuông và giải từ khóa. Ai bấm chuông đầu tiên sẽ được quyền trả lời.
                      Điểm thưởng lớn hơn phần 1.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">3.</span> Phần 3 - Tăng tốc
                    </h3>
                    <p className="text-blue-200 ml-6">
                      Cả 4 thí sinh cùng chơi với tốc độ cao. Thời gian rất ngắn, điểm cao. Ai trả lời đúng nhanh
                      nhất sẽ nhận điểm cao nhất.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">4.</span> Phần 4 - Về đích
                    </h3>
                    <p className="text-blue-200 ml-6">
                      Mỗi thí sinh chọn gói câu hỏi với điểm khác nhau. Trả lời đúng cộng điểm, sai trừ điểm. Có thể
                      sử dụng "Ngôi sao hy vọng" để nhân đôi điểm nếu đúng.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Button - Only visible to host */}
          <div className="text-center">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-blue-200">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Đang tải...</span>
              </div>
            ) : isHost ? (
              <div className="space-y-4">
                <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-300/20 inline-block">
                  <div className="flex items-center gap-2 text-yellow-200">
                    <Crown className="h-5 w-5" />
                    <p className="font-semibold">Bạn là người tổ chức</p>
                  </div>
                </div>
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-xl px-12 py-6"
                >
                  <Play className="h-6 w-6 mr-3" />
                  Bắt đầu cuộc thi
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-blue-500/20 border-blue-400 max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    <strong>Đang chờ người tổ chức bắt đầu cuộc thi...</strong>
                    <p className="text-sm mt-2">
                      Bạn sẽ tự động được chuyển vào màn hình chơi khi người tổ chức bấm "Bắt đầu cuộc thi"
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="flex items-center justify-center gap-2 text-blue-200">
                  <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                  <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameIntro;

