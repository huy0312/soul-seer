import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scoreboard } from '@/components/game/Scoreboard';
import type { Database } from '@/integrations/supabase/types';
import { CheckCircle2 } from 'lucide-react';
import { getAnswersForRound, createVCNVTimerChannel, emitVCNVSignal, createQuestions } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { playCountdownSound } from '@/utils/audio';

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
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState('');
  const [allPlayersAnswers, setAllPlayersAnswers] = useState<Answer[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const durationRef = useRef<number>(15);
  const timerStartSignatureRef = useRef<number | null>(null);
  const [signalSent, setSignalSent] = useState(false);

  // VCNV mode: no DB questions needed, just timer + input
  // We'll use a placeholder question ID for answer submission
  const [placeholderQuestionId, setPlaceholderQuestionId] = useState<string | null>(null);
  const currentAnswer = placeholderQuestionId ? playerAnswers.get(placeholderQuestionId) : null;

  // Create placeholder question for VCNV round (if not exists)
  useEffect(() => {
    const createPlaceholderQuestion = async () => {
      // Check if placeholder question already exists
      const { data: existingQuestions } = await supabase
        .from('questions')
        .select('id')
        .eq('game_id', gameId)
        .eq('round', 'vuot_chuong_ngai_vat')
        .limit(1);

      if (existingQuestions && existingQuestions.length > 0) {
        setPlaceholderQuestionId(existingQuestions[0].id);
        return;
      }

      // Create placeholder question
      const { error } = await createQuestions(gameId, [
        {
          round: 'vuot_chuong_ngai_vat',
          question_text: 'Câu hỏi Vượt chướng ngại vật (slide sẽ hiển thị trên bảng)',
          correct_answer: '', // No correct answer needed, host will score manually
          points: 0, // Host will award points manually
          order_index: 0,
        },
      ]);

      if (!error) {
        // Get the created question
        const { data: newQuestions } = await supabase
          .from('questions')
          .select('id')
          .eq('game_id', gameId)
          .eq('round', 'vuot_chuong_ngai_vat')
          .limit(1);

        if (newQuestions && newQuestions.length > 0) {
          setPlaceholderQuestionId(newQuestions[0].id);
        }
      }
    };

    createPlaceholderQuestion();
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
        if (timerStartSignatureRef.current !== startedAtRef.current) {
          timerStartSignatureRef.current = startedAtRef.current;
          setPlayerAnswers(new Map());
          setAnswer('');
          setSignalSent(false);
          playCountdownSound(durationRef.current).catch(() => {});
        }
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
        timerStartSignatureRef.current = null;
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

  const handleSubmit = async () => {
    if (!placeholderQuestionId || submitting || !answer.trim()) return;

    // New mode: allow any player to submit during timer window
    if (!timerActive || remaining <= 0) return;

    setSubmitting(true);
    try {
      // Compute response time in seconds since timer start
      const elapsedSec =
        startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : undefined;
      const res = await onSubmitAnswer(placeholderQuestionId, answer, elapsedSec as any);
      if (res) {
        setPlayerAnswers((prev) => new Map(prev.set(placeholderQuestionId, res)));
        // No correctness/scoring in this mode; host will award points manually
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // VCNV: Just track answers for display, don't auto-end round
  // Host will manually control when to move to next question/round
  useEffect(() => {
    if (!placeholderQuestionId) return;

    const loadAllAnswers = async () => {
      const { answers, error } = await getAnswersForRound(gameId, 'vuot_chuong_ngai_vat');
      if (error || !answers) {
        console.error('Error loading answers:', error);
        return;
      }
      
      setAllPlayersAnswers(answers);
    };

    loadAllAnswers();

    // Subscribe to answers changes
    const channelName = `answers:${gameId}:vcnv:${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${placeholderQuestionId}`,
        },
        () => {
          loadAllAnswers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, placeholderQuestionId]);

  if (!placeholderQuestionId) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-xl text-blue-200">Đang tải...</p>
      </div>
    );
  }

  const playingPlayers = players.filter((p) => !p.is_host);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Phần 2 - Vượt chướng ngại vật</h2>
        <p className="text-blue-200">
          Slide tìm chữ sẽ hiển thị trên bảng. Bạn có 15 giây để nhập đáp án. Thời gian làm bài sẽ được ghi lại.
        </p>
        <div className="mt-5 inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-blue-500/30 border border-blue-400 shadow-lg">
          <span className="text-blue-100 text-lg">Thời gian còn lại:</span>
          <span className="text-4xl font-extrabold text-white tabular-nums tracking-wide">
            {timerActive ? `${remaining}s` : 'Chờ bắt đầu...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Answer Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl">Nhập đáp án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer-based answer input */}
              {!currentAnswer && (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || !answer.trim() || !timerActive || remaining <= 0}
                        className="w-full"
                        size="lg"
                      >
                        {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (signalSent || !timerActive) return;
                          try {
                            const me = players.find((p) => p.id === currentPlayerId);
                            await emitVCNVSignal(gameId, currentPlayerId, me?.name || undefined);
                            setSignalSent(true);
                            toast({
                              title: 'Đã báo tín hiệu',
                              description: 'Người tổ chức đã nhận được tín hiệu bạn tìm ra chướng ngại vật!',
                            });
                          } catch (error) {
                            console.error('Error emitting VCNV signal:', error);
                            toast({
                              title: 'Lỗi',
                              description: 'Không thể gửi tín hiệu, thử lại nhé.',
                              variant: 'destructive',
                            });
                          }
                        }}
                        disabled={signalSent || !timerActive}
                        className="w-full border-yellow-400/70 text-yellow-200 hover:bg-yellow-500/20"
                        size="lg"
                      >
                        {signalSent ? 'Đã báo tín hiệu' : 'Báo tín hiệu chướng ngại vật'}
                      </Button>
                    </div>
                    <p className="text-xs text-blue-200">
                      Thời gian sẽ được ghi lại tự động khi bạn gửi. Dùng nút báo tín hiệu khi bạn nghĩ đã tìm ra chướng ngại vật.
                    </p>
                  </div>
                </div>
              )}

              {currentAnswer && (
                <div className="p-4 rounded-lg border-2 bg-blue-500/20 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-400" />
                    <span className="font-semibold text-blue-300">
                      Đã gửi câu trả lời!
                    </span>
                  </div>
                  <p className="text-sm text-blue-200 mb-1">
                    <strong>Câu trả lời:</strong> {currentAnswer.answer_text}
                  </p>
                  {currentAnswer.response_time !== null && (
                    <p className="text-sm text-blue-200">
                      <strong>Thời gian trả lời:</strong> {currentAnswer.response_time}s
                    </p>
                  )}
                  <p className="text-xs text-blue-200 mt-2">
                    Người tổ chức sẽ chấm điểm và công bố kết quả.
                  </p>
                </div>
              )}
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

export default Round2VuotChuongNgaiVat as any;

