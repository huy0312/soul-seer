import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Question = Database['public']['Tables']['questions']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface QuestionDisplayProps {
  question: Question;
  playerAnswer?: Answer | null;
  onSubmitAnswer: (answer: string) => Promise<void>;
  isAnswered?: boolean;
  timeLimit?: number; // in seconds
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  playerAnswer,
  onSubmitAnswer,
  isAnswered = false,
  timeLimit,
}) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLimit, timeLeft, isAnswered]);

  const handleSubmit = async () => {
    if (!answer.trim() || submitting || isAnswered) return;

    setSubmitting(true);
    try {
      await onSubmitAnswer(answer.trim());
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const showResult = isAnswered && playerAnswer;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Câu hỏi</CardTitle>
          {timeLimit && timeLeft > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <Clock className="h-5 w-5" />
              <span className="font-bold text-xl">{timeLeft}s</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-lg font-medium text-gray-800">{question.question_text}</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              {question.points} điểm
            </Badge>
          </div>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Câu trả lời của bạn
              </label>
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Nhập câu trả lời..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                disabled={submitting || timeLeft === 0}
                className="text-lg"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting || timeLeft === 0}
              className="w-full"
              size="lg"
            >
              {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                playerAnswer.is_correct
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {playerAnswer.is_correct ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <span
                  className={`font-semibold ${
                    playerAnswer.is_correct ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {playerAnswer.is_correct ? 'Đúng!' : 'Sai!'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Câu trả lời của bạn:</strong> {playerAnswer.answer_text}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Đáp án đúng:</strong> {question.correct_answer}
              </p>
              {playerAnswer.points_earned > 0 && (
                <p className="text-sm font-bold text-green-600 mt-2">
                  +{playerAnswer.points_earned} điểm
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

