import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';
import { Zap, Clock } from 'lucide-react';
import { submitAnswer, createTangTocChannel, getQuestions } from '@/services/gameService';
import { playCountdownSound } from '@/utils/audio';
import { supabase } from '@/integrations/supabase/client';

type Question = Database['public']['Tables']['questions']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

interface Round3TangTocProps {
  questions: Question[];
  players: Player[];
  currentPlayerId: string;
  gameId: string;
  onRoundComplete: () => void;
}

export const Round3TangToc: React.FC<Round3TangTocProps> = ({
  questions,
  players,
  currentPlayerId,
  gameId,
  onRoundComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [answer, setAnswer] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [remaining, setRemaining] = useState(20);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const durationRef = useRef<number>(20);
  const timerStartSignatureRef = useRef<number | null>(null);

  // Listen to host events
  useEffect(() => {
    const unsubscribe = createTangTocChannel(gameId, (evt) => {
      if (evt.type === 'show_question') {
        const { questionIndex, questionId } = evt.payload || {};
        console.log('Received show_question event:', { questionIndex, questionId, questionsCount: questions.length });
        
        // Try to find question in current questions array
        let question = questions.find((q) => q.id === questionId);
        
        // If not found, fetch from database
        if (!question) {
          console.log('Question not in array, fetching from database...');
          getQuestions(gameId, 'tang_toc').then(({ questions: fetchedQuestions, error }) => {
            if (!error && fetchedQuestions) {
              const found = fetchedQuestions.find((q) => q.id === questionId);
              if (found) {
                setCurrentQuestion(found);
                setCurrentQuestionIndex(questionIndex);
                setAnswer('');
                setSubmitted(false);
                setTimerActive(false);
                setRemaining(20);
                if (timerRef.current) {
                  window.clearInterval(timerRef.current);
                  timerRef.current = null;
                }
              } else {
                console.error('Question not found in database:', questionId);
              }
            }
          });
        } else {
          setCurrentQuestion(question);
          setCurrentQuestionIndex(questionIndex);
          setAnswer('');
          setSubmitted(false);
          setTimerActive(false);
          setRemaining(20);
          // Reset timer
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      } else if (evt.type === 'start_timer') {
        const { durationSec, startedAt } = evt.payload || {};
        durationRef.current = Number(durationSec) || 20;
        startedAtRef.current = typeof startedAt === 'number' ? startedAt : Date.now();
        const endAt = startedAtRef.current + durationRef.current * 1000;
        setTimerActive(true);
        setSubmitted(false);
        if (timerStartSignatureRef.current !== startedAtRef.current) {
          timerStartSignatureRef.current = startedAtRef.current;
          playCountdownSound(durationRef.current).catch(() => {});
        }
        const tick = () => {
          const now = Date.now();
          const remainMs = Math.max(0, endAt - now);
          setRemaining(Math.ceil(remainMs / 1000));
          if (remainMs <= 0) {
            setTimerActive(false);
            // Auto-submit when time is up
            if (!submitted && currentQuestion) {
              handleAutoSubmit();
            }
            if (timerRef.current) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        };
        tick();
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(tick, 200);
      } else if (evt.type === 'stop_timer') {
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
  }, [gameId, questions, submitted, currentQuestion]);

  const handleAutoSubmit = async () => {
    if (!currentQuestion || submitted || submitting) return;
    setSubmitting(true);
    setSubmitted(true);
    try {
      const responseTime = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : durationRef.current;
      await submitAnswer(currentPlayerId, currentQuestion.id, answer.trim() || '', responseTime);
    } catch (error) {
      console.error('Error auto-submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || submitting || submitted || !timerActive) return;
    setSubmitting(true);
    setSubmitted(true);
    try {
      const responseTime = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : durationRef.current;
      await submitAnswer(currentPlayerId, currentQuestion.id, answer.trim(), responseTime);
      setTimerActive(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-white mb-2">Phần 3 - Tăng tốc</h2>
          <p className="text-blue-200 text-lg">Đang chờ host bắt đầu câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Phần 3 - Tăng tốc</h2>
          </div>
          <p className="text-blue-200">Câu hỏi {currentQuestionIndex + 1} / {questions.length}</p>
        </div>

        {/* Timer */}
        {timerActive && (
          <Card className="bg-red-500/20 border-red-400">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-3">
                <Clock className="h-6 w-6 text-red-300" />
                <span className="text-3xl font-bold text-red-300">{remaining}s</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Câu hỏi {currentQuestionIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image */}
            {currentQuestion.hint && (
              <div className="w-full">
                <img
                  src={currentQuestion.hint}
                  alt={`Câu hỏi ${currentQuestionIndex + 1}`}
                  className="w-full h-auto max-h-96 object-contain rounded-lg border border-white/20"
                />
              </div>
            )}

            {/* Question Text */}
            <div className="p-6 bg-white/5 rounded-lg">
              <p className="text-xl font-medium text-white">{currentQuestion.question_text}</p>
            </div>

            {/* Answer Input */}
            {!submitted && timerActive ? (
              <div className="space-y-4">
                <Input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Nhập câu trả lời..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !submitting && answer.trim()) {
                      handleSubmit();
                    }
                  }}
                  className="text-lg bg-white text-gray-800"
                  disabled={submitting}
                  autoFocus
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
            ) : submitted ? (
              <div className="p-4 bg-green-500/20 rounded-lg border border-green-400 text-center">
                <p className="text-green-300 font-semibold">Đã gửi câu trả lời!</p>
                <p className="text-green-200 text-sm mt-1">Đang chờ host xem kết quả...</p>
              </div>
            ) : (
              <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400 text-center">
                <p className="text-blue-300 font-semibold">Đang chờ host bắt đầu timer...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
