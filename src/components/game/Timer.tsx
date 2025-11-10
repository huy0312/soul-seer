import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  paused?: boolean;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({
  initialTime,
  onTimeUp,
  paused = false,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (paused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paused, timeLeft, onTimeUp]);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 10;

  return (
    <Card
      className={`${className} ${
        isLowTime ? 'bg-red-500/20 border-red-500' : 'bg-white/10 border-white/20'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-3">
          <Clock className={`h-6 w-6 ${isLowTime ? 'text-red-400' : 'text-blue-300'}`} />
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${
                isLowTime ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            {paused && <div className="text-sm text-blue-200 mt-1">Đã tạm dừng</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

