import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer } from '@/components/game/Timer';
import { Scoreboard } from '@/components/game/Scoreboard';
import type { Database } from '@/integrations/supabase/types';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'] & {
  options?: string[] | null;
};
type Player = Database['public']['Tables']['players']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface Round1KhoiDongProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<void>;
  onRoundComplete: () => void;
  timeLimit?: number; // Total time for the round in seconds (default 60)
}

export const Round1KhoiDong: React.FC<Round1KhoiDongProps> = ({
  questions,
  players,
  currentPlayerId,
  onSubmitAnswer,
  onRoundComplete,
  timeLimit = 60,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(timeLimit);
  const [roundEnded, setRoundEnded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? playerAnswers.get(currentQuestion.id) : null;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const totalScore = currentPlayer?.score || 0;
  const answeredCount = playerAnswers.size;
  const correctCount = Array.from(playerAnswers.values()).filter((a) => a.is_correct).length;

  // Parse options from JSON if exists
  const questionOptions = currentQuestion?.options
    ? (typeof currentQuestion.options === 'string'
        ? JSON.parse(currentQuestion.options)
        : currentQuestion.options)
    : null;

  // Timer for the entire round
  useEffect(() => {
    if (roundEnded || showResults) return;

    const timer = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev <= 1) {
          setRoundEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundEnded, showResults]);

  // Auto advance to next question after answering
  useEffect(() => {
    if (currentAnswer && !roundEnded && !showResults) {
      // Auto advance after 2 seconds
      const timer = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer('');
        }
        // Don't auto-end round, wait for timer or host to move to next round
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentAnswer, currentQuestionIndex, questions.length, roundEnded, showResults]);

  // When round ends, show results
  useEffect(() => {
    if (roundEnded && !showResults) {
      // Wait a bit then show results
      const timer = setTimeout(() => {
        setShowResults(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [roundEnded, showResults]);

  const handleSelectAnswer = (option: string) => {
    if (currentAnswer || submitting || roundEnded) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || submitting || !selectedAnswer || currentAnswer || roundEnded) return;

    setSubmitting(true);
    try {
      await onSubmitAnswer(currentQuestion.id, selectedAnswer);
      // Answer will be updated via subscription or refetch
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto submit when answer is selected (optional - can be changed to require button click)
  useEffect(() => {
    if (selectedAnswer && !currentAnswer && !submitting && !roundEnded && currentQuestion) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 500); // Auto submit after 500ms of selection
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer, currentAnswer, submitting, roundEnded, currentQuestion]);

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Phần 1 - Khởi động đã kết thúc</h2>
          <p className="text-blue-200">Tổng kết điểm số</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Kết quả của bạn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border-2 border-yellow-400">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <span className="text-4xl font-bold text-white">{totalScore}</span>
                </div>
                <p className="text-blue-200">Tổng điểm</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400">
                  <p className="text-2xl font-bold text-white">{answeredCount}</p>
                  <p className="text-blue-200 text-sm">Câu đã trả lời</p>
                </div>
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-400">
                  <p className="text-2xl font-bold text-white">{correctCount}</p>
                  <p className="text-green-200 text-sm">Câu trả lời đúng</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-blue-200 text-sm">
                  Đang chờ người tổ chức chuyển sang phần thi tiếp theo...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-2xl mx-auto">
          <Scoreboard players={players.filter((p) => !p.is_host)} />
        </div>
      </div>
    );
  }

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
        <p className="text-blue-200">12 câu hỏi trắc nghiệm - Thời gian: {timeLimit} giây</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer */}
          <Timer
            initialTime={roundTimeLeft}
            onTimeUp={() => setRoundEnded(true)}
            paused={roundEnded}
            className="mb-4"
          />

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </CardTitle>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-300">
                  {currentQuestion.points} điểm
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-white/5 rounded-lg">
                <p className="text-xl font-medium text-white">{currentQuestion.question_text}</p>
              </div>

              {!currentAnswer && !roundEnded ? (
                <div className="space-y-3">
                  {questionOptions && questionOptions.length === 4 ? (
                    // Multiple choice with 4 options
                    questionOptions.map((option: string, index: number) => {
                      const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                      const isSelected = selectedAnswer === option;
                      return (
                        <Button
                          key={index}
                          onClick={() => handleSelectAnswer(option)}
                          disabled={submitting || roundEnded}
                          className={`w-full h-auto py-4 px-6 text-left justify-start ${
                            isSelected
                              ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400'
                              : 'bg-white/10 hover:bg-white/20 border-2 border-transparent'
                          }`}
                          variant="outline"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white/20 text-white'
                              }`}
                            >
                              {optionLabel}
                            </div>
                            <span className="text-lg flex-1">{option}</span>
                          </div>
                        </Button>
                      );
                    })
                  ) : (
                    // Fallback: show message if no options
                    <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-400 text-center">
                      <p className="text-yellow-200">
                        Câu hỏi này chưa có đáp án trắc nghiệm. Vui lòng liên hệ người tổ chức.
                      </p>
                    </div>
                  )}
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
                    ) : (
                      <XCircle className="h-6 w-6 text-red-400" />
                    )}
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
              ) : roundEnded ? (
                <div className="p-4 bg-red-500/20 rounded-lg border border-red-400 text-center">
                  <p className="text-red-300 font-semibold">Hết thời gian!</p>
                  <p className="text-red-200 text-sm mt-1">Đang tính điểm...</p>
                </div>
              ) : null}
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
