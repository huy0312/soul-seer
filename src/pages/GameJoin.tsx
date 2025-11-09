import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QRCode } from '@/components/game/QRCode';
import { GameCode } from '@/components/game/GameCode';
import { joinGame, getGameByCode } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

const GameJoin = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);
  const [gameCode, setGameCode] = useState(code || '');

  useEffect(() => {
    if (code) {
      setGameCode(code.toUpperCase());
      // Check if game exists
      getGameByCode(code.toUpperCase()).then(({ game, error }) => {
        if (error || !game) {
          toast({
            title: 'Lỗi',
            description: 'Game không tồn tại',
            variant: 'destructive',
          });
          navigate('/');
        }
      });
    }
  }, [code, navigate]);

  const handleJoin = async () => {
    if (!gameCode.trim() || !playerName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mã game và tên của bạn',
        variant: 'destructive',
      });
      return;
    }

    setJoining(true);
    try {
      const { player, error } = await joinGame(gameCode.toUpperCase(), playerName);
      if (error || !player) {
        throw error || new Error('Không thể tham gia game');
      }

      // Store player ID in localStorage
      localStorage.setItem(`player_${gameCode.toUpperCase()}`, player.id);
      localStorage.setItem(`is_host_${gameCode.toUpperCase()}`, player.is_host ? 'true' : 'false');

      toast({
        title: 'Tham gia thành công!',
        description: 'Đang chuyển đến phòng chờ...',
      });

      navigate(`/game/lobby/${gameCode.toUpperCase()}`);
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Users className="h-12 w-12 text-blue-300" />
              <h1 className="text-4xl font-bold">Tham gia game</h1>
            </div>
            <p className="text-xl text-blue-100">Nhập mã game và tên của bạn</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Thông tin tham gia</CardTitle>
              <CardDescription className="text-center text-blue-100">
                Mã game: {gameCode || 'Chưa có'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {code && (
                <div className="flex justify-center">
                  <QRCode value={`${window.location.origin}/game/join/${code}`} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Mã game</label>
                <Input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã 6 ký tự"
                  maxLength={6}
                  className="bg-white text-gray-800 text-center text-2xl font-bold tracking-widest uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tên của bạn</label>
                <Input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="bg-white text-gray-800"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoin();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleJoin}
                disabled={joining || !gameCode.trim() || !playerName.trim()}
                className="w-full"
                size="lg"
              >
                {joining ? 'Đang tham gia...' : 'Tham gia game'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameJoin;

