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
  getAnswersForRound,
  nextRound,
  subscribeToGame,
  subscribeToPlayers,
} from '@/services/gameService';
import { startVCNVTimer, stopVCNVTimer, awardPoints, emitRoundFinished } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';
import { RoundResultModal } from '@/components/game/RoundResultModal';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { RoundType } from '@/services/gameService';
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
  const [showRound1Modal, setShowRound1Modal] = useState(false);
  const [round1Monitoring, setRound1Monitoring] = useState(false);
  const [round1QuestionIds, setRound1QuestionIds] = useState<string[]>([]);
  const [round1Announced, setRound1Announced] = useState(false);

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

  // Monitor round 1 completion to show host modal with leader
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const setup = async () => {
      if (!game?.id || game.current_round !== 'khoi_dong' || round1Monitoring) return;
      setRound1Monitoring(true);

      // Load round 1 questions to build subscription filter
      const { questions: q1 } = await getQuestions(game.id, 'khoi_dong' as any);
      const questionIds = (q1 || []).map((q) => q.id);
      setRound1QuestionIds(questionIds);

      // Helper to check completion
      const checkCompletion = async () => {
        if (cancelled) return;
        const { answers } = await getAnswersForRound(game.id, 'khoi_dong' as any);
        const playing = players.filter((p) => !p.is_host);
        const totalQuestions = questionIds.length;
        if (totalQuestions === 0 || playing.length === 0) return;

        let allCompleted = true;
        for (const p of playing) {
          const count = (answers || []).filter((a) => a.player_id === p.id).length;
          if (count < totalQuestions) {
            allCompleted = false;
            break;
          }
        }
        if (allCompleted) {
          setShowRound1Modal(true);
          if (!round1Announced) {
            setRound1Announced(true);
            // Broadcast round finished so players return to lobby
            emitRoundFinished(game.id, 'khoi_dong' as any).catch(() => {});
          }
          toast({
            title: 'Phần Khởi động đã kết thúc',
            description: 'Tất cả thí sinh đã hoàn thành. Hãy công bố và chuyển sang phần thi tiếp theo.',
          });
        }
      };

      await checkCompletion();

      // Subscribe to answers updates for round 1
      if (questionIds.length > 0) {
        const filter = `question_id=in.(${questionIds.join(',')})`;
        channel = supabase
          .channel(`host:answers:khoi_dong:${Date.now()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'answers', filter }, () => {
            checkCompletion();
          })
          .subscribe();
      }
    };

    setup();
    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [game?.id, game?.current_round, players, round1Monitoring]);

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

  const handleNextRound = async () => {
    if (!game || !game.current_round) return;

    const roundOrder: RoundType[] = ['khoi_dong', 'vuot_chuong_ngai_vat', 'tang_toc', 've_dich'];
    const currentIndex = roundOrder.indexOf(game.current_round);

    if (currentIndex < roundOrder.length - 1) {
      try {
        const { error } = await nextRound(game.id, game.current_round);
        if (error) throw error;

        const nextRoundKey = roundOrder[currentIndex + 1];
        // Optimistic UI update so the step indicator switches immediately
        setGame((prev) => (prev ? { ...prev, current_round: nextRoundKey } as Game : prev));

        const nextRoundName = nextRoundKey === 'vuot_chuong_ngai_vat' 
          ? 'Vượt chướng ngại vật' 
          : nextRoundKey === 'tang_toc' 
          ? 'Tăng tốc' 
          : 'Về đích';

        toast({
          title: 'Chuyển phần thi',
          description: `Đã chuyển sang ${nextRoundName}. Người chơi sẽ tự động được chuyển sang phần thi mới.`,
        });
        
        // The real-time subscription will update the game state automatically
        // Players will automatically see the new round via their subscriptions
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể chuyển sang vòng tiếp theo',
          variant: 'destructive',
        });
      }
    }
  };

  const canMoveToNextRound = game?.current_round && game.current_round !== 've_dich';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <RoundResultModal
            isOpen={showRound1Modal}
            players={players}
            roundName="Phần 1 - Khởi động"
            onClose={() => {
              setShowRound1Modal(false);
              setRound1Monitoring(false);
            }}
          />
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
              {/* VCNV Controls for Host */}
              {game.current_round === 'vuot_chuong_ngai_vat' && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Điều khiển phần 2 - Vượt chướng ngại vật</span>
                      <span className="text-sm text-blue-200">Bắt đầu đếm ngược 10s và chấm điểm thủ công</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={() => startVCNVTimer(game.id, 10)}>
                        Bắt đầu 10s
                      </Button>
                      <Button variant="outline" className="border-blue-300 text-blue-200 hover:bg-blue-500/20" onClick={() => stopVCNVTimer(game.id)}>
                        Dừng
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <p className="text-blue-100 text-sm">Cộng điểm nhanh cho từng thí sinh:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {playingPlayers.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                            <span className="font-semibold">{p.name}</span>
                            <div className="flex items-center gap-2">
                              {[40, 30, 20, 10].map((pts) => (
                                <Button
                                  key={pts}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={async () => {
                                    const { error } = await awardPoints(p.id, pts);
                                    if (error) {
                                      toast({ title: 'Lỗi', description: `Không thể cộng điểm ${pts}`, variant: 'destructive' });
                                    } else {
                                      toast({ title: 'Đã cộng điểm', description: `+${pts} cho ${p.name}` });
                                    }
                                  }}
                                >
                                  +{pts}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Players */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Thí sinh ({playingPlayers.length}/4)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayerList players={playingPlayers} maxPlayers={4} showWaitingMessage={false} />
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
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

                    {/* Next Round Button */}
                    {canMoveToNextRound && game.status === 'playing' && (
                      <Button
                        onClick={handleNextRound}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Chuyển sang phần thi tiếp theo
                      </Button>
                    )}
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

