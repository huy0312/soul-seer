import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { joinGame } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';

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

  // Lấy tên người chơi từ location state
  const playerName = location.state?.playerName as string | undefined;
  const isHost = location.state?.isHost as boolean | undefined;

  // Nếu không có tên, quay lại trang chủ
  if (!playerName || !code) {
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

    setJoining(true);
    try {
      const character = CHARACTERS.find((c) => c.id === selectedCharacter);
      if (!character) {
        throw new Error('Character not found');
      }

      const { player, error } = await joinGame(code, playerName, isHost || false, character.image);
      if (error || !player) {
        throw error || new Error('Không thể tham gia game');
      }

      // Store player ID and host status in localStorage
      localStorage.setItem(`player_${code}`, player.id);
      if (isHost) {
        localStorage.setItem(`is_host_${code}`, 'true');
      }

      toast({
        title: 'Tham gia thành công!',
        description: 'Đang chuyển đến phòng chờ...',
      });

      if (isHost) {
        // Host goes to questions page
        navigate(`/game/questions/${code}`);
      } else {
        // Players go to lobby
        navigate(`/game/lobby/${code}`);
      }
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CHARACTERS.map((character) => {
                  const isSelected = selectedCharacter === character.id;
                  return (
                    <button
                      key={character.id}
                      onClick={() => setSelectedCharacter(character.id)}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-400/50 scale-105'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="aspect-square mb-3 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback nếu ảnh không tồn tại
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&size=200&background=random`;
                          }}
                        />
                      </div>
                      <p className="text-sm font-medium text-center">{playerName}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-6 w-6 text-yellow-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleJoinGame}
                  disabled={!selectedCharacter || joining}
                  className="w-full"
                  size="lg"
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

