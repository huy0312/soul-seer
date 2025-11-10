import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Round1KhoiDong } from '@/components/game/rounds/Round1KhoiDong';
import { VideoIntro } from '@/components/game/VideoIntro';
import { Round2VuotChuongNgaiVat } from '@/components/game/rounds/Round2VuotChuongNgaiVat';
import { Round3TangToc } from '@/components/game/rounds/Round3TangToc';
import { Round4VeDich } from '@/components/game/rounds/Round4VeDich';
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

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

const GamePlay = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [showVideoIntro, setShowVideoIntro] = useState(false);
  const [videoIntroCompleted, setVideoIntroCompleted] = useState<Set<RoundType>>(new Set());
  const [currentIntroVideo, setCurrentIntroVideo] = useState<string | null>(null);
  const videoIntroCheckedRef = useRef<Set<RoundType>>(new Set());
  const prevRoundRef = useRef<RoundType | null>(null);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    let unsubscribeGame: (() => void) | null = null;
    let unsubscribePlayers: (() => void) | null = null;

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
        prevRoundRef.current = gameData.current_round as RoundType | null;

        // Get current player from localStorage
        const storedPlayerId = localStorage.getItem(`player_${code}`);
        const isHost = localStorage.getItem(`is_host_${code}`) === 'true';

        if (storedPlayerId) {
          if (isHost) {
            navigate(`/game/host/${code}`);
            return;
          }
          setCurrentPlayerId(storedPlayerId);
        } else {
          navigate(`/game/lobby/${code}`);
          return;
        }

        const refreshPlayers = async () => {
          const { players: playersData, error: playersError } = await getPlayers(gameData.id);
          if (!playersError && playersData) {
            setPlayers(playersData);
          }
        };

        await refreshPlayers();

        // Load questions for current round
        if (gameData.current_round) {
          await loadQuestionsForRound(gameData.id, gameData.current_round);
        }

        // Reset video intro state when loading game
        setShowVideoIntro(false);
        setCurrentIntroVideo(null);
        videoIntroCheckedRef.current.clear();

        // Check if we need to show video intro for current round
        if (gameData.current_round && gameData.intro_videos) {
          let introVideos: Record<string, string> | null = null;
          
          // Parse intro_videos if it's a string (JSON)
          if (typeof gameData.intro_videos === 'string') {
            try {
              introVideos = JSON.parse(gameData.intro_videos);
            } catch (e) {
              console.error('Error parsing intro_videos JSON:', e);
            }
          } else if (typeof gameData.intro_videos === 'object' && gameData.intro_videos !== null) {
            introVideos = gameData.intro_videos as Record<string, string>;
          }
          
          console.log('=== Video Intro Debug (Load Game) ===');
          console.log('Intro videos raw:', gameData.intro_videos);
          console.log('Intro videos parsed:', introVideos);
          console.log('Current round:', gameData.current_round);
          console.log('Video for current round:', introVideos?.[gameData.current_round]);
          
          const videoUrl = introVideos?.[gameData.current_round];
          const hasVideo = videoUrl && videoUrl.trim();
          
          console.log('Has video URL:', hasVideo);
          console.log('Video URL:', videoUrl);
          
          if (hasVideo) {
            console.log('✅ Setting video intro:', videoUrl);
            videoIntroCheckedRef.current.add(gameData.current_round);
            setCurrentIntroVideo(videoUrl);
            setShowVideoIntro(true);
          } else {
            console.log('❌ No video URL for current round');
          }
        } else {
          console.log('❌ No intro videos or current round:', {
            hasCurrentRound: !!gameData.current_round,
            hasIntroVideos: !!gameData.intro_videos,
          });
        }

        // Subscribe to game changes
        unsubscribeGame = subscribeToGame(gameData.id, (updatedGame) => {
          setGame(updatedGame);
          if (updatedGame.status === 'finished') {
            navigate(`/game/results/${code}`);
          } else if (updatedGame.current_round && updatedGame.current_round !== prevRoundRef.current) {
            // Round changed - check if we need to show video intro for new round
            let introVideos: Record<string, string> | null = null;
            
            // Parse intro_videos if it's a string (JSON)
            if (typeof updatedGame.intro_videos === 'string') {
              try {
                introVideos = JSON.parse(updatedGame.intro_videos);
              } catch (e) {
                console.error('Error parsing intro_videos JSON:', e);
              }
            } else if (typeof updatedGame.intro_videos === 'object' && updatedGame.intro_videos !== null) {
              introVideos = updatedGame.intro_videos as Record<string, string>;
            }
            
            console.log('=== Round Changed - Video Intro Debug ===');
            console.log('New round:', updatedGame.current_round);
            console.log('Intro videos:', introVideos);
            console.log('Video for new round:', introVideos?.[updatedGame.current_round]);
            console.log('Video intro completed:', Array.from(videoIntroCompleted));
            
            const videoUrl = introVideos?.[updatedGame.current_round];
            const hasVideo = videoUrl && videoUrl.trim();
            const notCompleted = !videoIntroCompleted.has(updatedGame.current_round);
            const notChecked = !videoIntroCheckedRef.current.has(updatedGame.current_round);
            
            if (hasVideo && notCompleted && notChecked) {
              console.log('✅ Setting video intro for new round:', videoUrl);
              videoIntroCheckedRef.current.add(updatedGame.current_round);
              setCurrentIntroVideo(videoUrl);
              setShowVideoIntro(true);
            } else {
              console.log('❌ Not showing video intro for new round:', {
                hasVideo,
                notCompleted,
                notChecked,
              });
            }
            loadQuestionsForRound(updatedGame.id, updatedGame.current_round);
            prevRoundRef.current = updatedGame.current_round as RoundType;
          }
        });

        // Subscribe to players changes
        unsubscribePlayers = subscribeToPlayers(gameData.id, (updatedPlayers) => {
          setPlayers(updatedPlayers);
        });

        setLoading(false);
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể tải game',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    const loadQuestionsForRound = async (gameId: string, round: RoundType) => {
      const { questions: questionsData, error: questionsError } = await getQuestions(gameId, round);
      if (!questionsError && questionsData) {
        setQuestions(questionsData);
      }
    };

    loadGame();

    return () => {
      if (unsubscribeGame) unsubscribeGame();
      if (unsubscribePlayers) unsubscribePlayers();
    };
  }, [code, navigate]);

  const handleSubmitAnswer = async (questionId: string, answer: string, responseTime?: number, useStar?: boolean): Promise<Answer | null> => {
    if (!currentPlayerId) return null;

    try {
      const { answer: answerData, error } = await submitAnswer(currentPlayerId, questionId, answer, responseTime, useStar);
      if (error) throw error;

      if (answerData) {
        // Handle special scoring for different rounds
        if (game?.current_round === 'tang_toc' && responseTime) {
          // Adjust points based on response time for Tăng tốc
          // This would be handled in the backend, but we can show feedback here
        }

        if (game?.current_round === 've_dich' && useStar) {
          // Handle star bonus/penalty
          // This would be handled in the backend
        }

        // Don't show toast here - let the component handle it to avoid duplicates
        // Toast will be shown in the component after state is updated

        return answerData;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể gửi câu trả lời',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleNextQuestion = () => {
    // This can be used to trigger any side effects when moving to next question
  };

  const handleRoundComplete = async () => {
    if (!game || !game.current_round) return;

    const roundOrder: RoundType[] = ['khoi_dong', 'vuot_chuong_ngai_vat', 'tang_toc', 've_dich'];
    const currentIndex = roundOrder.indexOf(game.current_round);

    if (currentIndex < roundOrder.length - 1) {
      // Move to next round
      try {
        const { error } = await nextRound(game.id, game.current_round);
        if (error) throw error;

        toast({
          title: 'Chuyển phần thi',
          description: `Chuyển sang ${roundOrder[currentIndex + 1] === 'vuot_chuong_ngai_vat' ? 'Vượt chướng ngại vật' : roundOrder[currentIndex + 1] === 'tang_toc' ? 'Tăng tốc' : 'Về đích'}`,
        });
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể chuyển sang vòng tiếp theo',
          variant: 'destructive',
        });
      }
    } else {
      // Finish game
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

  if (!game || !currentPlayerId || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p>Đang tải game...</p>
        </div>
      </div>
    );
  }

  const playingPlayers = players.filter((p) => !p.is_host);

  // Show video intro if needed - full screen, no buttons
  const getRoundTitle = (round: RoundType | null): string => {
    switch (round) {
      case 'khoi_dong':
        return 'Phần 1 - Khởi động';
      case 'vuot_chuong_ngai_vat':
        return 'Phần 2 - Vượt chướng ngại vật';
      case 'tang_toc':
        return 'Phần 3 - Tăng tốc';
      case 've_dich':
        return 'Phần 4 - Về đích';
      default:
        return 'Video Intro';
    }
  };

  if (showVideoIntro && currentIntroVideo && game?.current_round) {
    return (
      <VideoIntro
        videoUrl={currentIntroVideo}
        onComplete={() => {
          console.log('Video intro completed for round:', game.current_round);
          setShowVideoIntro(false);
          if (game.current_round) {
            setVideoIntroCompleted((prev) => {
              const newSet = new Set(prev);
              newSet.add(game.current_round!);
              console.log('Updated completed rounds:', Array.from(newSet));
              return newSet;
            });
          }
          setCurrentIntroVideo(null);
        }}
        title={getRoundTitle(game.current_round)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {game.current_round === 'khoi_dong' && (
            <Round1KhoiDong
              questions={questions}
              players={playingPlayers}
              currentPlayerId={currentPlayerId}
              gameId={game.id}
              onSubmitAnswer={(questionId, answer) => handleSubmitAnswer(questionId, answer)}
              onRoundComplete={handleRoundComplete}
              timeLimit={60} // 60 seconds for round 1
            />
          )}

          {game.current_round === 'vuot_chuong_ngai_vat' && (
            <Round2VuotChuongNgaiVat
              questions={questions}
              players={playingPlayers}
              currentPlayerId={currentPlayerId}
              gameId={game.id}
              onSubmitAnswer={(questionId, answer) => handleSubmitAnswer(questionId, answer)}
              onNextQuestion={handleNextQuestion}
              onRoundComplete={handleRoundComplete}
            />
          )}

          {game.current_round === 'tang_toc' && (
            <Round3TangToc
              questions={questions}
              players={playingPlayers}
              currentPlayerId={currentPlayerId}
              onSubmitAnswer={(questionId, answer, responseTime) =>
                handleSubmitAnswer(questionId, answer, responseTime)
              }
              onNextQuestion={handleNextQuestion}
              onRoundComplete={handleRoundComplete}
              timeLimit={30}
            />
          )}

          {game.current_round === 've_dich' && (
            <Round4VeDich
              questions={questions}
              players={playingPlayers}
              currentPlayerId={currentPlayerId}
              onSubmitAnswer={(questionId, answer, useStar) =>
                handleSubmitAnswer(questionId, answer, undefined, useStar)
              }
              onNextQuestion={handleNextQuestion}
              onRoundComplete={handleRoundComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlay;

