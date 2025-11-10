import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Timer } from '@/components/game/Timer';
import { Scoreboard } from '@/components/game/Scoreboard';
import { toast } from '@/hooks/use-toast';
import { getAnswersForRound } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { CheckCircle2, XCircle, Trophy, AlertTriangle, Crown, Volume2, VolumeX } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'] & {
  options?: string[] | null;
};
type Player = Database['public']['Tables']['players']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface Round1KhoiDongProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  gameId: string;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<Answer | null>;
  onRoundComplete: () => void;
  timeLimit?: number; // Total time for the round in seconds (default 60)
}

export const Round1KhoiDong: React.FC<Round1KhoiDongProps> = ({
  questions,
  players,
  currentPlayerId,
  gameId,
  onSubmitAnswer,
  onRoundComplete,
  timeLimit = 60,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [allPlayersAnswers, setAllPlayersAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(timeLimit);
  const [roundEnded, setRoundEnded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allPlayersCompleted, setAllPlayersCompleted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const answeredQuestionIdsRef = useRef<Set<string>>(new Set()); // Track which questions have been answered to prevent duplicate notifications
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  
  // Find leader (player with highest score)
  const playingPlayers = players.filter((p) => !p.is_host);
  const sortedPlayers = [...playingPlayers].sort((a, b) => b.score - a.score);
  const leader = sortedPlayers.length > 0 ? sortedPlayers[0] : null;
  const isCurrentPlayerLeader = leader && leader.id === currentPlayerId;

  // Parse options from JSON if exists
  const questionOptions = currentQuestion?.options
    ? (typeof currentQuestion.options === 'string'
        ? JSON.parse(currentQuestion.options)
        : currentQuestion.options)
    : null;


  // Background music management
  useEffect(() => {
    // Create audio element if not exists
    if (!audioRef.current) {
      audioRef.current = new Audio('/music/khoi-dong-bg.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5; // 50% volume
    }

    const audio = audioRef.current;

    // Play music when round starts (not ended, not showing results)
    if (!roundEnded && !showResults) {
      audio.play().catch((error) => {
        console.error('Error playing background music:', error);
        // Music might not play due to browser autoplay policy
      });
    } else {
      // Pause music when round ends
      audio.pause();
    }

    // Cleanup: pause music when component unmounts
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [roundEnded, showResults]);

  // Handle music mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMusicMuted;
    }
  }, [isMusicMuted]);

  // Timer for the entire round - when time runs out, show results
  useEffect(() => {
    if (roundEnded || showResults) return;

    const timer = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev <= 1) {
          setRoundEnded(true);
          setShowResults(true);
          // Notify that time is up
          toast({
            title: 'Hết thời gian!',
            description: 'Thời gian đã hết. Đang tính điểm...',
            variant: 'default',
          });
          // Call onRoundComplete after a brief moment
          setTimeout(() => {
            onRoundComplete();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundEnded, showResults, onRoundComplete]);

  // Auto advance to next question immediately after answering (no delay)
  useEffect(() => {
    if (currentAnswer && !roundEnded && !showResults && currentQuestion) {
      // Advance immediately after answering - no delay
      if (currentQuestionIndex < questions.length - 1) {
        // Use setTimeout with 0ms to ensure state update happens after currentAnswer is set
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer('');
        }, 0);
      }
    }
  }, [currentAnswer, currentQuestionIndex, questions.length, roundEnded, showResults, currentQuestion]);

  // Subscribe to answers changes and check if all players completed
  useEffect(() => {
    // Don't check if already showing results
    if (showResults) return;

    const loadAllAnswers = async () => {
      const { answers, error } = await getAnswersForRound(gameId, 'khoi_dong');
      if (error || !answers) {
        console.error('Error loading answers:', error);
        return;
      }
      
      setAllPlayersAnswers(answers);
      
      // Check if all players have completed all questions
      const playingPlayers = players.filter((p) => !p.is_host);
      const totalQuestions = questions.length;
      
      console.log('Checking completion status:', {
        totalPlayers: playingPlayers.length,
        totalQuestions,
        totalAnswers: answers.length,
      });
      
      let allCompleted = true;
      for (const player of playingPlayers) {
        const playerAnswers = answers.filter((a) => a.player_id === player.id);
        console.log(`Player ${player.name}: ${playerAnswers.length}/${totalQuestions} answers`);
        if (playerAnswers.length < totalQuestions) {
          allCompleted = false;
          break;
        }
      }
      
      console.log('All players completed?', allCompleted);
      setAllPlayersCompleted(allCompleted);
    };

    // Load answers initially
    loadAllAnswers();

    // Subscribe to answers changes - but only if not showing results
    if (!showResults) {
      const questionIds = questions.map((q) => q.id);
      const channelName = `answers:${gameId}:${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'answers',
            filter: `question_id=in.(${questionIds.join(',')})`,
          },
          () => {
            // Reload answers when any answer changes
            console.log('Answer changed, reloading...');
            if (!showResults) {
              loadAllAnswers();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [gameId, questions, players, showResults]);

  // When all players completed, show results (regardless of time)
  useEffect(() => {
    if (allPlayersCompleted && !showResults && !roundEnded) {
      console.log('✅ All players completed! Ending round and showing results...');
      // All players completed - end the round immediately
      setRoundEnded(true);
      setShowResults(true);
      
      // Notify that round is complete
      toast({
        title: 'Hoàn thành!',
        description: 'Tất cả thí sinh đã hoàn thành phần thi. Đang tính điểm...',
        variant: 'default',
      });
      
      // Call onRoundComplete after a brief moment to allow UI to update
      const timer = setTimeout(() => {
        onRoundComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allPlayersCompleted, showResults, roundEnded, onRoundComplete]);

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

  // Auto submit immediately when answer is selected
  useEffect(() => {
    if (selectedAnswer && !currentAnswer && !submitting && !roundEnded && currentQuestion) {
      // Check if already answered to prevent duplicate
      if (answeredQuestionIdsRef.current.has(currentQuestion.id)) {
        return;
      }
      
      // Submit immediately without delay
      handleSubmit();
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
        <div className="flex items-center justify-center gap-4 mb-2">
          <h2 className="text-3xl font-bold">Phần 1 - Khởi động</h2>
          {/* Music control button */}
          {!showResults && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMusicMuted(!isMusicMuted)}
              className="text-white hover:bg-white/20"
              title={isMusicMuted ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
            >
              {isMusicMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
        <p className="text-blue-200">12 câu hỏi trắc nghiệm - Thời gian: {timeLimit} giây</p>

        {/* Show leader notification - Update in real-time */}
        {leader && !showResults && (
          <Alert className={`mt-4 max-w-md mx-auto animate-pulse ${
            isCurrentPlayerLeader 
              ? 'bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-400/50' 
              : 'bg-blue-500/20 border-blue-400'
          }`}>
            <Crown className={`h-5 w-5 ${
              isCurrentPlayerLeader ? 'text-yellow-400' : 'text-blue-400'
            }`} />
            <AlertDescription className={
              isCurrentPlayerLeader ? 'text-yellow-200 font-semibold' : 'text-blue-200'
            }>
              {isCurrentPlayerLeader ? (
                <span className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span>👑 Bạn đang dẫn đầu với <strong className="text-yellow-300">{leader.score} điểm</strong>!</span>
                </span>
              ) : (
                <span>
                  <strong className="text-blue-300">{leader.name}</strong> đang dẫn đầu với <strong className="text-blue-300">{leader.score} điểm</strong>
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Show waiting message if not all players completed yet */}
        {!allPlayersCompleted && !showResults && !roundEnded && (
          <Alert className="mt-4 bg-blue-500/20 border-blue-400 max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              Đang chờ tất cả thí sinh hoàn thành phần thi... ({allPlayersAnswers.length} / {questions.length * players.filter(p => !p.is_host).length} câu trả lời)
            </AlertDescription>
          </Alert>
        )}
        
        {/* Show completion message when all players completed */}
        {allPlayersCompleted && !showResults && !roundEnded && (
          <Alert className="mt-4 bg-green-500/20 border-green-400 max-w-md mx-auto animate-pulse">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200 font-semibold">
              ✅ Tất cả thí sinh đã hoàn thành! Đang tính điểm...
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
