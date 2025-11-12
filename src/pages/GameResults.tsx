import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getGameByCode, getPlayers } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { Trophy, Home, RotateCcw, Crown } from 'lucide-react';

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

const GameResults = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedPlayers, setRevealedPlayers] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const awardSoundRef = useRef<HTMLAudioElement | null>(null);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

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

  // Initialize audio
  useEffect(() => {
    if (!loading && players.length > 0) {
      // Try to load background music from public/music
      const audio = new Audio('/music/khoi-dong-bg.mp3');
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;

      // Try to play, but don't fail if file doesn't exist
      audio.play().catch((err) => {
        console.log('Could not play background music:', err);
        // Try alternative music files
        const altAudio = new Audio('/mymusic.mp3');
        altAudio.loop = true;
        altAudio.volume = 0.5;
        altAudio.play().catch(() => {
          console.log('Alternative music also not available');
        });
        audioRef.current = altAudio;
      });

      // Load award sound (trao giải sound)
      const awardSound = new Audio('/music/award-sound.mp3');
      awardSound.volume = 0.7;
      awardSoundRef.current = awardSound;

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (awardSoundRef.current) {
          awardSoundRef.current.pause();
          awardSoundRef.current = null;
        }
      };
    }
  }, [loading, players.length]);

  // Initialize confetti
  useEffect(() => {
    if (!confettiRef.current || loading) return;

    const canvas = confettiRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Create confetti particles
    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][
          Math.floor(Math.random() * 6)
        ],
        size: Math.random() * 5 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        if (particle.y > canvas.height) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [loading]);

  // Reveal players one by one from bottom to top
  useEffect(() => {
    if (loading || players.length === 0) return;

    const sortedPlayers = [...players]
      .filter((p) => !p.is_host)
      .sort((a, b) => a.score - b.score); // Sort from lowest to highest

    if (sortedPlayers.length === 0) return;

    // Start revealing after a short delay
    const timer = setTimeout(() => {
      let currentIndex = 0;
      const revealInterval = setInterval(() => {
        currentIndex++;
        setRevealedPlayers(currentIndex);
        if (currentIndex >= sortedPlayers.length) {
          clearInterval(revealInterval);
          // Play award sound when all players are revealed (winner announcement)
          if (awardSoundRef.current) {
            awardSoundRef.current.play().catch((err) => {
              console.log('Could not play award sound:', err);
              // Try alternative sound files
              const altSound = new Audio('/music/trao-giai.mp3');
              altSound.volume = 0.7;
              altSound.play().catch(() => {
                console.log('Alternative award sound also not available');
              });
            });
          }
        }
      }, 1500); // Reveal one player every 1.5 seconds

      return () => clearInterval(revealInterval);
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading, players]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (confettiRef.current) {
        confettiRef.current.width = window.innerWidth;
        confettiRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Filter out host and sort from lowest to highest score (bottom to top)
  const sortedPlayers = [...players]
    .filter((p) => !p.is_host)
    .sort((a, b) => a.score - b.score);

  const winner = sortedPlayers[sortedPlayers.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
      {/* Confetti Canvas */}
      <canvas
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ position: 'fixed', top: 0, left: 0 }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Trophy className="h-20 w-20 text-yellow-400 animate-bounce" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Công bố kết quả
              </h1>
            </div>
            <p className="text-2xl text-blue-200 mb-8">Đường lên đỉnh Olympia</p>
          </div>

          {/* Players Ranking - Revealed from bottom to top */}
          <div className="space-y-6 mb-12">
            {sortedPlayers.map((player, index) => {
              const isRevealed = index < revealedPlayers;
              const position = sortedPlayers.length - index; // Reverse position (4, 3, 2, 1)
              const isWinner = index === sortedPlayers.length - 1;

              return (
                <div
                  key={player.id}
                  className={`transition-all duration-1000 ${
                    isRevealed
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-20'
                  }`}
                  style={{
                    transitionDelay: isRevealed ? `${index * 0.1}s` : '0s',
                  }}
                >
                  <Card
                    className={`bg-white/10 backdrop-blur-lg border-2 ${
                      isWinner
                        ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50 scale-105'
                        : 'border-white/20'
                    } rounded-2xl overflow-hidden`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 flex-1">
                          {/* Position Badge */}
                          <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl ${
                              isWinner
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg'
                                : position === 2
                                  ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                                  : position === 3
                                    ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-white'
                                    : 'bg-blue-500 text-white'
                            }`}
                          >
                            {isWinner ? <Crown className="h-10 w-10" /> : position}
                          </div>

                          {/* Player Info */}
                          <div className="flex-1">
                            <h3
                              className={`text-3xl font-bold mb-2 ${
                                isWinner ? 'text-yellow-400' : 'text-white'
                              }`}
                            >
                              {player.name}
                            </h3>
                            <p className="text-xl text-blue-200">
                              {player.score} điểm
                            </p>
                          </div>
                        </div>

                        {/* Winner Badge */}
                        {isWinner && (
                          <div className="ml-6">
                            <div className="bg-yellow-400/20 backdrop-blur-lg border-2 border-yellow-400 rounded-lg px-6 py-3">
                              <p className="text-yellow-400 font-bold text-xl">🏆 Vô địch 🏆</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Winner Announcement */}
          {revealedPlayers >= sortedPlayers.length && winner && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border-4 border-yellow-400 rounded-3xl p-8 shadow-2xl">
                <Trophy className="h-24 w-24 text-yellow-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-5xl font-bold text-yellow-400 mb-4">
                  Chúc mừng {winner.name}!
                </h2>
                <p className="text-3xl text-white mb-2">
                  {winner.score} điểm
                </p>
                <p className="text-xl text-blue-200">
                  Đã chinh phục đỉnh Olympia!
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {revealedPlayers >= sortedPlayers.length && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
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
          )}
        </div>
      </div>

      {/* Add fade-in animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GameResults;
