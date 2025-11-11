import { useEffect, useState, useRef, useCallback } from 'react';
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
import { getAnswersForRound } from '@/services/gameService';
import { createRoundEventChannel } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { RoundType } from '@/services/gameService';

const FallbackIntro = ({ title, onComplete }: { title: string; onComplete: () => void }) => {
  const [countdown, setCountdown] = useState(3);
  const completedRef = useRef(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-bold">{title}</h2>
        <p className="text-xl text-blue-100">Chuẩn bị sẵn sàng...</p>
        <div className="text-6xl font-extrabold text-white tabular-nums">{countdown}</div>
      </div>
    </div>
  );
};

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
  // videoIntroCompleted tracks which rounds have shown intro in THIS session
  // It should be empty when first entering a round, so intro always shows
  const [videoIntroCompleted, setVideoIntroCompleted] = useState<Set<RoundType>>(new Set());
  const [currentIntroVideo, setCurrentIntroVideo] = useState<string | null>(null);
  const videoIntroCheckedRef = useRef<Set<RoundType>>(new Set());
  const prevRoundRef = useRef<RoundType | null>(null);
  const hasInitializedRef = useRef(false);

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

        // If host tries to access play page, redirect to host dashboard
        if (isHost) {
          navigate(`/game/host/${code}`);
          return;
        }

        if (storedPlayerId) {
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

        // Load questions for current round will be handled by useEffect below

        // Reset video intro state when loading game
        setShowVideoIntro(false);
        setCurrentIntroVideo(null);
        videoIntroCheckedRef.current.clear();
        
        // On first load, ensure videoIntroCompleted is checked fresh
        // This ensures intro always shows when entering a round for the first time
        if (!hasInitializedRef.current) {
          hasInitializedRef.current = true;
          // Don't clear videoIntroCompleted here - it tracks session state
          // But we'll check it properly below
        }

        // Check if we need to show video intro for current round
        // Always show intro if round hasn't been completed yet
        if (gameData.current_round) {
          const currentRound = gameData.current_round as RoundType;
          
          // Check if this round was already completed in this session
          // If not, we need to show intro
          const hasCompleted = videoIntroCompleted.has(currentRound);
          
          console.log('=== Checking intro for round (initial load) ===', {
            round: currentRound,
            hasCompleted,
            videoIntroCompleted: Array.from(videoIntroCompleted),
            gameStatus: gameData.status,
            hasInitialized: hasInitializedRef.current,
          });
          
          // Always show intro for new rounds (not completed yet)
          // On first load, videoIntroCompleted should be empty, so hasCompleted = false
          if (!hasCompleted) {
            let introVideos: Record<string, string> | null = null;
            
            // Parse intro_videos if it's a string (JSON)
            if (gameData.intro_videos) {
              if (typeof gameData.intro_videos === 'string') {
                try {
                  introVideos = JSON.parse(gameData.intro_videos);
                } catch (e) {
                  console.error('Error parsing intro_videos JSON:', e);
                }
              } else if (typeof gameData.intro_videos === 'object') {
                introVideos = gameData.intro_videos as Record<string, string>;
              }
            }

            const videoUrl = introVideos?.[currentRound];
            const hasVideo = Boolean(videoUrl && videoUrl.trim());

            console.log('=== Setting up intro for round ===', {
              round: currentRound,
              hasVideo,
              videoUrl,
              hasCompleted,
            });

            // Always show intro (video or fallback) for new rounds
            if (hasVideo) {
              setCurrentIntroVideo(videoUrl || null);
            } else {
              setCurrentIntroVideo(null);
            }
            // Set showVideoIntro immediately
            setShowVideoIntro(true);
            videoIntroCheckedRef.current.add(currentRound);
            
            console.log('✅ Intro state set (initial load):', {
              showVideoIntro: true,
              currentIntroVideo: hasVideo ? videoUrl : null,
              round: currentRound,
            });
          } else {
            console.log('⚠️ Round intro already completed, skipping:', currentRound);
            // If already completed, ensure we don't show intro
            setShowVideoIntro(false);
            setCurrentIntroVideo(null);
          }
        } else {
          console.log('❌ No current round:', {
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
            // Round changed - reset video intro state for new round
            console.log('=== Round Changed ===');
            console.log('Previous round:', prevRoundRef.current);
            console.log('New round:', updatedGame.current_round);
            
            // Reset video intro state for the new round
            setShowVideoIntro(false);
            setCurrentIntroVideo(null);
            // Remove the new round from completed set if it was there (fresh start for this round)
            setVideoIntroCompleted((prev) => {
              const newSet = new Set(prev);
              newSet.delete(updatedGame.current_round as RoundType);
              return newSet;
            });
            // Remove the new round from checked ref (fresh start for this round)
            videoIntroCheckedRef.current.delete(updatedGame.current_round as RoundType);
            
            // Check for video intro after state updates
            setTimeout(() => {
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
              
              console.log('=== Video Intro Check After Round Change ===');
              console.log('Intro videos:', introVideos);
              console.log('Video for new round:', introVideos?.[updatedGame.current_round]);
              
              const videoUrl = introVideos?.[updatedGame.current_round];
              const hasVideo = Boolean(videoUrl && videoUrl.trim());
              
              if (!videoIntroCheckedRef.current.has(updatedGame.current_round as RoundType)) {
                videoIntroCheckedRef.current.add(updatedGame.current_round as RoundType);
                if (hasVideo) {
                  console.log('✅ Setting video intro for new round:', videoUrl);
                  setCurrentIntroVideo(videoUrl);
                  setShowVideoIntro(true);
                } else {
                  console.log('❌ No video URL for new round, using fallback intro');
                  setCurrentIntroVideo(null);
                  setShowVideoIntro(true);
                }
              }
            }, 100);
            
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

    loadGame();

    return () => {
      if (unsubscribeGame) unsubscribeGame();
      if (unsubscribePlayers) unsubscribePlayers();
    };
  }, [code, navigate]);

  // Listen for round finished broadcast: send players back to lobby to wait for host
  useEffect(() => {
    if (!game?.id || !game?.current_round) return;
    const currentRound = game.current_round;
    const unsubscribe = createRoundEventChannel(game.id, (evt) => {
      if (evt.type === 'round_finished') {
        // Only navigate to lobby if:
        // 1. The finished round equals the round we're currently playing
        // 2. We're actually on the play page (not already navigating)
        // This prevents bouncing back to lobby due to late events from a previous round
        if (evt.round && evt.round === currentRound && window.location.pathname.includes('/play/')) {
          console.log('Round finished event received for current round, navigating to lobby:', evt.round);
          navigate(`/game/lobby/${code}`);
        } else {
          console.log('Round finished event ignored:', {
            eventRound: evt.round,
            currentRound: currentRound,
            pathname: window.location.pathname,
          });
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [game?.id, game?.current_round, code, navigate]);
  // Function to load questions for a round - memoized with useCallback
  const loadQuestionsForRound = useCallback(async (gameId: string, round: RoundType): Promise<void> => {
    const { questions: questionsData, error: questionsError } = await getQuestions(gameId, round);
    if (!questionsError && questionsData) {
      console.log(`Loaded ${questionsData.length} questions for round: ${round}`);
      setQuestions(questionsData);
    } else {
      console.error('Error loading questions:', questionsError);
      setQuestions([]);
    }
  }, []);

  // Effect to handle round changes and ensure questions are loaded
  useEffect(() => {
    if (game?.current_round && game.id) {
      console.log('Round changed effect triggered:', game.current_round);
      loadQuestionsForRound(game.id, game.current_round as RoundType);
    }
  }, [game?.current_round, game?.id, loadQuestionsForRound]);

  // Fallback for Khoi Dong reload: if player has answered all questions, go to lobby
  useEffect(() => {
    const checkAndReturnToLobby = async () => {
      if (!game?.id || !currentPlayerId) return;
      if (game.current_round !== 'khoi_dong') return;
      // If we have questions loaded and player completed all, return to lobby
      const total = questions.length;
      if (total === 0) return; // wait until questions are loaded
      const { answers, error } = await getAnswersForRound(game.id, 'khoi_dong' as RoundType);
      if (!error && answers) {
        const myAnswers = answers.filter((a) => a.player_id === currentPlayerId);
        if (myAnswers.length >= total) {
          navigate(`/game/lobby/${code}`);
        }
      }
    };
    checkAndReturnToLobby();
  }, [questions.length, game?.id, game?.current_round, currentPlayerId, code, navigate]);

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
    // Immediately return players to lobby to wait for next round (per requirement)
    if (code) {
      navigate(`/game/lobby/${code}`);
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

  // For VCNV round, questions array can be empty (no DB questions needed)
  // For other rounds, we need questions
  const needsQuestions = game?.current_round && game.current_round !== 'vuot_chuong_ngai_vat';
  
  // If we should show intro, don't block on questions loading
  const shouldShowIntroNow = showVideoIntro && game?.current_round && !videoIntroCompleted.has(game.current_round as RoundType);
  
  if (!game || !currentPlayerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải game...</p>
        </div>
      </div>
    );
  }
  
  // If we need questions but don't have them yet, and we're not showing intro, show loading
  if (needsQuestions && questions.length === 0 && !shouldShowIntroNow) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
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

  // Show intro if:
  // 1. showVideoIntro is true AND
  // 2. We have a current round AND
  // 3. The round hasn't been completed yet
  const currentRound = game?.current_round as RoundType | null;
  const hasCompleted = currentRound ? videoIntroCompleted.has(currentRound) : false;
  const shouldShowIntro = showVideoIntro && currentRound && !hasCompleted;
  
  console.log('=== Render check ===', {
    showVideoIntro,
    currentRound,
    hasCompleted,
    shouldShowIntro,
    currentIntroVideo,
    videoIntroCompleted: Array.from(videoIntroCompleted),
  });
  
  if (shouldShowIntro && currentRound) {
    const handleIntroComplete = () => {
      console.log('Intro completed for round:', game.current_round);
      const currentRound = game.current_round as RoundType;
      setShowVideoIntro(false);
      setVideoIntroCompleted((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentRound);
        console.log('Marked round as completed:', currentRound, Array.from(newSet));
        return newSet;
      });
      setCurrentIntroVideo(null);
    };

    if (currentIntroVideo) {
      console.log('Rendering VideoIntro for round:', game.current_round, 'Video URL:', currentIntroVideo);
      return (
        <VideoIntro
          videoUrl={currentIntroVideo}
          onComplete={handleIntroComplete}
          title={getRoundTitle(game.current_round)}
        />
      );
    }

    console.log('Rendering FallbackIntro for round:', game.current_round);
    return <FallbackIntro title={getRoundTitle(game.current_round)} onComplete={handleIntroComplete} />;
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
              gameId={game.id}
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
              gameId={game.id}
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

