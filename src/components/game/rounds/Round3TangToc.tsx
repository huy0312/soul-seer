import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Timer } from '@/components/game/Timer';
import { Scoreboard } from '@/components/game/Scoreboard';
import type { Database } from '@/integrations/supabase/types';
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface Round3TangTocProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  onSubmitAnswer: (questionId: string, answer: string, responseTime: number) => Promise<void>;
  onNextQuestion: () => void;
  onRoundComplete: () => void;
  timeLimit?: number; // in seconds per question
}

export const Round3TangToc: React.FC<Round3TangTocProps> = ({
  questions,
  players,
  currentPlayerId,
  onSubmitAnswer,
  onNextQuestion,
  onRoundComplete,
  timeLimit = 30,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [timeUp, setTimeUp] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? playerAnswers.get(currentQuestion.id) : null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    setStartTime(Date.now());
    setTimeUp(false);
    setAnswer('');
  }, [currentQuestionIndex]);

  const handleTimeUp = () => {
    setTimeUp(true);
    // Auto move to next question after time up
    setTimeout(() => {
      if (!isLastQuestion) {
        handleNext();
      }
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || submitting || !answer.trim() || timeUp) return;

    const responseTime = Math.floor((Date.now() - startTime) / 1000); // in seconds
    setSubmitting(true);
    try {
      await onSubmitAnswer(currentQuestion.id, answer, responseTime);
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
        <div className="flex items-center justify-center gap-3 mb-2">
          <Zap className="h-8 w-8 text-yellow-400" />
          <h2 className="text-3xl font-bold">Phần 3 - Tăng tốc</h2>
        </div>
        <p className="text-blue-200">Tốc độ cao - Phản ứng nhanh để giành điểm cao nhất</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Section */}
        <div className="lg:col-span-2 space-y-6">
          <Timer
            initialTime={timeLimit}
            onTimeUp={handleTimeUp}
            paused={!!currentAnswer || timeUp}
            className="mb-4"
          />

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Câu hỏi {currentQuestionIndex + 1}</CardTitle>
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-200 border-yellow-300">
                  {currentQuestion.points} điểm
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-white/5 rounded-lg">
                <p className="text-xl font-medium text-white">{currentQuestion.question_text}</p>
              </div>

              {!currentAnswer && !timeUp ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời nhanh..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !submitting) {
                        handleSubmit();
                      }
                    }}
                    className="text-lg"
                    disabled={submitting}
                    autoFocus
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
              ) : timeUp && !currentAnswer ? (
                <div className="p-4 bg-red-500/20 rounded-lg border border-red-400 text-center">
                  <p className="text-red-300 font-semibold">Hết thời gian!</p>
                  <p className="text-red-200 text-sm mt-1">Đáp án đúng: {currentQuestion.correct_answer}</p>
                </div>
              ) : currentAnswer ? (
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
              ) : null}

              <div className="flex justify-between items-center pt-4">
                <span className="text-blue-200">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </span>
                {currentAnswer && (
                  <Button onClick={handleNext} size="lg">
                    {isLastQuestion ? 'Kết thúc phần 3' : 'Câu tiếp theo'}
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

