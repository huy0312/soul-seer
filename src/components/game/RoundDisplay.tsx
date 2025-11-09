import type { RoundType } from '@/services/gameService';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';

interface RoundDisplayProps {
  currentRound: RoundType | null;
  onRoundClick?: (round: RoundType) => void;
}

const rounds: Array<{ key: RoundType; label: string; description: string }> = [
  {
    key: 'khoi_dong',
    label: 'Khởi động',
    description: 'Phần thi khởi động',
  },
  {
    key: 'vuot_chuong_ngai_vat',
    label: 'Vượt chướng ngại vật',
    description: 'Phần thi vượt chướng ngại vật',
  },
  {
    key: 'tang_toc',
    label: 'Tăng tốc',
    description: 'Phần thi tăng tốc',
  },
  {
    key: 've_dich',
    label: 'Về đích',
    description: 'Phần thi về đích',
  },
];

export const RoundDisplay: React.FC<RoundDisplayProps> = ({ currentRound, onRoundClick }) => {
  const getRoundIndex = (round: RoundType | null): number => {
    if (!round) return -1;
    return rounds.findIndex((r) => r.key === round);
  };

  const currentIndex = getRoundIndex(currentRound);

  return (
    <div className="flex items-center justify-between gap-4 p-6 bg-white rounded-lg shadow-lg">
      {rounds.map((round, index) => {
        const isActive = round.key === currentRound;
        const isCompleted = currentIndex > index;
        const isUpcoming = currentIndex < index;

        return (
          <div
            key={round.key}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
              isActive
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : isCompleted
                  ? 'bg-green-100 text-green-700'
                  : isUpcoming
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-gray-50 text-gray-600'
            }`}
            onClick={() => onRoundClick && !isUpcoming && onRoundClick(round.key)}
            style={{ cursor: onRoundClick && !isUpcoming ? 'pointer' : 'default' }}
          >
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Circle className={`h-6 w-6 ${isActive ? 'fill-white' : ''}`} />
              )}
              <span className="font-bold text-lg">{index + 1}</span>
            </div>
            <span className="font-semibold text-sm text-center">{round.label}</span>
            {isActive && (
              <Badge variant="secondary" className="mt-1 bg-white text-blue-500">
                Đang diễn ra
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};

