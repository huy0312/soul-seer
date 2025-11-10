import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Timer } from '@/components/game/Timer';
import { Scoreboard } from '@/components/game/Scoreboard';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { CheckCircle2, XCircle, Trophy, AlertTriangle } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'] & {
  options?: string[] | null;
};
type Player = Database['public']['Tables']['players']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface Round1KhoiDongProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<Answer | null>;
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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [penaltyApplied, setPenaltyApplied] = useState(false);
  const lastVisibilityChangeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const answeredQuestionIdsRef = useRef<Set<string>>(new Set()); // Track which questions have been answered to prevent duplicate notifications
  const lastPenaltyTimeRef = useRef<number>(0); // Track last penalty time to prevent multiple penalties in short time

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? playerAnswers.get(currentQuestion.id) : null;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  
  // Reset selected answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      // Only reset if we don't have an answer yet for this question
      if (!currentAnswer) {
        setSelectedAnswer('');
      }
    }
  }, [currentQuestionIndex, currentQuestion?.id, currentAnswer]);
  const totalScore = currentPlayer?.score || 0;
  const answeredCount = playerAnswers.size;
  const correctCount = Array.from(playerAnswers.values()).filter((a) => a.is_correct).length;

  // Parse options from JSON if exists
  const questionOptions = currentQuestion?.options
    ? (typeof currentQuestion.options === 'string'
        ? JSON.parse(currentQuestion.options)
        : currentQuestion.options)
    : null;

  // Detect tab/window visibility changes and apply penalty IMMEDIATELY when leaving
  useEffect(() => {
    if (roundEnded || showResults) return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;

      // If tab becomes hidden (user switched away) - APPLY PENALTY IMMEDIATELY
      if (!isVisible && isVisibleRef.current) {
        isVisibleRef.current = false;
        const now = Date.now();
        lastVisibilityChangeRef.current = now;
        
        // Prevent multiple penalties within 2 seconds
        if (now - lastPenaltyTimeRef.current < 2000) {
          return;
        }
        
        lastPenaltyTimeRef.current = now;
        
        // Apply penalty immediately when leaving
        setRoundTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 15); // Subtract 15 seconds immediately
          setTabSwitchCount((count) => count + 1);
          setPenaltyApplied(true);
          
          toast({
            title: 'Cảnh báo!',
            description: `Bạn đã rời khỏi màn hình. Bị trừ 15 giây. Thời gian còn lại: ${newTime} giây`,
            variant: 'destructive',
          });

          // Reset penalty flag after showing
          setTimeout(() => setPenaltyApplied(false), 3000);

          if (newTime <= 0) {
            setRoundEnded(true);
            return 0;
          }
          return newTime;
        });
      }
      // If tab becomes visible again (user came back)
      else if (isVisible && !isVisibleRef.current) {
        isVisibleRef.current = true;
        // No penalty on return, already applied when leaving
      }
    };

    const handleBlur = () => {
      // Apply penalty immediately when window loses focus
      if (isVisibleRef.current && !roundEnded && !showResults) {
        isVisibleRef.current = false;
        const now = Date.now();
        lastVisibilityChangeRef.current = now;
        
        // Prevent multiple penalties within 2 seconds
        if (now - lastPenaltyTimeRef.current < 2000) {
          return;
        }
        
        lastPenaltyTimeRef.current = now;
        
        setRoundTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 15);
          setTabSwitchCount((count) => count + 1);
          setPenaltyApplied(true);
          
          toast({
            title: 'Cảnh báo!',
            description: `Bạn đã rời khỏi màn hình. Bị trừ 15 giây. Thời gian còn lại: ${newTime} giây`,
            variant: 'destructive',
          });

          setTimeout(() => setPenaltyApplied(false), 3000);

          if (newTime <= 0) {
            setRoundEnded(true);
            return 0;
          }
          return newTime;
        });
      }
    };

    const handleFocus = () => {
      // Just mark as visible when returning, no penalty
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
      }
    };

    // Listen to visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [roundEnded, showResults]);

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
    if (currentAnswer && !roundEnded && !showResults && currentQuestion) {
      // Auto advance after 2 seconds
      const timer = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setSelectedAnswer('');
        }
        // Don't auto-end round, wait for timer or host to move to next round
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentAnswer, currentQuestionIndex, questions.length, roundEnded, showResults, currentQuestion]);

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

    // Prevent duplicate submissions
    if (answeredQuestionIdsRef.current.has(currentQuestion.id)) {
      return;
    }

    setSubmitting(true);
    try {
      const answerData = await onSubmitAnswer(currentQuestion.id, selectedAnswer);
      // Update local state immediately with the answer
      if (answerData && currentQuestion) {
        setPlayerAnswers((prev) => new Map(prev.set(currentQuestion.id, answerData)));
        answeredQuestionIdsRef.current.add(currentQuestion.id);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto submit when answer is selected
  useEffect(() => {
    if (selectedAnswer && !currentAnswer && !submitting && !roundEnded && currentQuestion) {
      // Check if already answered to prevent duplicate
      if (answeredQuestionIdsRef.current.has(currentQuestion.id)) {
        return;
      }
      
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
        
        {/* Initial warning about tab switching penalty */}
        {tabSwitchCount === 0 && !roundEnded && !showResults && (
          <Alert className="mt-4 bg-yellow-500/20 border-yellow-400 max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200 text-sm">
              <strong>Lưu ý:</strong> Rời khỏi màn hình sẽ bị trừ 15 giây mỗi lần
            </AlertDescription>
          </Alert>
        )}

        {/* Show penalty count if user has switched tabs */}
        {tabSwitchCount > 0 && (
          <Alert className="mt-4 bg-red-500/20 border-red-400 max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Đã rời khỏi màn hình {tabSwitchCount} lần. Mỗi lần bị trừ 15 giây.
            </AlertDescription>
          </Alert>
        )}

        {/* Show immediate penalty notification */}
        {penaltyApplied && (
          <Alert className="mt-2 bg-red-500/30 border-red-400 max-w-md mx-auto animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200 font-semibold">
              ⚠️ Bị trừ 15 giây vì rời khỏi màn hình!
            </AlertDescription>
          </Alert>
        )}
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
              {/* Question Display - Transparent and Clear */}
              <div className="p-6 bg-white/10 rounded-lg border-2 border-white/20">
                <div className="mb-2">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-300 mb-3">
                    Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                  </Badge>
                </div>
                <p className="text-2xl font-semibold text-white leading-relaxed">
                  {currentQuestion.question_text}
                </p>
              </div>

              {!currentAnswer && !roundEnded ? (
                <div className="space-y-3">
                  <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
                    <p className="text-sm text-blue-200 text-center">
                      <strong>Chọn một trong 4 đáp án bên dưới:</strong>
                    </p>
                  </div>
                  {questionOptions && questionOptions.length === 4 ? (
                    // Multiple choice with 4 options - Clear and transparent
                    questionOptions.map((option: string, index: number) => {
                      const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                      const isSelected = selectedAnswer === option;
                      return (
                        <Button
                          key={index}
                          onClick={() => handleSelectAnswer(option)}
                          disabled={submitting || roundEnded}
                          className={`w-full h-auto py-5 px-6 text-left justify-start transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 shadow-lg scale-[1.02]'
                              : 'bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40'
                          }`}
                          variant="outline"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                isSelected
                                  ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                                  : 'bg-white/20 text-white'
                              }`}
                            >
                              {optionLabel}
                            </div>
                            <span className="text-lg font-medium flex-1 text-white">{option}</span>
                            {isSelected && (
                              <CheckCircle2 className="h-6 w-6 text-blue-300" />
                            )}
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
                  className={`p-6 rounded-lg border-2 ${
                    currentAnswer.is_correct
                      ? 'bg-green-500/20 border-green-400'
                      : 'bg-red-500/20 border-red-400'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {currentAnswer.is_correct ? (
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-400" />
                    )}
                    <span
                      className={`text-2xl font-bold ${
                        currentAnswer.is_correct ? 'text-green-300' : 'text-red-300'
                      }`}
                    >
                      {currentAnswer.is_correct ? 'Đúng!' : 'Sai!'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="p-3 bg-white/5 rounded">
                      <p className="text-sm text-blue-200 mb-1">
                        <strong>Câu trả lời của bạn:</strong>
                      </p>
                      <p className="text-lg font-medium text-white">{currentAnswer.answer_text}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded">
                      <p className="text-sm text-blue-200 mb-1">
                        <strong>Đáp án đúng:</strong>
                      </p>
                      <p className="text-lg font-medium text-white">{currentQuestion.correct_answer}</p>
                    </div>
                  </div>
                  {currentAnswer.points_earned > 0 && (
                    <div className="mt-4 p-4 bg-green-500/30 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-300">
                        +{currentAnswer.points_earned} điểm
                      </p>
                    </div>
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
