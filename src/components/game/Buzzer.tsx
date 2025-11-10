import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BuzzerProps {
  playerId: string;
  playerName: string;
  onBuzzerPress: (playerId: string, playerName: string) => void;
  disabled?: boolean;
  firstPress?: string | null; // ID of player who pressed first
}

export const Buzzer: React.FC<BuzzerProps> = ({
  playerId,
  playerName,
  onBuzzerPress,
  disabled = false,
  firstPress = null,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (firstPress && firstPress !== playerId) {
      setIsPressed(false);
    }
  }, [firstPress, playerId]);

  const handlePress = () => {
    if (disabled || isPressed || firstPress) return;

    setIsPressed(true);
    onBuzzerPress(playerId, playerName);
    toast({
      title: 'Đã bấm chuông!',
      description: `${playerName} đã bấm chuông`,
    });
  };

  const isFirst = firstPress === playerId;
  const isDisabled = disabled || (firstPress !== null && !isFirst);

  return (
    <Card
      className={`${
        isFirst
          ? 'bg-yellow-500/30 border-yellow-400 border-2'
          : isDisabled
            ? 'bg-gray-500/20 border-gray-400/20'
            : 'bg-white/10 border-white/20 hover:bg-white/20'
      } transition-all duration-200`}
    >
      <CardContent className="p-4">
        <Button
          onClick={handlePress}
          disabled={isDisabled}
          className={`w-full h-24 text-lg font-bold ${
            isFirst
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : isDisabled
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Bell className={`h-8 w-8 ${isFirst ? 'animate-bounce' : ''}`} />
            <span>{playerName}</span>
            {isFirst && <span className="text-xs">Bấm đầu tiên!</span>}
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

