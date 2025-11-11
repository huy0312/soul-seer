import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createGame, joinGame } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  LogIn, 
  User, 
  Sparkles, 
  Crown, 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  Info, 
  Users, 
  FileQuestion,
  Settings,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
          <span>Quay lại trang chủ</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 mb-4 bg-white/10 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20 shadow-lg">
              <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                Tạo Game Mới
              </h1>
            </div>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Tạo và quản lý cuộc thi kiến thức của riêng bạn. Mời bạn bè tham gia và bắt đầu cuộc thi!
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400">
                <span className="text-blue-300 font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Đăng nhập</p>
                <p className="text-xs text-blue-200">Xác thực tài khoản</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400">
                <span className="text-blue-300 font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Nhập tên</p>
                <p className="text-xs text-blue-200">Tên người tổ chức</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400">
                <span className="text-blue-300 font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Tạo câu hỏi</p>
                <p className="text-xs text-blue-200">Thiết lập nội dung</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400">
                <span className="text-blue-300 font-bold">4</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Bắt đầu</p>
                <p className="text-xs text-blue-200">Host game</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Card */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Crown className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Thông tin người tổ chức</CardTitle>
                      <CardDescription className="text-blue-200 mt-1">
                        Bạn sẽ là người quản lý và điều hành game này
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {authLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-blue-100 text-lg">Đang kiểm tra đăng nhập...</p>
                    </div>
                  ) : !user ? (
                    <div className="space-y-6 text-center py-8">
                      <div className="flex justify-center">
                        <div className="bg-yellow-500/20 rounded-full p-6 border-2 border-yellow-400/30">
                          <LogIn className="h-16 w-16 text-yellow-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-3">Cần đăng nhập để tạo game</h3>
                        <p className="text-blue-100 mb-8 text-lg">
                          Bạn cần đăng nhập hoặc tạo tài khoản để có thể tạo và quản lý game
                        </p>
                        <Button
                          onClick={() => navigate('/auth')}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-6 text-lg"
                          size="lg"
                        >
                          <LogIn className="h-6 w-6 mr-2" />
                          Đăng nhập / Đăng ký
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Authentication Status */}
                      <Alert className="bg-green-500/20 border-green-400/30">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <AlertDescription className="text-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">Đã xác thực</p>
                              <p className="text-sm">{user.email}</p>
                            </div>
                            <Sparkles className="h-6 w-6 text-green-400 animate-pulse" />
                          </div>
                        </AlertDescription>
                      </Alert>

                      {/* Name Input */}
                      <div className="space-y-3">
                        <label className="text-base font-semibold text-white flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-300" />
                          Tên người tổ chức
                        </label>
                        <Input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="bg-white/20 border-2 border-white/30 text-white placeholder:text-white/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 h-14 text-lg transition-all"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !creating && playerName.trim()) {
                              handleCreateGame();
                            }
                          }}
                        />
                        <p className="text-xs text-blue-300 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Tên này sẽ hiển thị cho các thí sinh khi bạn host game
                        </p>
                      </div>

                      {/* Create Button */}
                      <Button
                        onClick={handleCreateGame}
                        disabled={creating || !playerName.trim()}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold h-14 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden text-lg"
                        size="lg"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {creating ? (
                            <>
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                              Đang tạo game...
                            </>
                          ) : (
                            <>
                              <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
                              Tạo game mới
                              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      </Button>

                      {/* Next Steps Info */}
                      <Alert className="bg-blue-500/20 border-blue-400/30">
                        <Info className="h-5 w-5 text-blue-400" />
                        <AlertDescription className="text-blue-200">
                          <p className="font-semibold mb-1">Bước tiếp theo:</p>
                          <p className="text-sm">Sau khi tạo game, bạn sẽ được chuyển đến trang tạo câu hỏi cho 4 phần thi</p>
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-300" />
                    Thông tin nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Users className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Tối đa 4 thí sinh</p>
                      <p className="text-xs text-blue-200">Mỗi game có thể có tối đa 4 người chơi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <FileQuestion className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">4 phần thi</p>
                      <p className="text-xs text-blue-200">Khởi động, Vượt chướng ngại vật, Tăng tốc, Về đích</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Bảo mật</p>
                      <p className="text-xs text-blue-200">Mỗi game có mã riêng để tham gia</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Quản lý linh hoạt</p>
                      <p className="text-xs text-blue-200">Bạn có thể điều khiển tiến trình game</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Cần trợ giúp?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-200 mb-4">
                    Muốn tham gia game thay vì tạo mới?
                  </p>
                  <Link to="/game/join">
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Tham gia game
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

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

