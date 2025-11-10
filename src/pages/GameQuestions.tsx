import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGameByCode, createQuestions } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import type { RoundType } from '@/services/gameService';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';

interface Question {
  question_text: string;
  correct_answer: string;
  points: number;
  order_index: number;
  question_type?: 'normal' | 'hang_ngang' | 'chuong_ngai_vat' | 'goi_cau_hoi';
  hang_ngang_index?: number | null;
  goi_diem?: number | null;
  hint?: string | null;
  options?: string[] | null; // For multiple choice questions (4 options)
}

const roundLabels: Record<RoundType, string> = {
  khoi_dong: 'Khởi động',
  vuot_chuong_ngai_vat: 'Vượt chướng ngại vật',
  tang_toc: 'Tăng tốc',
  ve_dich: 'Về đích',
};

const GameQuestions = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState<Record<RoundType, Question[]>>({
    khoi_dong: [],
    vuot_chuong_ngai_vat: [],
    tang_toc: [],
    ve_dich: [],
  });

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    const loadGame = async () => {
      try {
        const { game, error } = await getGameByCode(code);
        if (error || !game) {
          throw error || new Error('Game not found');
        }
        setGameId(game.id);
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
  }, [code, navigate]);

  const addQuestion = (round: RoundType) => {
    const roundQuestions = questions[round];
    const newQuestion: Question = {
      question_text: '',
      correct_answer: '',
      points: 10,
      order_index: roundQuestions.length + 1,
      options: round === 'khoi_dong' ? ['', '', '', ''] : null, // Add 4 empty options for round 1
    };
    setQuestions({
      ...questions,
      [round]: [...roundQuestions, newQuestion],
    });
  };

  const removeQuestion = (round: RoundType, index: number) => {
    const roundQuestions = questions[round].filter((_, i) => i !== index);
    // Reorder questions
    const reordered = roundQuestions.map((q, i) => ({
      ...q,
      order_index: i + 1,
    }));
    setQuestions({
      ...questions,
      [round]: reordered,
    });
  };

  const updateQuestion = (round: RoundType, index: number, field: keyof Question, value: string | number | string[]) => {
    const roundQuestions = [...questions[round]];
    roundQuestions[index] = {
      ...roundQuestions[index],
      [field]: value,
    };
    setQuestions({
      ...questions,
      [round]: roundQuestions,
    });
  };

  const updateQuestionOption = (round: RoundType, index: number, optionIndex: number, value: string) => {
    const roundQuestions = [...questions[round]];
    const question = roundQuestions[index];
    const options = question.options ? [...question.options] : ['', '', '', ''];
    options[optionIndex] = value;
    roundQuestions[index] = {
      ...question,
      options,
    };
    setQuestions({
      ...questions,
      [round]: roundQuestions,
    });
  };

  const handleSave = async () => {
    if (!gameId) return;

    // Validate questions
    for (const round of Object.keys(questions) as RoundType[]) {
      const roundQuestions = questions[round];
      for (let i = 0; i < roundQuestions.length; i++) {
        const q = roundQuestions[i];
        
        // Basic validation: question text and correct answer
        if (!q.question_text || !q.question_text.trim()) {
          toast({
            title: 'Lỗi',
            description: `Vui lòng điền câu hỏi cho ${roundLabels[round]} - Câu ${i + 1}`,
            variant: 'destructive',
          });
          return;
        }
        
        if (!q.correct_answer || !q.correct_answer.trim()) {
          toast({
            title: 'Lỗi',
            description: `Vui lòng điền đáp án đúng cho ${roundLabels[round]} - Câu ${i + 1}`,
            variant: 'destructive',
          });
          return;
        }
        
        // Validate options for round 1 (Khởi động) - REQUIRED
        if (round === 'khoi_dong') {
          // Options are required for round 1
          if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
            toast({
              title: 'Lỗi',
              description: `Vui lòng điền đầy đủ 4 đáp án cho ${roundLabels[round]} - Câu ${i + 1}`,
              variant: 'destructive',
            });
            return;
          }
          
          // Check for empty options
          const trimmedOptions = q.options.map((opt) => (opt || '').trim());
          const emptyOptions = trimmedOptions.filter((opt) => !opt);
          if (emptyOptions.length > 0) {
            toast({
              title: 'Lỗi',
              description: `Vui lòng điền đầy đủ 4 đáp án (không được để trống) cho ${roundLabels[round]} - Câu ${i + 1}`,
              variant: 'destructive',
            });
            return;
          }
          
          // Check if correct_answer matches one of the options (case-insensitive, trimmed)
          const trimmedCorrectAnswer = q.correct_answer.trim();
          const matchesOption = trimmedOptions.some((opt) => opt.toLowerCase() === trimmedCorrectAnswer.toLowerCase());
          
          if (!matchesOption) {
            toast({
              title: 'Lỗi',
              description: `Đáp án đúng phải là một trong 4 đáp án đã nhập cho ${roundLabels[round]} - Câu ${i + 1}. Đáp án hiện tại: "${trimmedCorrectAnswer}"`,
              variant: 'destructive',
            });
            return;
          }
        }
      }
    }

    setSaving(true);
    try {
      // Prepare all questions
      const allQuestions: Array<{
        round: RoundType;
        question_text: string;
        correct_answer: string;
        points: number;
        order_index: number;
      }> = [];

      for (const round of Object.keys(questions) as RoundType[]) {
        const roundQuestions = questions[round];
        for (const q of roundQuestions) {
          allQuestions.push({
            round,
            question_text: q.question_text.trim(),
            correct_answer: q.correct_answer.trim(),
            points: q.points,
            order_index: q.order_index,
            options: round === 'khoi_dong' && q.options ? JSON.stringify(q.options) : null,
          });
        }
      }

      if (allQuestions.length === 0) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng tạo ít nhất một câu hỏi',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const { error } = await createQuestions(gameId, allQuestions);
      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: `Đã tạo ${allQuestions.length} câu hỏi cho game. Bây giờ bạn có thể vào phòng chờ và host game.`,
      });

      navigate(`/game/lobby/${code}`);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể lưu câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tạo câu hỏi</h1>
              <p className="text-xl text-blue-100">Mã game: {code}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/game/lobby/${code}`)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>

          {/* Questions Tabs */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
            <CardHeader>
              <CardTitle>Tạo câu hỏi cho 4 phần thi</CardTitle>
              <CardDescription className="text-blue-100">
                Tạo câu hỏi cho từng phần thi. Mỗi câu hỏi cần có nội dung, đáp án đúng và điểm số.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="khoi_dong" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {(Object.keys(roundLabels) as RoundType[]).map((round) => (
                    <TabsTrigger key={round} value={round} className="text-sm">
                      {roundLabels[round]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {(Object.keys(roundLabels) as RoundType[]).map((round) => (
                  <TabsContent key={round} value={round} className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{roundLabels[round]}</h3>
                      <Button
                        onClick={() => addQuestion(round)}
                        size="sm"
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm câu hỏi
                      </Button>
                    </div>

                    {questions[round].length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-blue-200 mb-4">Chưa có câu hỏi nào</p>
                        <Button
                          onClick={() => addQuestion(round)}
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm câu hỏi đầu tiên
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {questions[round].map((question, index) => (
                          <Card key={index} className="bg-white/5 border-white/10">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-lg">Câu {index + 1}</h4>
                                <Button
                                  onClick={() => removeQuestion(round, index)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`question-${round}-${index}`} className="text-white mb-2">
                                    Câu hỏi
                                  </Label>
                                  <Textarea
                                    id={`question-${round}-${index}`}
                                    value={question.question_text}
                                    onChange={(e) =>
                                      updateQuestion(round, index, 'question_text', e.target.value)
                                    }
                                    placeholder="Nhập câu hỏi..."
                                    className="bg-white text-gray-800 min-h-[100px]"
                                  />
                                </div>

                                {/* Options for Round 1 (Khởi động) - Multiple Choice */}
                                {round === 'khoi_dong' && (
                                  <div>
                                    <Label className="text-white mb-2 block">
                                      4 Đáp án (Chọn một trong 4 đáp án làm đáp án đúng)
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {['A', 'B', 'C', 'D'].map((label, optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-2">
                                          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                            {label}
                                          </span>
                                          <Input
                                            type="text"
                                            value={question.options?.[optIndex] || ''}
                                            onChange={(e) =>
                                              updateQuestionOption(round, index, optIndex, e.target.value)
                                            }
                                            placeholder={`Đáp án ${label}...`}
                                            className="bg-white text-gray-800 flex-1"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`answer-${round}-${index}`} className="text-white mb-2">
                                      Đáp án đúng {round === 'khoi_dong' && '(Chọn từ 4 đáp án trên)'}
                                    </Label>
                                    {round === 'khoi_dong' && question.options ? (
                                      <select
                                        id={`answer-${round}-${index}`}
                                        value={question.correct_answer}
                                        onChange={(e) =>
                                          updateQuestion(round, index, 'correct_answer', e.target.value)
                                        }
                                        className="w-full px-3 py-2 bg-white text-gray-800 rounded-md border border-gray-300"
                                      >
                                        <option value="">Chọn đáp án đúng...</option>
                                        {question.options.map((opt, optIndex) => (
                                          <option key={optIndex} value={opt}>
                                            {String.fromCharCode(65 + optIndex)}: {opt}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <Input
                                        id={`answer-${round}-${index}`}
                                        type="text"
                                        value={question.correct_answer}
                                        onChange={(e) =>
                                          updateQuestion(round, index, 'correct_answer', e.target.value)
                                        }
                                        placeholder="Nhập đáp án đúng..."
                                        className="bg-white text-gray-800"
                                      />
                                    )}
                                  </div>

                                  <div>
                                    <Label htmlFor={`points-${round}-${index}`} className="text-white mb-2">
                                      Điểm số
                                    </Label>
                                    <Input
                                      id={`points-${round}-${index}`}
                                      type="number"
                                      value={question.points}
                                      onChange={(e) =>
                                        updateQuestion(round, index, 'points', parseInt(e.target.value) || 10)
                                      }
                                      min="1"
                                      max="100"
                                      className="bg-white text-gray-800"
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/game/lobby/${code}`)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu tất cả câu hỏi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameQuestions;

