import type { Database } from '@/integrations/supabase/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

type Player = Database['public']['Tables']['players']['Row'];

interface PlayerListProps {
  players: Player[];
  maxPlayers?: number;
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, maxPlayers = 4 }) => {
  const getPlayerIcon = (position: number | null) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.position && b.position) return a.position - b.position;
    return b.score - a.score;
  });

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Người chơi ({players.length}/{maxPlayers})
      </h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-500 text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{player.name}</span>
                  {getPlayerIcon(player.position || index + 1)}
                </div>
                <span className="text-sm text-gray-500">
                  Điểm: <span className="font-bold text-blue-600">{player.score}</span>
                </span>
              </div>
            </div>
            {player.position && (
              <Badge variant="outline" className="text-lg px-3 py-1">
                #{player.position}
              </Badge>
            )}
          </div>
        ))}
        {players.length < maxPlayers && (
          <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <p className="text-gray-500 text-sm">
              Đang chờ người chơi... ({maxPlayers - players.length} chỗ trống)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

