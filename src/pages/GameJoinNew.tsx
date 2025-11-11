import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { GameCode } from '@/components/game/GameCode';
import { getGameByCode } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import { Users, ArrowLeft, Sparkles, Zap, Gamepad2 } from 'lucide-react';

const GameJoinNew = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);
  const [gameCode, setGameCode] = useState(code?.toUpperCase() || '');
  const [isValidGame, setIsValidGame] = useState<boolean | null>(null);

  useEffect(() => {
    if (code) {
      setGameCode(code.toUpperCase());
      checkGameExists(code.toUpperCase());
    }
  }, [code]);

  const checkGameExists = async (codeToCheck: string) => {
    if (!codeToCheck || codeToCheck.length !== 6) {
      setIsValidGame(null);
      return;
    }

    try {
      const { game, error } = await getGameByCode(codeToCheck);
      if (error || !game) {
        setIsValidGame(false);
      } else {
        setIsValidGame(true);
      }
    } catch {
      setIsValidGame(false);
    }
  };

  useEffect(() => {
    if (gameCode.length === 6) {
      checkGameExists(gameCode);
    } else {
      setIsValidGame(null);
    }
  }, [gameCode]);

  const handleJoin = async () => {
    if (!gameCode.trim() || !playerName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mã game và tên của bạn',
        variant: 'destructive',
      });
      return;
    }

    if (gameCode.length !== 6) {
      toast({
        title: 'Lỗi',
        description: 'Mã game phải có 6 ký tự',
        variant: 'destructive',
      });
      return;
    }

    if (isValidGame === false) {
      toast({
        title: 'Lỗi',
        description: 'Game không tồn tại',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to character selection
    navigate(`/game/character/${gameCode.toUpperCase()}`, {
      state: {
        playerName: playerName.trim(),
        isHost: false,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại</span>
        </Link>

        <div className="max-w-md mx-auto">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
              <Users className="h-6 w-6 text-blue-300 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Tham gia game
              </h1>
            </div>
            <p className="text-sm text-blue-200">Nhập mã game và tên của bạn</p>
          </div>

          {/* Compact Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              {/* Game Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Mã game
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={gameCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                      setGameCode(value);
                    }}
                    placeholder="ABCD12"
                    maxLength={6}
                    className={`bg-white/20 border-2 text-center text-2xl font-bold tracking-widest uppercase h-14 ${
                      isValidGame === true
                        ? 'border-green-400 focus:border-green-300'
                        : isValidGame === false
                        ? 'border-red-400 focus:border-red-300'
                        : 'border-white/30 focus:border-blue-400'
                    } text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-400/50 transition-all`}
                  />
                  {gameCode.length === 6 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidGame === true ? (
                        <div className="flex items-center gap-1 text-green-400 animate-pulse">
                          <Sparkles className="h-5 w-5" />
                        </div>
                      ) : isValidGame === false ? (
                        <div className="text-red-400">✕</div>
                      ) : (
                        <div className="text-blue-400 animate-spin">⟳</div>
                      )}
                    </div>
                  )}
                </div>
                {gameCode.length > 0 && gameCode.length < 6 && (
                  <p className="text-xs text-blue-300">Còn {6 - gameCode.length} ký tự</p>
                )}
              </div>

              {/* Player Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Tên của bạn
                </label>
                <Input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="bg-white/20 border-2 border-white/30 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-12 transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !joining && gameCode.length === 6 && playerName.trim()) {
                      handleJoin();
                    }
                  }}
                />
              </div>

              {/* Join Button */}
              <Button
                onClick={handleJoin}
                disabled={joining || !gameCode.trim() || !playerName.trim() || gameCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden"
                size="lg"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                      Tham gia ngay
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>

              {/* Quick Info */}
              {isValidGame === true && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 flex items-center gap-2 text-sm text-green-200 animate-fade-in">
                  <Sparkles className="h-4 w-4" />
                  <span>Game hợp lệ! Bạn có thể tham gia</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help text */}
          <p className="text-center text-xs text-blue-300 mt-6">
            Chưa có mã game?{' '}
            <Link to="/game/create" className="text-yellow-400 hover:text-yellow-300 underline font-semibold">
              Tạo game mới
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default GameJoinNew;

