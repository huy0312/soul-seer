import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCode } from '@/components/game/QRCode';
import { GameCode } from '@/components/game/GameCode';
import { createGame, joinGame } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Users, Play, LogIn, User } from 'lucide-react';

const GameHome = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [createdGameCode, setCreatedGameCode] = useState('');

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

  const handleJoinGame = async () => {
    if (!gameCode.trim() || !playerName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mã game và tên của bạn',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to character selection instead of joining directly
    navigate(`/game/character/${gameCode.toUpperCase()}`, {
      state: {
        playerName: playerName.trim(),
        isHost: false,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Trophy className="h-16 w-16 text-yellow-400" />
              <h1 className="text-5xl font-bold">Đường lên đỉnh Olympia</h1>
            </div>
            <p className="text-xl text-blue-100">
              Cuộc thi kiến thức dành cho học sinh
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="join" className="text-lg">
                <Users className="h-5 w-5 mr-2" />
                Tham gia game
              </TabsTrigger>
              <TabsTrigger value="create" className="text-lg">
                <Play className="h-5 w-5 mr-2" />
                Tạo game mới
              </TabsTrigger>
            </TabsList>

            <TabsContent value="join">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Tham gia game</CardTitle>
                  <CardDescription className="text-center text-blue-100">
                    Nhập mã game và tên của bạn để tham gia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên của bạn</label>
                    <Input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Nhập tên của bạn"
                      className="bg-white text-gray-800"
                    />
                  </div>
                  <GameCode
                    code={gameCode}
                    onCodeChange={setGameCode}
                    showInput={true}
                  />
                  <Button
                    onClick={handleJoinGame}
                    disabled={joining || !gameCode.trim() || !playerName.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {joining ? 'Đang tham gia...' : 'Tham gia game'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Tạo game mới</CardTitle>
                  <CardDescription className="text-center text-blue-100">
                    Tạo game mới và mời bạn bè tham gia
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
                        <div className="bg-yellow-500/20 rounded-full p-4">
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
                          className="w-full"
                          size="lg"
                        >
                          <LogIn className="h-5 w-5 mr-2" />
                          Đăng nhập / Đăng ký
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 text-sm text-blue-100 mb-4">
                        <User className="h-4 w-4" />
                        <span>Đã đăng nhập: {user.email}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tên của bạn</label>
                        <Input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Nhập tên của bạn"
                          className="bg-white text-gray-800"
                        />
                      </div>
                      {createdGameCode ? (
                        <div className="space-y-6">
                          <div className="text-center">
                            <p className="text-lg font-semibold mb-4">Game đã được tạo!</p>
                            <GameCode code={createdGameCode} />
                          </div>
                          <div className="flex justify-center">
                            <QRCode value={`${window.location.origin}/game/join/${createdGameCode}`} />
                          </div>
                          <Button
                            onClick={() => navigate(`/game/lobby/${createdGameCode}`)}
                            className="w-full"
                            size="lg"
                          >
                            Vào phòng chờ
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleCreateGame}
                          disabled={creating || !playerName.trim()}
                          className="w-full"
                          size="lg"
                        >
                          {creating ? 'Đang tạo game...' : 'Tạo game mới'}
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GameHome;

