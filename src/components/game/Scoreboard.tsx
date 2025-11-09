import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star } from 'lucide-react';

type Player = Database['public']['Tables']['players']['Row'];

interface ScoreboardProps {
  players: Player[];
  showPositions?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players, showPositions = true }) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.position && b.position) return a.position - b.position;
    return b.score - a.score;
  });

  const getPositionIcon = (position: number | null, index: number) => {
    const pos = position || index + 1;
    if (pos === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (pos === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (pos === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <Star className="h-5 w-5 text-gray-400" />;
  };

  const getPositionColor = (position: number | null, index: number) => {
    const pos = position || index + 1;
    if (pos === 1) return 'bg-yellow-50 border-yellow-300';
    if (pos === 2) return 'bg-gray-50 border-gray-300';
    if (pos === 3) return 'bg-amber-50 border-amber-300';
    return 'bg-white border-gray-200';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Bảng điểm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const position = player.position || index + 1;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${getPositionColor(
                  player.position,
                  index
                )}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getPositionIcon(player.position, index)}
                    {showPositions && (
                      <span className="text-2xl font-bold text-gray-700">#{position}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      Đã tham gia: {new Date(player.joined_at).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg px-4 py-2 bg-blue-50 text-blue-700">
                    {player.score} điểm
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

