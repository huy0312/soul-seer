import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

interface PodiumProps {
  player: Player | null;
  position: number; // 1-4
  isHost?: boolean;
}

export const Podium: React.FC<PodiumProps> = ({ player, position, isHost = false }) => {
  const getPodiumHeight = () => {
    // All podiums have the same height
    return 'h-32';
  };

  const getPodiumColor = () => {
    if (!player) return 'bg-gray-600/30';
    const colors = {
      1: 'bg-gradient-to-t from-yellow-600 to-yellow-400',
      2: 'bg-gradient-to-t from-gray-400 to-gray-300',
      3: 'bg-gradient-to-t from-orange-600 to-orange-400',
      4: 'bg-gradient-to-t from-blue-600 to-blue-400',
    };
    return colors[position as keyof typeof colors] || 'bg-gray-600/30';
  };

  const getPositionLabel = () => {
    const labels = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
      4: '4️⃣',
    };
    return labels[position as keyof typeof labels] || '';
  };

  return (
    <div className="flex flex-col items-center justify-end h-full">
      {/* Player name and avatar */}
      <div className="mb-2 text-center">
        {player ? (
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg border-2 border-white/30 flex items-center justify-center overflow-hidden relative">
                {player.avatar_url ? (
                  <>
                    <img
                      src={player.avatar_url}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide image and show icon fallback
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const icon = target.nextElementSibling as HTMLElement;
                        if (icon) {
                          icon.style.display = 'block';
                        }
                      }}
                    />
                    <User className="h-8 w-8 text-white hidden" />
                  </>
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              {isHost && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                  👑
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-white max-w-[120px] truncate">
              {player.name}
            </p>
            <p className="text-xs text-blue-200">{getPositionLabel()}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-lg border-2 border-dashed border-white/20 flex items-center justify-center">
              <User className="h-8 w-8 text-white/30" />
            </div>
            <p className="text-sm text-white/50">Chờ thí sinh</p>
          </div>
        )}
      </div>

      {/* Podium base */}
      <Card
        className={`${getPodiumHeight()} ${getPodiumColor()} w-full border-2 border-white/30 shadow-lg rounded-t-lg flex items-center justify-center transition-all duration-300 ${
          player ? 'ring-2 ring-white/50' : ''
        }`}
      >
        <CardContent className="p-0 w-full h-full flex items-center justify-center">
          <div className="text-center">
            {player && (
              <div className="text-white font-bold text-lg">
                {player.score || 0}
              </div>
            )}
            <div className="text-white/80 text-xs mt-1">
              Vị trí {position}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

