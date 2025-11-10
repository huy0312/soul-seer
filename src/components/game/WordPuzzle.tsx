import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock } from 'lucide-react';

interface WordPuzzleProps {
  word: string;
  hint?: string;
  onSolve: (answer: string) => void;
  revealedIndices?: number[];
  autoRevealInterval?: number; // in seconds
}

export const WordPuzzle: React.FC<WordPuzzleProps> = ({
  word,
  hint,
  onSolve,
  revealedIndices = [],
  autoRevealInterval,
}) => {
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState<number[]>(revealedIndices);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setRevealed(revealedIndices);
  }, [revealedIndices]);

  useEffect(() => {
    if (autoRevealInterval && !solved && revealed.length < word.length) {
      const timer = setInterval(() => {
        setRevealed((prev) => {
          if (prev.length >= word.length) {
            clearInterval(timer);
            return prev;
          }
          // Reveal next letter
          const nextIndex = prev.length;
          return [...prev, nextIndex];
        });
      }, autoRevealInterval * 1000);

      return () => clearInterval(timer);
    }
  }, [autoRevealInterval, word.length, solved, revealed.length]);

  const handleSubmit = () => {
    if (answer.trim().toLowerCase() === word.toLowerCase()) {
      setSolved(true);
      onSolve(answer.trim());
    }
  };

  const displayWord = word.split('').map((char, index) => {
    const isRevealed = revealed.includes(index);
    const isSpace = char === ' ';

    return (
      <div
        key={index}
        className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold text-lg ${
          isRevealed
            ? 'bg-green-100 border-green-400 text-gray-800'
            : isSpace
              ? 'border-transparent'
              : 'bg-gray-200 border-gray-400 text-gray-400'
        }`}
      >
        {isRevealed ? char : isSpace ? '' : '?'}
      </div>
    );
  });

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Giải từ khóa</CardTitle>
        {hint && (
          <div className="text-center mt-2">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-300">
              Gợi ý: {hint}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">{displayWord}</div>

        {!solved && (
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Nhập từ khóa..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                className="text-center text-lg"
              />
            </div>
            <Button onClick={handleSubmit} className="w-full" size="lg">
              Xác nhận
            </Button>
          </div>
        )}

        {solved && (
          <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-400">
            <p className="text-green-200 font-semibold text-lg">Đã giải thành công!</p>
            <p className="text-green-300 mt-1">Từ khóa: {word}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-blue-200">
          {revealed.length < word.length ? (
            <>
              <Lock className="h-4 w-4" />
              <span>Đã mở: {revealed.length}/{word.length} ký tự</span>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              <span>Tất cả ký tự đã được mở</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

