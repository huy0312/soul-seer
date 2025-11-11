import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

interface RoundResultModalProps {
  isOpen: boolean;
  players: Player[];
  roundName: string;
  onClose: () => void;
}

export const RoundResultModal: React.FC<RoundResultModalProps> = ({
  isOpen,
  players,
  roundName,
  onClose,
}) => {
  // Sort players by score (descending)
  const sortedPlayers = [...players]
    .filter((p) => !p.is_host)
    .sort((a, b) => b.score - a.score);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-400" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return <TrendingUp className="h-8 w-8 text-blue-400" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-500/20 border-yellow-400';
      case 2:
        return 'bg-gray-500/20 border-gray-400';
      case 3:
        return 'bg-amber-500/20 border-amber-400';
      default:
        return 'bg-blue-500/20 border-blue-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2">
            Kết quả {roundName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {sortedPlayers.map((player, index) => {
            const position = index + 1;
            return (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 ${getPositionColor(position)} transition-all hover:scale-105`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
                      {getPositionIcon(position)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">#{position}</span>
                        <span className="text-xl font-semibold">{player.name}</span>
                      </div>
                      <div className="text-sm text-blue-200 mt-1">
                        Tổng điểm: <span className="font-bold text-yellow-400">{player.score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{player.score}</div>
                    <div className="text-sm text-blue-200">điểm</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

