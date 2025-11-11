import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Buzzer } from '@/components/game/Buzzer';
import { WordPuzzle } from '@/components/game/WordPuzzle';
import { Scoreboard } from '@/components/game/Scoreboard';
import type { Database } from '@/integrations/supabase/types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { getVCNVState, revealHangNgang, awardPoints, getGameById, getAnswersForRound, createVCNVTimerChannel } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';
import VCNVBoard from '@/components/game/VCNVBoard';
import { RoundResultModal } from '@/components/game/RoundResultModal';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface Round2VuotChuongNgaiVatProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  gameId: string;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<Answer | null>;
  onNextQuestion: () => void;
  onRoundComplete: () => void;
}

export const Round2VuotChuongNgaiVat: React.FC<Round2VuotChuongNgaiVatProps> = ({
  questions,
  players,
  currentPlayerId,
  gameId,
  onSubmitAnswer,
  onNextQuestion,
  onRoundComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [firstBuzzerPress, setFirstBuzzerPress] = useState<string | null>(null);
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [eliminatedPlayers, setEliminatedPlayers] = useState<Set<string>>(new Set());
  const [boardCols, setBoardCols] = useState<number>(8);
  const [boardWords, setBoardWords] = useState<[string, string, string, string]>(['', '', '', '']);
  const [allPlayersCompleted, setAllPlayersCompleted] = useState(false);
  const [roundEnded, setRoundEnded] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [allPlayersAnswers, setAllPlayersAnswers] = useState<Answer[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const durationRef = useRef<number>(10);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? playerAnswers.get(currentQuestion.id) : null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isWordPuzzle = currentQuestion?.question_type === 'hang_ngang';
  const isCentral = currentQuestion?.question_type === 'chuong_ngai_vat';

  // Load and subscribe VCNV reveal state
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      // Load board config from games.vcnv_config
      try {
        const { game } = await getGameById(gameId);
        const cfg: any = (game as any)?.vcnv_config;
        if (cfg) {
          if (cfg.cols) setBoardCols(Number(cfg.cols) || 8);
          if (Array.isArray(cfg.words) && cfg.words.length === 4) {
            setBoardWords([cfg.words[0] || '', cfg.words[1] || '', cfg.words[2] || '', cfg.words[3] || '']);
          }
        }
      } catch {}

      const { state } = await getVCNVState(gameId);
      const initial = new Set<number>();
      state.forEach((s) => s.is_revealed && initial.add(s.hang_ngang_index));
      setRevealed(initial);
    })();

    channel = supabase
      .channel(`vcnv:${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vcnv_state', filter: `game_id=eq.${gameId}` }, (payload) => {
        const row: any = payload.new;
        if (row?.is_revealed) {
          setRevealed((prev) => new Set(prev).add(row.hang_ngang_index));
        }
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [gameId]);

  // New mode: listen to host timer broadcast, run local countdown
  useEffect(() => {
    const unsubscribe = createVCNVTimerChannel(gameId, (evt) => {
      if (evt.type === 'start') {
        const { durationSec, startedAt } = evt.payload || {};
        durationRef.current = Number(durationSec) || 10;
        startedAtRef.current = typeof startedAt === 'number' ? startedAt : Date.now();
        const endAt = startedAtRef.current + durationRef.current * 1000;
        setTimerActive(true);
        const tick = () => {
          const now = Date.now();
          const remainMs = Math.max(0, endAt - now);
          setRemaining(Math.ceil(remainMs / 1000));
          if (remainMs <= 0) {
            setTimerActive(false);
            if (timerRef.current) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        };
        tick();
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(tick, 200);
      } else if (evt.type === 'stop') {
        setTimerActive(false);
        setRemaining(0);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    });
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      unsubscribe();
    };
  }, [gameId]);

  const handleBuzzerPress = () => {};

  const handleSubmit = async () => {
    if (!currentQuestion || submitting || !answer.trim()) return;

    // New mode: allow any player to submit during timer window
    if (!timerActive || remaining <= 0) return;

    setSubmitting(true);
    try {
      // Compute response time in seconds since timer start
      const elapsedSec =
        startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : undefined;
      const res = await onSubmitAnswer(currentQuestion.id, answer, elapsedSec as any);
      if (res) {
        setPlayerAnswers((prev) => new Map(prev.set(currentQuestion.id, res)));
        // No correctness/scoring in this mode; host will award points manually
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if all players completed the round
  useEffect(() => {
    if (roundEnded) return;

    const loadAllAnswers = async () => {
      const { answers, error } = await getAnswersForRound(gameId, 'vuot_chuong_ngai_vat');
      if (error || !answers) {
        console.error('Error loading answers:', error);
        return;
      }
      
      setAllPlayersAnswers(answers);
      
      const playingPlayers = players.filter((p) => !p.is_host);
      const totalQuestions = questions.length;
      
      let allCompleted = true;
      for (const player of playingPlayers) {
        const playerAnswers = answers.filter((a) => a.player_id === player.id);
        if (playerAnswers.length < totalQuestions) {
          allCompleted = false;
          break;
        }
      }
      
      setAllPlayersCompleted(allCompleted);
    };

    loadAllAnswers();

    // Subscribe to answers changes
    const questionIds = questions.map((q) => q.id);
    const channelName = `answers:${gameId}:vcnv:${Date.now()}`;
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
  }, [gameId, questions, players, roundEnded]);

  // When all players completed, end round and show modal
  useEffect(() => {
    if (allPlayersCompleted && !roundEnded) {
      console.log('✅ All players completed Round 2! Ending round...');
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
  }, [allPlayersCompleted, roundEnded]);

  const handleNext = () => {
    setFirstBuzzerPress(null);
    setAnswer('');
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
        <p className="text-blue-200">
          Slide tìm chữ sẽ hiển thị trên bảng. Bạn có 10 giây để nhập đáp án. Thời gian làm bài sẽ được ghi lại.
        </p>
        <div className="mt-3 inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-400">
          <span className="text-blue-100">Thời gian còn lại:</span>
          <span className="text-2xl font-bold text-white tabular-nums">{timerActive ? `${remaining}s` : 'Chờ bắt đầu...'}</span>
        </div>
      </div>

      {/* Reveal Board */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-4">
          <VCNVBoard cols={boardCols} words={boardWords} revealed={revealed} />
          {eliminatedPlayers.has(currentPlayerId) && (
            <p className="mt-3 text-center text-red-300 text-sm font-semibold">Bạn đã bị loại khỏi phần thi này</p>
          )}
        </CardContent>
      </Card>

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

              {/* Timer-based answer input */}
              {!currentAnswer && !eliminatedPlayers.has(currentPlayerId) && (
                <div className="space-y-4">
                  <div className="space-y-2 p-4 bg-white/5 rounded-lg border border-white/10">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Nhập đáp án của bạn..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !submitting) {
                          handleSubmit();
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 text-lg"
                      disabled={submitting || !timerActive || remaining <= 0}
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !answer.trim() || !timerActive || remaining <= 0}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                    </Button>
                    <p className="text-xs text-blue-200">
                      Thời gian sẽ được ghi lại tự động khi bạn gửi.
                    </p>
                  </div>
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

      {/* Completion Status */}
      {!allPlayersCompleted && !roundEnded && (
        <Alert className="mt-4 bg-blue-500/20 border-blue-400 max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            Đang chờ tất cả thí sinh hoàn thành phần thi... ({allPlayersAnswers.length} / {questions.length * playingPlayers.length} câu trả lời)
          </AlertDescription>
        </Alert>
      )}

      {allPlayersCompleted && !roundEnded && (
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
        roundName="Phần 2 - Vượt chướng ngại vật"
        onClose={() => {
          setShowResultModal(false);
          onRoundComplete();
        }}
      />
    </div>
  );
};

export default Round2VuotChuongNgaiVat as any;

