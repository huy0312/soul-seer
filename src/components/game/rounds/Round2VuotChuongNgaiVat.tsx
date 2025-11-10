import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Buzzer } from '@/components/game/Buzzer';
import { WordPuzzle } from '@/components/game/WordPuzzle';
import { Scoreboard } from '@/components/game/Scoreboard';
import type { Database } from '@/integrations/supabase/types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface Round2VuotChuongNgaiVatProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<void>;
  onNextQuestion: () => void;
  onRoundComplete: () => void;
}

export const Round2VuotChuongNgaiVat: React.FC<Round2VuotChuongNgaiVatProps> = ({
  questions,
  players,
  currentPlayerId,
  onSubmitAnswer,
  onNextQuestion,
  onRoundComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [firstBuzzerPress, setFirstBuzzerPress] = useState<string | null>(null);
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? playerAnswers.get(currentQuestion.id) : null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isWordPuzzle = currentQuestion?.question_type === 'hang_ngang';

  const handleBuzzerPress = (playerId: string, playerName: string) => {
    if (!firstBuzzerPress) {
      setFirstBuzzerPress(playerId);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || submitting || !answer.trim()) return;

    // Only the first buzzer presser can answer
    if (firstBuzzerPress !== currentPlayerId) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitAnswer(currentQuestion.id, answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setFirstBuzzerPress(null);
    setAnswer('');
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

  const playingPlayers = players.filter((p) => !p.is_host);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Phần 2 - Vượt chướng ngại vật</h2>
        <p className="text-blue-200">Bấm chuông nhanh để giành quyền trả lời</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Section */}
        <div className="lg:col-span-2 space-y-6">
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
              {isWordPuzzle ? (
                <WordPuzzle
                  word={currentQuestion.correct_answer}
                  hint={currentQuestion.hint || undefined}
                  onSolve={(solvedAnswer) => {
                    setAnswer(solvedAnswer);
                    if (firstBuzzerPress === currentPlayerId) {
                      handleSubmit();
                    }
                  }}
                />
              ) : (
                <div className="p-6 bg-white/5 rounded-lg">
                  <p className="text-xl font-medium text-white">{currentQuestion.question_text}</p>
                </div>
              )}

              {/* Buzzer Section */}
              {!currentAnswer && !isWordPuzzle && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {playingPlayers.map((player) => (
                      <Buzzer
                        key={player.id}
                        playerId={player.id}
                        playerName={player.name}
                        onBuzzerPress={handleBuzzerPress}
                        disabled={!!firstBuzzerPress}
                        firstPress={firstBuzzerPress}
                      />
                    ))}
                  </div>

                  {firstBuzzerPress === currentPlayerId && (
                    <div className="space-y-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-400">
                      <p className="text-yellow-200 font-semibold text-center">
                        Bạn đã bấm chuông đầu tiên! Hãy trả lời câu hỏi.
                      </p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Nhập câu trả lời..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !submitting) {
                              handleSubmit();
                            }
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 text-lg"
                          disabled={submitting}
                        />
                        <Button onClick={handleSubmit} disabled={submitting || !answer.trim()} className="w-full" size="lg">
                          {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {firstBuzzerPress && firstBuzzerPress !== currentPlayerId && (
                    <div className="p-4 bg-gray-500/20 rounded-lg border border-gray-400 text-center">
                      <p className="text-gray-300">
                        {playingPlayers.find((p) => p.id === firstBuzzerPress)?.name} đã bấm chuông đầu tiên
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentAnswer && (
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
                    <strong>Câu trả lời:</strong> {currentAnswer.answer_text}
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
                    {isLastQuestion ? 'Kết thúc phần 2' : 'Câu tiếp theo'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scoreboard */}
        <div>
          <Scoreboard players={playingPlayers} />
        </div>
      </div>
    </div>
  );
};

