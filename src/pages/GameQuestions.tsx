import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGameByCode, createQuestions, updateGameIntroVideo, uploadIntroVideo } from '@/services/gameService';
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
  const [introVideoUrl, setIntroVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

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
        setIntroVideoUrl(game.intro_video_url || '');
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

      // Upload video file if provided
      if (videoFile) {
        setUploadingVideo(true);
        try {
          const { url, error: uploadError } = await uploadIntroVideo(gameId, videoFile);
          if (uploadError) {
            console.error('Error uploading video:', uploadError);
            toast({
              title: 'Cảnh báo',
              description: 'Không thể upload video. Vui lòng thử lại hoặc sử dụng URL.',
              variant: 'destructive',
            });
          } else if (url) {
            const { error: videoError } = await updateGameIntroVideo(gameId, url);
            if (videoError) {
              console.error('Error updating video URL:', videoError);
            }
          }
        } catch (error) {
          console.error('Error uploading video:', error);
        } finally {
          setUploadingVideo(false);
        }
      } else if (introVideoUrl.trim()) {
        // Update intro video URL if provided (for URL input)
        const { error: videoError } = await updateGameIntroVideo(gameId, introVideoUrl.trim());
        if (videoError) {
          console.error('Error updating video URL:', videoError);
          // Don't fail the whole save if video update fails
        }
      }

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

          {/* Video Intro Upload */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Video Intro cho phần Khởi động</CardTitle>
              <CardDescription className="text-blue-100">
                Upload video của bạn để phát trước khi bắt đầu phần thi Khởi động
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="intro-video-file" className="text-white mb-2">
                    Upload Video File
                  </Label>
                  <Input
                    id="intro-video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (max 100MB)
                        if (file.size > 100 * 1024 * 1024) {
                          toast({
                            title: 'Lỗi',
                            description: 'File video quá lớn. Vui lòng chọn file nhỏ hơn 100MB.',
                            variant: 'destructive',
                          });
                          return;
                        }
                        setVideoFile(file);
                        setIntroVideoUrl(''); // Clear URL input if file is selected
                      }
                    }}
                    className="bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {videoFile && (
                    <div className="mt-2 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                      <p className="text-blue-200 text-sm">
                        <strong>File đã chọn:</strong> {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                  <p className="text-blue-200 text-sm mt-2">
                    Hỗ trợ: MP4, WebM, MOV (tối đa 100MB)
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-blue-900 px-2 text-blue-200">Hoặc</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="intro-video-url" className="text-white mb-2">
                    Hoặc nhập URL Video (tùy chọn)
                  </Label>
                  <Input
                    id="intro-video-url"
                    type="url"
                    value={introVideoUrl}
                    onChange={(e) => {
                      setIntroVideoUrl(e.target.value);
                      setVideoFile(null); // Clear file if URL is entered
                    }}
                    placeholder="https://example.com/video.mp4"
                    className="bg-white text-gray-800"
                  />
                  <p className="text-blue-200 text-sm mt-2">
                    Direct video link (MP4, WebM, etc.)
                  </p>
                </div>
              </div>
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
              disabled={saving || uploadingVideo}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-5 w-5 mr-2" />
              {uploadingVideo ? 'Đang upload video...' : saving ? 'Đang lưu...' : 'Lưu tất cả câu hỏi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameQuestions;

