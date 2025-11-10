import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Buzzer } from '@/components/game/Buzzer';
import { WordPuzzle } from '@/components/game/WordPuzzle';
import { Scoreboard } from '@/components/game/Scoreboard';
import type { Database } from '@/integrations/supabase/types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { getVCNVState, revealHangNgang, awardPoints, getGameById } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';
import VCNVBoard from '@/components/game/VCNVBoard';

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

    // If player eliminated (wrong central guess earlier), block
    if (eliminatedPlayers.has(currentPlayerId)) return;

    setSubmitting(true);
    try {
      const res = await onSubmitAnswer(currentQuestion.id, answer);
      if (res) {
        setPlayerAnswers((prev) => new Map(prev.set(currentQuestion.id, res)));
        const correct = res.is_correct;
        if (correct) {
          if (isWordPuzzle) {
            // +10 and reveal corresponding hang ngang index (0-3 expected)
            const idx = Math.min(currentQuestionIndex, 3);
            await revealHangNgang(gameId, idx);
            // If backend didn't award, ensure +10
            if (!res.points_earned || res.points_earned === 0) {
              await awardPoints(currentPlayerId, 10);
            }
          } else if (isCentral) {
            // Calculate bonus based on number of revealed rows
            const opened = Math.min(revealed.size, 3);
            const bonusMap = [80, 60, 40, 20];
            const bonus = bonusMap[opened];
            if (!res.points_earned || res.points_earned === 0) {
              await awardPoints(currentPlayerId, bonus);
            }
            // End round immediately when central is solved
            onRoundComplete();
          }
        } else if (isCentral) {
          // Eliminate on wrong central guess
          setEliminatedPlayers((prev) => new Set(prev).add(currentPlayerId));
        }
      }
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
        <p className="text-blue-200">Bấm chuông nhanh để giành quyền trả lời. Hàng ngang đúng sẽ mở gợi ý (+10 điểm). Đoán đúng chướng ngại vật: +80/60/40/20.</p>
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

              {/* Buzzer Section */}
              {!currentAnswer && !isWordPuzzle && !eliminatedPlayers.has(currentPlayerId) && (
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

export default Round2VuotChuongNgaiVat as any;

