import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Scoreboard } from '@/components/game/Scoreboard';
import type { Database } from '@/integrations/supabase/types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface Round1KhoiDongProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<void>;
  onNextQuestion: () => void;
  onRoundComplete: () => void;
}

export const Round1KhoiDong: React.FC<Round1KhoiDongProps> = ({
  questions,
  players,
  currentPlayerId,
  onSubmitAnswer,
  onNextQuestion,
  onRoundComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? playerAnswers.get(currentQuestion.id) : null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    setAnswer('');
  }, [currentQuestionIndex]);

  const handleSubmit = async () => {
    if (!currentQuestion || submitting || !answer.trim()) return;

    setSubmitting(true);
    try {
      await onSubmitAnswer(currentQuestion.id, answer);
      // Reload answer to get updated state
      // This would typically come from a subscription or refetch
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onRoundComplete();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      onNextQuestion();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center p-8">
        <p className="text-xl text-blue-200">Không có câu hỏi nào trong phần này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Phần 1 - Khởi động</h2>
        <p className="text-blue-200">Câu hỏi nhanh - Trả lời đúng để tích điểm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Câu hỏi {currentQuestionIndex + 1}</CardTitle>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-300">
                  {currentQuestion.points} điểm
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-white/5 rounded-lg">
                <p className="text-xl font-medium text-white">{currentQuestion.question_text}</p>
              </div>

              {!currentAnswer ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !submitting) {
                        handleSubmit();
                      }
                    }}
                    className="text-lg"
                    disabled={submitting}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                  </Button>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-lg border-2 ${
                    currentAnswer.is_correct
                      ? 'bg-green-500/20 border-green-400'
                      : 'bg-red-500/20 border-red-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {currentAnswer.is_correct ? (
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    ) : null}
                    <span
                      className={`font-semibold ${
                        currentAnswer.is_correct ? 'text-green-300' : 'text-red-300'
                      }`}
                    >
                      {currentAnswer.is_correct ? 'Đúng!' : 'Sai!'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-200 mb-1">
                    <strong>Câu trả lời của bạn:</strong> {currentAnswer.answer_text}
                  </p>
                  <p className="text-sm text-blue-200">
                    <strong>Đáp án đúng:</strong> {currentQuestion.correct_answer}
                  </p>
                  {currentAnswer.points_earned > 0 && (
                    <p className="text-lg font-bold text-green-300 mt-2">
                      +{currentAnswer.points_earned} điểm
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <span className="text-blue-200">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </span>
                {currentAnswer && (
                  <Button onClick={handleNext} size="lg">
                    {isLastQuestion ? 'Kết thúc phần 1' : 'Câu tiếp theo'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scoreboard */}
        <div>
          <Scoreboard players={players.filter((p) => !p.is_host)} />
        </div>
      </div>
    </div>
  );
};

