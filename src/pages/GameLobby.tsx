import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCode } from '@/components/game/QRCode';
import { GameCode } from '@/components/game/GameCode';
import { PlayerList } from '@/components/game/PlayerList';
import { ChatRoom } from '@/components/game/ChatRoom';
import { Podium } from '@/components/game/Podium';
import {
  getGameByCode,
  getPlayers,
  getQuestions,
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
  const [hasQuestions, setHasQuestions] = useState(false);
  const [checkingQuestions, setCheckingQuestions] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [prevRound, setPrevRound] = useState<string | null>(null);
  const [navigated, setNavigated] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    let unsubscribeGame: (() => void) | null = null;
    let unsubscribePlayers: (() => void) | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;
    let gameStatusInterval: NodeJS.Timeout | null = null;

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

        // Check if current user is host
        const storedPlayerId = localStorage.getItem(`player_${code}`);
        if (storedPlayerId) {
          const { players: allPlayers } = await getPlayers(gameData.id);
          const currentPlayer = allPlayers?.find((p) => p.id === storedPlayerId);
          if (currentPlayer?.is_host) {
            setIsHost(true);
          }
        }

        // Check if game has questions
        const checkQuestions = async () => {
          const { questions: questionsData, error: questionsError } = await getQuestions(
            gameData.id,
            'khoi_dong'
          );
          if (!questionsError && questionsData && questionsData.length > 0) {
            setHasQuestions(true);
          }
          setCheckingQuestions(false);
        };
        await checkQuestions();

        // Subscribe to game changes - realtime update for all players
        unsubscribeGame = subscribeToGame(gameData.id, (updatedGame) => {
          console.log('Game status changed:', updatedGame.status);
          setGame(updatedGame);
          // Navigate non-hosts to intro whenever a new round begins while in lobby
          if (updatedGame.status === 'playing' && !navigated) {
            const round = (updatedGame as any).current_round;
            if (!isHost) {
              // If round changed compared to the last seen value, go to intro
              if (round && round !== prevRound) {
                setPrevRound(round);
                setNavigated(true);
                setTimeout(() => {
                  navigate(`/game/intro/${code}`);
                }, 100);
              }
            } else {
              // Host should be on host dashboard
              setNavigated(true);
              setTimeout(() => {
                navigate(`/game/host/${code}`);
              }, 100);
            }
          }
        });

        // Subscribe to players changes
        unsubscribePlayers = subscribeToPlayers(gameData.id, (updatedPlayers) => {
          setPlayers(updatedPlayers);
          // Update isHost status if needed
          const storedPlayerId = localStorage.getItem(`player_${code}`);
          if (storedPlayerId) {
            const currentPlayer = updatedPlayers.find((p) => p.id === storedPlayerId);
            if (currentPlayer?.is_host) {
              setIsHost(true);
            }
          }
        });

        // Polling fallback - refresh players every 2 seconds
        pollingInterval = setInterval(refreshPlayers, 2000);

        // Polling fallback for game status - check every 500ms for faster response
        gameStatusInterval = setInterval(async () => {
          const { game: currentGame } = await getGameByCode(code);
          if (currentGame && currentGame.status === 'playing' && gameData.status === 'waiting') {
            // Update local state first
            setGame(currentGame);
            // Navigate based on host status
            if (isHost) {
              navigate(`/game/host/${code}`);
            } else {
              navigate(`/game/intro/${code}`);
            }
          }
        }, 500);

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
      if (gameStatusInterval) clearInterval(gameStatusInterval);
    };
  }, [code, navigate]);

  const handleStartGame = async () => {
    const playingPlayers = players.filter((p) => !p.is_host);
    if (!game || playingPlayers.length < 2) {
      toast({
        title: 'Lỗi',
        description: 'Cần ít nhất 2 thí sinh để bắt đầu game',
        variant: 'destructive',
      });
      return;
    }

    setStarting(true);
    try {
      const { error } = await startGame(game.id);
      if (error) throw error;

      toast({
        title: 'Cuộc thi đã bắt đầu!',
        description: 'Tất cả thí sinh sẽ tự động được chuyển vào màn hình chơi...',
      });

      // Host navigates to host dashboard, not to intro/play
      // Other players will be automatically redirected via subscription
      setTimeout(() => {
      navigate(`/game/host/${code}`);
      }, 300);
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

  const playingPlayers = players.filter((p) => !p.is_host);
  const canStart = playingPlayers.length >= 2 && playingPlayers.length <= 4 && game.status === 'waiting';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Phòng chờ</h1>
            <p className="text-xl text-blue-100">Mã game: {code}</p>
          </div>

          {/* Podiums Section */}
          <div className="mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-center mb-6">Bục trả lời câu hỏi</h2>
                <div className="grid grid-cols-4 gap-4 h-64">
                  {[1, 2, 3, 4].map((position) => {
                    const player = playingPlayers[position - 1] || null;
                    return (
                      <Podium
                        key={position}
                        player={player}
                        position={position}
                        isHost={player?.is_host || false}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  {isHost && (
                    <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-300/30">
                      <p className="text-yellow-200 text-xs">
                        👑 Bạn là người tổ chức và không được tính vào 4 thí sinh
                      </p>
                    </div>
                  )}
                  <PlayerList 
                    players={players.filter((p) => !p.is_host)} 
                    maxPlayers={4} 
                  />
                </CardContent>
              </Card>

              {/* Host controls - only visible to host */}
              {isHost && canStart && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6 space-y-4">
                    <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-300/20">
                      <p className="text-blue-200 text-sm font-semibold">
                        👑 Bạn là người tổ chức game
                      </p>
                    </div>
                    {!checkingQuestions && !hasQuestions && (
                      <div className="mb-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-300/20">
                        <p className="text-yellow-200 text-sm mb-3">
                          ⚠️ Bạn cần tạo câu hỏi trước khi host game
                        </p>
                        <Button
                          onClick={() => navigate(`/game/questions/${code}`)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                          size="lg"
                        >
                          Tạo câu hỏi cho 4 phần thi
                        </Button>
                      </div>
                    )}
                    {!checkingQuestions && hasQuestions && (
                      <Button
                        onClick={handleStartGame}
                        disabled={starting}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        {starting ? 'Đang bắt đầu...' : 'Bắt đầu cuộc thi'}
                      </Button>
                    )}
                    {!checkingQuestions && hasQuestions && (
                      <Button
                        onClick={() => navigate(`/game/questions/${code}`)}
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Chỉnh sửa câu hỏi
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Non-host waiting message - NO START BUTTON */}
              {!isHost && game?.status === 'waiting' && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-blue-200 mb-2 text-lg font-semibold">
                        ⏳ Đang chờ người tổ chức bắt đầu cuộc thi...
                      </p>
                      <p className="text-blue-300 text-sm">
                        Bạn sẽ tự động được chuyển vào màn hình chơi khi người tổ chức bấm "Bắt đầu cuộc thi"
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                        <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {playingPlayers.length < 2 && (
                <Card className="bg-yellow-500/20 backdrop-blur-lg border-yellow-300/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-yellow-200">
                      <Users className="h-5 w-5" />
                      <p>Cần ít nhất 2 thí sinh để bắt đầu game</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {playingPlayers.length > 4 && (
                <Card className="bg-red-500/20 backdrop-blur-lg border-red-300/20">
                  <CardContent className="p-6">
                    <p className="text-red-200">
                      Game đã đầy (tối đa 4 thí sinh)
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Chat */}
            {game && (
              <div className="h-[600px]">
                {(() => {
                  const storedPlayerId = localStorage.getItem(`player_${code}`);
                  if (storedPlayerId) {
                    return (
                      <ChatRoom
                        gameId={game.id}
                        currentPlayerId={storedPlayerId}
                        players={players.filter((p) => !p.is_host)}
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;

