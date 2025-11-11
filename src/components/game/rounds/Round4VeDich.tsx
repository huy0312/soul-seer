import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Scoreboard } from '@/components/game/Scoreboard';
import type { Database } from '@/integrations/supabase/types';
import { ArrowRight, CheckCircle2, Star, XCircle } from 'lucide-react';
import { getAnswersForRound } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';
import { RoundResultModal } from '@/components/game/RoundResultModal';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface Round4VeDichProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  gameId: string;
  onSubmitAnswer: (questionId: string, answer: string, useStar: boolean) => Promise<void>;
  onNextQuestion: () => void;
  onRoundComplete: () => void;
}

export const Round4VeDich: React.FC<Round4VeDichProps> = ({
  questions,
  players,
  currentPlayerId,
  gameId,
  onSubmitAnswer,
  onNextQuestion,
  onRoundComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [hasUsedStar, setHasUsedStar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState('');
  const [useStar, setUseStar] = useState(false);
  const [allPlayersCompleted, setAllPlayersCompleted] = useState(false);
  const [roundEnded, setRoundEnded] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [allPlayersAnswers, setAllPlayersAnswers] = useState<Answer[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? playerAnswers.get(currentQuestion.id) : null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  // Group questions by package points
  const questionsByPackage = questions.reduce((acc, q) => {
    const packagePoints = q.goi_diem || q.points;
    if (!acc[packagePoints]) {
      acc[packagePoints] = [];
    }
    acc[packagePoints].push(q);
    return acc;
  }, {} as Record<number, Question[]>);

  const availablePackages = Object.keys(questionsByPackage)
    .map(Number)
    .sort((a, b) => a - b);

  useEffect(() => {
    // Reset when question changes
    setAnswer('');
    setUseStar(false);
  }, [currentQuestionIndex]);

  // Check if all players completed the round
  useEffect(() => {
    if (roundEnded || !selectedPackage) return;

    const loadAllAnswers = async () => {
      const { answers, error } = await getAnswersForRound(gameId, 've_dich');
      if (error || !answers) {
        console.error('Error loading answers:', error);
        return;
      }
      
      setAllPlayersAnswers(answers);
      
      const playingPlayers = players.filter((p) => !p.is_host);
      // For Round 4, each player answers one question (their selected package)
      // So we check if all players have answered
      let allCompleted = true;
      for (const player of playingPlayers) {
        const playerAnswers = answers.filter((a) => a.player_id === player.id);
        if (playerAnswers.length === 0) {
          allCompleted = false;
          break;
        }
      }
      
      setAllPlayersCompleted(allCompleted);
    };

    loadAllAnswers();

    // Subscribe to answers changes
    const questionIds = questions.map((q) => q.id);
    const channelName = `answers:${gameId}:vedich:${Date.now()}`;
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
          if (!roundEnded) {
            loadAllAnswers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, questions, players, roundEnded, selectedPackage]);

  // When all players completed, end round and show modal
  useEffect(() => {
    if (allPlayersCompleted && !roundEnded && selectedPackage) {
      console.log('✅ All players completed Round 4! Ending round...');
      setRoundEnded(true);
      
      setTimeout(() => {
        setShowResultModal(true);
      }, 500);
      
      toast({
        title: 'Hoàn thành!',
        description: 'Tất cả thí sinh đã hoàn thành phần thi. Đang tính điểm...',
        variant: 'default',
      });
    }
  }, [allPlayersCompleted, roundEnded, selectedPackage]);

  const handleSelectPackage = (packagePoints: number) => {
    setSelectedPackage(packagePoints);
    // Find first question with this package
    const packageQuestions = questionsByPackage[packagePoints];
    if (packageQuestions && packageQuestions.length > 0) {
      const questionIndex = questions.findIndex((q) => q.id === packageQuestions[0].id);
      if (questionIndex !== -1) {
        setCurrentQuestionIndex(questionIndex);
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || submitting || !answer.trim()) return;

    const willUseStar = useStar && !hasUsedStar;
    setSubmitting(true);
    try {
      await onSubmitAnswer(currentQuestion.id, answer, willUseStar);
      if (willUseStar) {
        setHasUsedStar(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Check if all players completed before calling onRoundComplete
      if (allPlayersCompleted) {
        // Modal will handle onRoundComplete when closed
        return;
      }
      onRoundComplete();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      onNextQuestion();
    }
  };

  const playingPlayers = players.filter((p) => !p.is_host);

  if (!currentQuestion) {
    return (
      <div className="text-center p-8">
        <p className="text-xl text-blue-200">Không có câu hỏi nào trong phần này</p>
      </div>
    );
  }

  const playingPlayers = players.filter((p) => !p.is_host);

  // Show package selection if not selected yet
  if (!selectedPackage) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Phần 4 - Về đích</h2>
          <p className="text-blue-200">Chọn gói câu hỏi với điểm khác nhau</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {currentPlayer?.name} - Chọn gói câu hỏi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-blue-200 mb-6">
              Chọn gói câu hỏi bạn muốn trả lời. Điểm cao hơn = rủi ro cao hơn!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availablePackages.map((packagePoints) => (
                <Button
                  key={packagePoints}
                  onClick={() => handleSelectPackage(packagePoints)}
                  className="h-24 text-lg font-bold bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{packagePoints}</span>
                    <span className="text-xs">điểm</span>
                  </div>
                </Button>
              ))}
            </div>
            <div className="mt-6 p-4 bg-yellow-500/20 rounded-lg border border-yellow-400">
              <p className="text-yellow-200 text-sm text-center">
                ⚠️ Trả lời đúng cộng điểm, sai trừ điểm tương ứng
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const packageQuestions = questionsByPackage[selectedPackage] || [];
  const currentPackageQuestion = packageQuestions.find((q) => q.id === currentQuestion.id);
  const isLastPackageQuestion =
    currentPackageQuestion &&
    packageQuestions.indexOf(currentPackageQuestion) === packageQuestions.length - 1;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Phần 4 - Về đích</h2>
        <p className="text-blue-200">Gói {selectedPackage} điểm - Câu hỏi cuối cùng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  Gói {selectedPackage} điểm - Câu {packageQuestions.indexOf(currentPackageQuestion!) + 1} /{' '}
                  {packageQuestions.length}
                </CardTitle>
                <Badge variant="outline" className="bg-red-500/20 text-red-200 border-red-300">
                  {selectedPackage} điểm
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-white/5 rounded-lg">
                <p className="text-xl font-medium text-white">{currentQuestion.question_text}</p>
              </div>

              {!currentAnswer ? (
                <div className="space-y-4">
                  {!hasUsedStar && (
                    <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-400" />
                          <span className="text-yellow-200 font-semibold">Ngôi sao hy vọng</span>
                        </div>
                        <Button
                          onClick={() => setUseStar(!useStar)}
                          variant={useStar ? 'default' : 'outline'}
                          size="sm"
                          className={useStar ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                        >
                          {useStar ? 'Đã chọn' : 'Sử dụng'}
                        </Button>
                      </div>
                      <p className="text-yellow-200 text-sm mt-2">
                        {useStar
                          ? 'Nếu đúng: x2 điểm. Nếu sai: -2 điểm'
                          : 'Nhân đôi điểm nếu trả lời đúng (chỉ dùng 1 lần)'}
                      </p>
                    </div>
                  )}

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
                    {useStar && hasUsedStar && (
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-200 border-yellow-300">
                        <Star className="h-3 w-3 mr-1" />
                        Đã dùng sao
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-blue-200 mb-1">
                    <strong>Câu trả lời của bạn:</strong> {currentAnswer.answer_text}
                  </p>
                  <p className="text-sm text-blue-200">
                    <strong>Đáp án đúng:</strong> {currentQuestion.correct_answer}
                  </p>
                  {currentAnswer.points_earned !== 0 && (
                    <p
                      className={`text-lg font-bold mt-2 ${
                        currentAnswer.points_earned > 0 ? 'text-green-300' : 'text-red-300'
                      }`}
                    >
                      {currentAnswer.points_earned > 0 ? '+' : ''}
                      {currentAnswer.points_earned} điểm
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
                    {isLastQuestion ? 'Kết thúc phần 4' : 'Câu tiếp theo'}
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

      {/* Completion Status */}
      {selectedPackage && !allPlayersCompleted && !roundEnded && (
        <Alert className="mt-4 bg-blue-500/20 border-blue-400 max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            Đang chờ tất cả thí sinh hoàn thành phần thi... ({allPlayersAnswers.length} / {playingPlayers.length} câu trả lời)
          </AlertDescription>
        </Alert>
      )}

      {selectedPackage && allPlayersCompleted && !roundEnded && (
        <Alert className="mt-4 bg-green-500/20 border-green-400 max-w-md mx-auto animate-pulse">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200 font-semibold">
            ✅ Tất cả thí sinh đã hoàn thành! Đang tính điểm...
          </AlertDescription>
        </Alert>
      )}

      {/* Round Result Modal */}
      <RoundResultModal
        isOpen={showResultModal}
        players={players}
        roundName="Phần 4 - Về đích"
        onClose={() => {
          setShowResultModal(false);
          onRoundComplete();
        }}
      />
    </div>
  );
};

