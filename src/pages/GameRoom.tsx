import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RoundDisplay } from '@/components/game/RoundDisplay';
import { QuestionDisplay } from '@/components/game/QuestionDisplay';
import { Scoreboard } from '@/components/game/Scoreboard';
import { PlayerList } from '@/components/game/PlayerList';
import {
  getGameByCode,
  getPlayers,
  getQuestions,
  getAnswer,
  submitAnswer,
  nextRound,
  finishGame,
  subscribeToGame,
  subscribeToPlayers,
} from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { RoundType } from '@/services/gameService';
import { ArrowRight, Trophy } from 'lucide-react';

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

const GameRoom = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<Map<string, Answer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    const loadGame = async () => {
      try {
        const { game: gameData, error: gameError } = await getGameByCode(code);
        if (gameError || !gameData) {
          throw gameError || new Error('Game not found');
        }

        if (gameData.status === 'waiting') {
          navigate(`/game/lobby/${code}`);
          return;
        }

        if (gameData.status === 'finished') {
          navigate(`/game/results/${code}`);
          return;
        }

        setGame(gameData);

        const { players: playersData, error: playersError } = await getPlayers(gameData.id);
        if (playersError) throw playersError;
        setPlayers(playersData || []);

        // Get current player from localStorage
        const storedPlayerId = localStorage.getItem(`player_${code}`);
        if (storedPlayerId) {
          setCurrentPlayerId(storedPlayerId);
        } else {
          // If no player ID, redirect to lobby
          navigate(`/game/lobby/${code}`);
          return;
        }

        // Load questions for current round
        if (gameData.current_round) {
          const { questions: questionsData, error: questionsError } = await getQuestions(
            gameData.id,
            gameData.current_round
          );
          if (questionsError) throw questionsError;
          setQuestions(questionsData || []);

          // Load player answers for current question
          if (questionsData && questionsData.length > 0) {
            const currentQuestion = questionsData[0];
            const { answer } = await getAnswer(storedPlayerId, currentQuestion.id);
            if (answer) {
              setPlayerAnswers((prev) => new Map(prev.set(currentQuestion.id, answer)));
            }
          }
        }

        // Subscribe to game changes
        const unsubscribeGame = subscribeToGame(gameData.id, (updatedGame) => {
          setGame(updatedGame);
          if (updatedGame.status === 'finished') {
            navigate(`/game/results/${code}`);
          }
        });

        // Subscribe to players changes
        const unsubscribePlayers = subscribeToPlayers(gameData.id, (updatedPlayers) => {
          setPlayers(updatedPlayers);
        });

        setLoading(false);

        return () => {
          unsubscribeGame();
          unsubscribePlayers();
        };
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể tải game',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    loadGame();
  }, [code, navigate]);

  const handleSubmitAnswer = async (answer: string) => {
    if (!game || !currentPlayerId || questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      const { answer: answerData, error } = await submitAnswer(
        currentPlayerId,
        currentQuestion.id,
        answer
      );

      if (error) throw error;

      if (answerData) {
        setPlayerAnswers((prev) => new Map(prev.set(currentQuestion.id, answerData)));
        toast({
          title: answerData.is_correct ? 'Đúng!' : 'Sai!',
          description: answerData.is_correct
            ? `Bạn đã nhận được ${answerData.points_earned} điểm`
            : 'Hãy cố gắng ở câu tiếp theo',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể gửi câu trả lời',
        variant: 'destructive',
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleNextRound = async () => {
    if (!game || !game.current_round) return;

    try {
      const { error } = await nextRound(game.id, game.current_round);
      if (error) throw error;

      // Reload questions for new round
      const roundOrder: RoundType[] = ['khoi_dong', 'vuot_chuong_ngai_vat', 'tang_toc', 've_dich'];
      const currentIndex = roundOrder.indexOf(game.current_round!);
      const nextRoundType = currentIndex < roundOrder.length - 1 ? roundOrder[currentIndex + 1] : 've_dich';

      const { questions: questionsData, error: questionsError } = await getQuestions(
        game.id,
        nextRoundType
      );
      if (questionsError) throw questionsError;

      setQuestions(questionsData || []);
      setCurrentQuestionIndex(0);
      setPlayerAnswers(new Map());
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể chuyển sang vòng tiếp theo',
        variant: 'destructive',
      });
    }
  };

  const handleFinishGame = async () => {
    if (!game) return;

    try {
      const { error } = await finishGame(game.id);
      if (error) throw error;

      navigate(`/game/results/${code}`);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể kết thúc game',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!game || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p>Không có câu hỏi nào trong vòng này</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const playerAnswer = currentQuestion ? playerAnswers.get(currentQuestion.id) : null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isLastRound = game.current_round === 've_dich';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Đường lên đỉnh Olympia</h1>
            <p className="text-xl text-blue-100">Mã game: {code}</p>
          </div>

          {/* Round Display */}
          <div className="mb-8">
            <RoundDisplay currentRound={game.current_round} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Question */}
            <div className="lg:col-span-2 space-y-6">
              <QuestionDisplay
                question={currentQuestion}
                playerAnswer={playerAnswer || undefined}
                onSubmitAnswer={handleSubmitAnswer}
                isAnswered={!!playerAnswer}
              />

              {/* Navigation */}
              <div className="flex justify-between gap-4">
                <Button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  Câu trước
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-100">
                    Câu {currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>
                {isLastQuestion ? (
                  isLastRound ? (
                    <Button onClick={handleFinishGame} className="bg-green-600 hover:bg-green-700">
                      <Trophy className="h-4 w-4 mr-2" />
                      Kết thúc game
                    </Button>
                  ) : (
                    <Button onClick={handleNextRound} className="bg-blue-600 hover:bg-blue-700">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Vòng tiếp theo
                    </Button>
                  )
                ) : (
                  <Button onClick={handleNextQuestion} disabled={!playerAnswer}>
                    Câu tiếp theo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column - Scoreboard & Players */}
            <div className="space-y-6">
              <Scoreboard players={players} />
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6">
                  <PlayerList players={players} maxPlayers={4} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;

