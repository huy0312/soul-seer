import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createGame, joinGame } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Play, LogIn, User, Sparkles, Crown, ArrowLeft, Zap } from 'lucide-react';

const GameCreate = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [creating, setCreating] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên của bạn',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { game, error } = await createGame();
      if (error || !game) {
        throw error || new Error('Không thể tạo game');
      }

      // Host joins directly without character selection
      const { player, error: joinError } = await joinGame(game.code, playerName.trim(), true);
      if (joinError || !player) {
        throw joinError || new Error('Không thể tham gia game');
      }

      // Store player ID and host status in localStorage
      localStorage.setItem(`player_${game.code}`, player.id);
      localStorage.setItem(`is_host_${game.code}`, 'true');

      toast({
        title: 'Tạo game thành công!',
        description: 'Bây giờ hãy tạo câu hỏi cho game',
      });

      // Navigate to questions page
      navigate(`/game/questions/${game.code}`);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo game',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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

        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
              <Crown className="h-6 w-6 text-yellow-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Tạo game mới
              </h1>
            </div>
            <p className="text-sm text-blue-200">Tạo game và mời bạn bè tham gia</p>
          </div>

          {/* Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-center">Thông tin người tổ chức</CardTitle>
              <CardDescription className="text-center text-blue-100">
                Bạn sẽ là người tổ chức game này
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {authLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-blue-100">Đang kiểm tra đăng nhập...</p>
                </div>
              ) : !user ? (
                <div className="space-y-6 text-center py-8">
                  <div className="flex justify-center">
                    <div className="bg-yellow-500/20 rounded-full p-4 border border-yellow-400/30">
                      <LogIn className="h-12 w-12 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Cần đăng nhập để tạo game</h3>
                    <p className="text-blue-100 mb-6">
                      Bạn cần đăng nhập hoặc tạo tài khoản để có thể tạo game mới
                    </p>
                    <Button
                      onClick={() => navigate('/auth')}
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                      size="lg"
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Đăng nhập / Đăng ký
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-300" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-200">Đã đăng nhập</p>
                      <p className="text-sm font-semibold text-white">{user.email}</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-blue-300 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Tên của bạn
                    </label>
                    <Input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Nhập tên của bạn"
                      className="bg-white/20 border-2 border-white/30 text-white placeholder:text-white/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 h-12 transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !creating && playerName.trim()) {
                          handleCreateGame();
                        }
                      }}
                    />
                  </div>

                  <Button
                    onClick={handleCreateGame}
                    disabled={creating || !playerName.trim()}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold h-12 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden"
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {creating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Đang tạo game...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          Tạo game mới
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </Button>

                  <p className="text-xs text-center text-blue-300">
                    Sau khi tạo game, bạn sẽ được chuyển đến trang tạo câu hỏi
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Help text */}
          <p className="text-center text-xs text-blue-300 mt-6">
            Muốn tham gia game?{' '}
            <Link to="/game/join" className="text-blue-400 hover:text-blue-300 underline font-semibold">
              Tham gia game
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default GameCreate;

