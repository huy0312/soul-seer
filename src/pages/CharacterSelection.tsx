import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { joinGame, getGameByCode, getPlayers, subscribeToPlayers } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

// Danh sách nhân vật với ảnh
const CHARACTERS = [
  {
    id: 'character1',
    name: 'Nhân vật 1',
    image: '/characters/character1.png', // Đường dẫn ảnh trong public folder
  },
  {
    id: 'character2',
    name: 'Nhân vật 2',
    image: '/characters/character2.png',
  },
  {
    id: 'character3',
    name: 'Nhân vật 3',
    image: '/characters/character3.png',
  },
  {
    id: 'character4',
    name: 'Nhân vật 4',
    image: '/characters/character4.png',
  },
];

const CharacterSelection = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [takenAvatars, setTakenAvatars] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Lấy tên người chơi từ location state
  const playerName = location.state?.playerName as string | undefined;
  const isHost = location.state?.isHost as boolean | undefined;

  // Load taken avatars and subscribe to real-time updates
  useEffect(() => {
    if (!code) return;

    let unsubscribePlayers: (() => void) | null = null;

    const loadTakenAvatars = async () => {
      try {
        const { game, error: gameError } = await getGameByCode(code);
        if (gameError || !game) {
          throw gameError || new Error('Game not found');
        }

        const { players, error: playersError } = await getPlayers(game.id);
        if (playersError || !players) {
          throw playersError || new Error('Cannot load players');
        }

        // Collect all taken avatar URLs
        const updateTakenAvatars = (playersList: Player[]) => {
          const taken = new Set<string>();
          playersList.forEach((player) => {
            if (player.avatar_url) {
              taken.add(player.avatar_url);
            }
          });
          setTakenAvatars(taken);
        };

        updateTakenAvatars(players);
        setLoading(false);

        // Subscribe to real-time player changes
        unsubscribePlayers = subscribeToPlayers(game.id, (updatedPlayers) => {
          console.log('Players updated in character selection:', updatedPlayers);
          updateTakenAvatars(updatedPlayers);
        });
      } catch (error) {
        console.error('Error loading taken avatars:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách nhân vật đã chọn',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    loadTakenAvatars();

    return () => {
      if (unsubscribePlayers) {
        unsubscribePlayers();
      }
    };
  }, [code]);

  // Nếu không có tên, quay lại trang chủ
  if (!playerName || !code) {
    navigate('/');
    return null;
  }

  // Host should not be here - redirect
  if (isHost) {
    navigate('/');
    return null;
  }

  const handleJoinGame = async () => {
    if (!selectedCharacter) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn một nhân vật',
        variant: 'destructive',
      });
      return;
    }

    const character = CHARACTERS.find((c) => c.id === selectedCharacter);
    if (!character) {
      toast({
        title: 'Lỗi',
        description: 'Nhân vật không tồn tại',
        variant: 'destructive',
      });
      return;
    }

    // Double check if character is still available (realtime check)
    if (takenAvatars.has(character.image)) {
      toast({
        title: 'Nhân vật đã được chọn',
        description: 'Nhân vật này đã được chọn bởi người chơi khác. Vui lòng chọn nhân vật khác.',
        variant: 'destructive',
      });
      setSelectedCharacter(null); // Reset selection
      return;
    }

    setJoining(true);
    try {
      // Final check before joining - fetch latest players
      const { game, error: gameError } = await getGameByCode(code!);
      if (gameError || !game) {
        throw gameError || new Error('Game not found');
      }

      const { players: latestPlayers } = await getPlayers(game.id);
      if (latestPlayers) {
        const latestTaken = new Set<string>();
        latestPlayers.forEach((player) => {
          if (player.avatar_url) {
            latestTaken.add(player.avatar_url);
          }
        });

        // Check again with latest data
        if (latestTaken.has(character.image)) {
          setTakenAvatars(latestTaken);
          setSelectedCharacter(null);
          setJoining(false);
          toast({
            title: 'Nhân vật đã được chọn',
            description: 'Nhân vật này vừa được chọn bởi người chơi khác. Vui lòng chọn nhân vật khác.',
            variant: 'destructive',
          });
          return;
        }
      }

      const { player, error } = await joinGame(code!, playerName!, false, character.image);
      if (error || !player) {
        // Check if error is due to character already taken
        if (error?.message?.includes('already') || error?.message?.includes('taken')) {
          setSelectedCharacter(null);
          toast({
            title: 'Nhân vật đã được chọn',
            description: 'Nhân vật này đã được chọn bởi người chơi khác. Vui lòng chọn nhân vật khác.',
            variant: 'destructive',
          });
          return;
        }
        throw error || new Error('Không thể tham gia game');
      }

      // Store player ID in localStorage
      localStorage.setItem(`player_${code}`, player.id);

      toast({
        title: 'Tham gia thành công!',
        description: 'Đang chuyển đến phòng chờ...',
      });

      // Players go to lobby
      navigate(`/game/lobby/${code}`);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tham gia game',
        variant: 'destructive',
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-2">
                Chọn nhân vật của bạn
              </CardTitle>
              <p className="text-center text-blue-100 text-lg">
                Xin chào, <strong className="text-yellow-400">{playerName}</strong>!
              </p>
              <p className="text-center text-blue-200 text-sm mt-2">
                Hãy chọn một nhân vật để đại diện cho bạn trong cuộc thi
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-blue-200">Đang tải danh sách nhân vật...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {CHARACTERS.map((character) => {
                    const isSelected = selectedCharacter === character.id;
                    const isTaken = takenAvatars.has(character.image);
                    return (
                      <button
                        key={character.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isTaken) {
                            setSelectedCharacter(character.id);
                          }
                        }}
                        disabled={isTaken}
                        type="button"
                        className={`relative p-4 md:p-6 rounded-lg border-2 transition-all duration-200 touch-manipulation min-h-[140px] md:min-h-[160px] ${
                          isTaken
                            ? 'border-red-500/50 bg-red-500/10 opacity-50 cursor-not-allowed pointer-events-none'
                            : isSelected
                            ? 'border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-400/50 scale-105 active:scale-100'
                            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 active:bg-white/20 active:scale-95'
                        }`}
                        style={{
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation',
                          WebkitTouchCallout: 'none',
                          userSelect: 'none',
                        }}
                      >
                        <div className="aspect-square mb-3 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden relative w-full">
                          <img
                            src={character.image}
                            alt={character.name}
                            className="w-full h-full object-cover pointer-events-none"
                            draggable={false}
                            onError={(e) => {
                              // Fallback nếu ảnh không tồn tại
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName!)}&size=200&background=random`;
                            }}
                          />
                          {isTaken && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                              <XCircle className="h-8 w-8 md:h-10 md:w-10 text-red-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm md:text-base font-medium text-center break-words">{playerName}</p>
                        {isSelected && !isTaken && (
                          <div className="absolute top-2 right-2 md:top-3 md:right-3">
                            <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7 text-yellow-400" />
                          </div>
                        )}
                        {isTaken && (
                          <p className="text-xs md:text-sm text-red-400 text-center mt-1">Đã được chọn</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleJoinGame}
                  disabled={!selectedCharacter || joining}
                  className="w-full min-h-[48px] text-base md:text-lg touch-manipulation"
                  size="lg"
                  type="button"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                  }}
                >
                  {joining ? 'Đang tham gia...' : 'Xác nhận và tham gia'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;

