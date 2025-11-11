import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGameByCode, createQuestions, updateGameIntroVideos, uploadIntroVideo, getAllQuestionsByGame, deleteQuestionsByGame, uploadQuestionImage } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';
import type { RoundType } from '@/services/gameService';
import { Save, Plus, Trash2, ArrowLeft, Info, Users, FileQuestion, Shield, Clock, Zap } from 'lucide-react';


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
  const [introVideos, setIntroVideos] = useState<Record<RoundType, string>>({
    khoi_dong: '',
    vuot_chuong_ngai_vat: '',
    tang_toc: '',
    ve_dich: '',
  });
  const [videoFiles, setVideoFiles] = useState<Record<RoundType, File | null>>({
    khoi_dong: null,
    vuot_chuong_ngai_vat: null,
    tang_toc: null,
    ve_dich: null,
  });
  const [uploadingVideo, setUploadingVideo] = useState<Record<RoundType, boolean>>({
    khoi_dong: false,
    vuot_chuong_ngai_vat: false,
    tang_toc: false,
    ve_dich: false,
  });

  const [questions, setQuestions] = useState<Record<RoundType, Question[]>>({
    khoi_dong: [],
    vuot_chuong_ngai_vat: [],
    tang_toc: [],
    ve_dich: [],
  });

  // Image files for Tăng tốc questions (max 4 questions)
  const [tangTocImages, setTangTocImages] = useState<(File | null)[]>([null, null, null, null]);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([false, false, false, false]);

  // VCNV (Vuot chuong ngai vat) config state
  // VCNV config removed per new flow (slide handled externally)

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
        // Load existing questions to sync UI with database
        try {
          const { byRound, error: qError } = await getAllQuestionsByGame(game.id);
          if (!qError && byRound) {
            const mapped: Record<RoundType, Question[]> = {
              khoi_dong: [],
              vuot_chuong_ngai_vat: [],
              tang_toc: [],
              ve_dich: [],
            };
            (Object.keys(mapped) as RoundType[]).forEach((round) => {
              const list = byRound[round] || [];
              mapped[round] = list
                .filter((q: any) => (q.question_type || 'normal') === 'normal') // exclude VCNV generated rows from DB view here; VCNV config is handled separately below
                .map((q: any, idx: number) => ({
                  question_text: q.question_text || '',
                  correct_answer: q.correct_answer || '',
                  points: q.points ?? 10,
                  order_index: q.order_index ?? idx + 1,
                  question_type: (q.question_type as any) || 'normal',
                  hang_ngang_index: q.hang_ngang_index ?? null,
                  hint: q.hint ?? null,
                  options: Array.isArray(q.options)
                    ? (q.options as string[])
                    : typeof q.options === 'string'
                      ? (() => {
                          try { return JSON.parse(q.options); } catch { return null; }
                        })()
                      : null,
                }));
            });
            setQuestions(mapped);
          }
        } catch (e) {
          console.error('Error loading existing questions:', e);
        }
        // Load intro videos for all rounds
        if (game.intro_videos && typeof game.intro_videos === 'object') {
          const videos = game.intro_videos as Record<string, string>;
          setIntroVideos({
            khoi_dong: videos.khoi_dong || '',
            vuot_chuong_ngai_vat: videos.vuot_chuong_ngai_vat || '',
            tang_toc: videos.tang_toc || '',
            ve_dich: videos.ve_dich || '',
          });
        }
        // VCNV config deprecated in UI; no loading needed
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
    // Limit Tăng tốc to 4 questions
    if (round === 'tang_toc' && roundQuestions.length >= 4) {
      toast({
        title: 'Giới hạn',
        description: 'Phần thi Tăng tốc chỉ có tối đa 4 câu hỏi',
        variant: 'destructive',
      });
      return;
    }
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
      
      // Validate Tăng tốc must have exactly 4 questions
      if (round === 'tang_toc') {
        if (roundQuestions.length !== 4) {
          toast({
            title: 'Lỗi',
            description: 'Phần thi Tăng tốc phải có đúng 4 câu hỏi',
            variant: 'destructive',
          });
          return;
        }
      }
      
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
        
        // Validate Tăng tốc must have image
        if (round === 'tang_toc' && (!q.hint || !q.hint.trim())) {
          toast({
            title: 'Lỗi',
            description: `Vui lòng upload hình ảnh cho ${roundLabels[round]} - Câu ${i + 1}`,
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

    // No VCNV validation required (handled externally)

    setSaving(true);
    try {
      // Replace existing questions to keep data in sync
      const { error: delError } = await deleteQuestionsByGame(gameId);
      if (delError) {
        console.error('Error deleting old questions:', delError);
        toast({
          title: 'Cảnh báo',
          description: `Không thể làm mới bộ câu hỏi cũ. ${delError.message}`,
          variant: 'destructive',
        });
        // We continue to insert; duplicates are possible if delete failed
      }
      // Prepare all questions
      const allQuestions: Array<{
        round: RoundType;
        question_text: string;
        correct_answer: string;
        points: number;
        order_index: number;
        question_type?: 'normal' | 'hang_ngang' | 'chuong_ngai_vat' | 'goi_cau_hoi';
        hang_ngang_index?: number | null;
        hint?: string | null;
        options?: string | null;
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
            question_type: q.question_type || 'normal',
            hang_ngang_index: q.hang_ngang_index ?? null,
            hint: q.hint ?? null,
            options: round === 'khoi_dong' && q.options ? JSON.stringify(q.options) : null,
          });
        }
      }

      // No auto-generation for VCNV (slide handled externally)

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

      // No VCNV config persistence

      // Process intro videos for all rounds
      const finalIntroVideos: Record<RoundType, string | null> = {
        khoi_dong: null,
        vuot_chuong_ngai_vat: null,
        tang_toc: null,
        ve_dich: null,
      };

      // Upload video files and collect URLs
      for (const round of Object.keys(roundLabels) as RoundType[]) {
        const videoFile = videoFiles[round];
        const videoPath = introVideos[round]?.trim() || '';

        if (videoFile) {
          // Upload file
          setUploadingVideo((prev) => ({ ...prev, [round]: true }));
          try {
            console.log(`Uploading video for ${round}:`, videoFile.name);
            const { url, error: uploadError } = await uploadIntroVideo(gameId, videoFile);
            if (uploadError) {
              console.error(`Error uploading video for ${round}:`, uploadError);
              toast({
                title: 'Cảnh báo',
                description: `Không thể upload video cho ${roundLabels[round]}. ${uploadError.message}`,
                variant: 'destructive',
              });
            } else if (url) {
              console.log(`✅ Video uploaded for ${round}, URL:`, url);
              finalIntroVideos[round] = url;
            } else {
              console.error(`❌ No URL returned for ${round}`);
            }
          } catch (error) {
            console.error(`Exception uploading video for ${round}:`, error);
          } finally {
            setUploadingVideo((prev) => ({ ...prev, [round]: false }));
          }
        } else if (videoPath) {
          // Use path/URL directly
          console.log(`Using direct path/URL for ${round}:`, videoPath);
          finalIntroVideos[round] = videoPath;
        }
      }

      console.log('Final intro videos to save:', finalIntroVideos);

      // Update intro videos in database
      const { error: videoError } = await updateGameIntroVideos(gameId, finalIntroVideos);
      if (videoError) {
        console.error('Error updating intro videos:', videoError);
        toast({
          title: 'Cảnh báo',
          description: `Không thể lưu video intro. ${videoError.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('✅ Intro videos saved successfully');
        toast({
          title: 'Thành công',
          description: 'Video intro đã được lưu thành công!',
        });
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white flex items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
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
          {/* Prominent badge/header like create game */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center gap-3 mb-3 bg-white/10 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20 shadow-lg">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40">
                🎯
              </span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                Soạn câu hỏi cho 4 phần thi
              </h2>
            </div>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Khởi động, Vượt chướng ngại vật, Tăng tốc, Về đích. Nhập nội dung, đáp án, điểm số và video intro cho từng phần.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400">
                <span className="text-blue-300 font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Đăng nhập</p>
                <p className="text-xs text-blue-200">Xác thực tài khoản</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400">
                <span className="text-blue-300 font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Chọn phần thi</p>
                <p className="text-xs text-blue-200">Khởi động → VCNV → Tăng tốc → Về đích</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400">
                <span className="text-blue-300 font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Nhập câu hỏi</p>
                <p className="text-xs text-blue-200">Nội dung, đáp án, điểm số</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400">
                <span className="text-blue-300 font-bold">4</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Lưu & Host</p>
                <p className="text-xs text-blue-200">Đi tới phòng chờ</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
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
                    <TabsTrigger key={round} value={round} className="text-sm flex items-center justify-center gap-2">
                      <span>{roundLabels[round]}</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/20">
                        {questions[round]?.length || 0}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {(Object.keys(roundLabels) as RoundType[]).map((round) => (
                  <TabsContent key={round} value={round} className="space-y-4">
                    {round === 'vuot_chuong_ngai_vat' ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <h4 className="font-semibold mb-2">Phần 2 - Vượt chướng ngại vật</h4>
                          <p className="text-blue-200">
                            Phần thi này không cần cấu hình hàng ngang/đáp án trung tâm trong hệ thống.
                            Bạn có thể thêm mục ghi chú (tuỳ chọn) để đánh dấu số lượt, hoặc để trống.
                            Slide trò chơi sẽ được chiếu bên ngoài, web chỉ thu thập đáp án và thời gian.
                          </p>
                        </div>
                        {questions[round].length === 0 ? (
                          <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-blue-200 mb-4">Không cần tạo dữ liệu cho phần thi này. Nếu muốn, bạn có thể thêm mục ghi chú.</p>
                            <Button
                              onClick={() => addQuestion(round)}
                              variant="outline"
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Thêm mục ghi chú
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {questions[round].map((question, index) => (
                              <Card key={index} className="bg-white/5 border-white/10">
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-lg">Mục {index + 1}</h4>
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
                                      <Label className="text-white mb-2 block">Ghi chú (tuỳ chọn)</Label>
                                      <Textarea
                                        value={question.question_text}
                                        onChange={(e) => updateQuestion(round, index, 'question_text', e.target.value)}
                                        placeholder="Ví dụ: Vòng 1 - Ô chữ 1"
                                        className="bg-white text-gray-800 min-h-[80px]"
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            <div className="flex justify-end">
                              <Button onClick={() => addQuestion(round)} className="bg-white/10 border border-white/20 hover:bg-white/20">
                                <Plus className="h-4 w-4 mr-2" /> Thêm mục
                              </Button>
                            </div>
                          </div>
                        )}
                    </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Generic question builder for other rounds (kept as before) */}
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
                                        onChange={(e) => updateQuestion(round, index, 'question_text', e.target.value)}
                                    placeholder="Nhập câu hỏi..."
                                    className="bg-white text-gray-800 min-h-[100px]"
                                  />
                                </div>
                                {round === 'tang_toc' && (
                                  <div>
                                    <Label className="text-white mb-2 block">Hình ảnh câu hỏi</Label>
                                    <div className="space-y-2">
                                      {question.hint && (
                                        <div className="mb-2">
                                          <img src={question.hint} alt={`Câu ${index + 1}`} className="max-w-full h-auto max-h-48 rounded-lg border border-white/20" />
                                        </div>
                                      )}
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file || !gameId) return;
                                          const newImages = [...tangTocImages];
                                          newImages[index] = file;
                                          setTangTocImages(newImages);
                                          // Upload immediately
                                          const newUploading = [...uploadingImages];
                                          newUploading[index] = true;
                                          setUploadingImages(newUploading);
                                          const { url, error } = await uploadQuestionImage(gameId, index, file);
                                          if (error) {
                                            toast({
                                              title: 'Lỗi',
                                              description: error.message,
                                              variant: 'destructive',
                                            });
                                            newUploading[index] = false;
                                            setUploadingImages(newUploading);
                                            return;
                                          }
                                          if (url) {
                                            updateQuestion(round, index, 'hint', url);
                                          }
                                          newUploading[index] = false;
                                          setUploadingImages(newUploading);
                                        }}
                                        disabled={uploadingImages[index]}
                                        className="bg-white text-gray-800"
                                      />
                                      {uploadingImages[index] && (
                                        <p className="text-blue-200 text-sm">Đang upload...</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                    {round === 'khoi_dong' && (
                                      <div>
                                        <Label className="text-white mb-2 block">4 Đáp án</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {['A', 'B', 'C', 'D'].map((label, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">{label}</span>
                                              <Input
                                                type="text"
                                                value={question.options?.[optIndex] || ''}
                                                onChange={(e) => updateQuestionOption(round, index, optIndex, e.target.value)}
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
                                        <Label htmlFor={`answer-${round}-${index}`} className="text-white mb-2">Đáp án đúng</Label>
                                        {round === 'khoi_dong' && question.options ? (
                                          <select
                                            id={`answer-${round}-${index}`}
                                            value={question.correct_answer}
                                            onChange={(e) => updateQuestion(round, index, 'correct_answer', e.target.value)}
                                            className="w-full px-3 py-2 bg-white text-gray-800 rounded-md border border-gray-300"
                                          >
                                            <option value="">Chọn đáp án đúng...</option>
                                            {question.options.map((opt, optIndex) => (
                                              <option key={optIndex} value={opt}>{String.fromCharCode(65 + optIndex)}: {opt}</option>
                                            ))}
                                          </select>
                                        ) : (
                                    <Input
                                      id={`answer-${round}-${index}`}
                                      type="text"
                                      value={question.correct_answer}
                                            onChange={(e) => updateQuestion(round, index, 'correct_answer', e.target.value)}
                                      placeholder="Nhập đáp án đúng..."
                                      className="bg-white text-gray-800"
                                    />
                                        )}
                                  </div>
                                  <div>
                                        <Label htmlFor={`points-${round}-${index}`} className="text-white mb-2">Điểm số</Label>
                                    <Input
                                      id={`points-${round}-${index}`}
                                      type="number"
                                      value={question.points}
                                          onChange={(e) => updateQuestion(round, index, 'points', parseInt(e.target.value) || 10)}
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
                        {/* Quick add */}
                        <div className="flex justify-end">
                          <Button onClick={() => addQuestion(round)} className="bg-white/10 border border-white/20 hover:bg-white/20">
                            <Plus className="h-4 w-4 mr-2" /> Thêm câu hỏi
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Video Intro for all rounds */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Video Intro cho các phần thi</CardTitle>
              <CardDescription className="text-blue-100">
                Chọn video intro để phát trước khi bắt đầu mỗi phần thi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(Object.keys(roundLabels) as RoundType[]).map((round) => (
                  <div key={round} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">{roundLabels[round]}</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`intro-video-path-${round}`} className="text-white mb-2">
                          Đường dẫn video từ thư mục public (Khuyến nghị)
                        </Label>
                        <Input
                          id={`intro-video-path-${round}`}
                          type="text"
                          value={introVideos[round]}
                          onChange={(e) => {
                            setIntroVideos((prev) => ({
                              ...prev,
                              [round]: e.target.value,
                            }));
                            setVideoFiles((prev) => ({
                              ...prev,
                              [round]: null, // Clear file if path is entered
                            }));
                          }}
                          placeholder={`/videos/${round}-intro.mp4`}
                          className="bg-white text-gray-800"
                        />
                        <p className="text-blue-200 text-xs mt-1">
                          Ví dụ: <code className="bg-blue-900/50 px-1 rounded">/videos/{round}-intro.mp4</code>
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-blue-900 px-2 text-blue-200 text-xs">Hoặc</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`intro-video-file-${round}`} className="text-white mb-2">
                          Upload Video File
                        </Label>
                        <Input
                          id={`intro-video-file-${round}`}
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 100 * 1024 * 1024) {
                                toast({
                                  title: 'Lỗi',
                                  description: 'File video quá lớn. Vui lòng chọn file nhỏ hơn 100MB.',
                                  variant: 'destructive',
                                });
                                return;
                              }
                              setVideoFiles((prev) => ({
                                ...prev,
                                [round]: file,
                              }));
                              setIntroVideos((prev) => ({
                                ...prev,
                                [round]: '', // Clear path if file is selected
                              }));
                            }
                          }}
                          className="bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        {videoFiles[round] && (
                          <div className="mt-2 p-2 bg-blue-500/20 rounded border border-blue-400/30">
                            <p className="text-blue-200 text-xs">
                              <strong>File:</strong> {videoFiles[round]?.name} ({(videoFiles[round]!.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                  <p className="text-blue-200 text-sm">
                    <strong>Lưu ý:</strong> Đặt file video vào thư mục <code className="bg-blue-900/50 px-1 rounded">public</code> trong source code, sau đó nhập đường dẫn bắt đầu bằng <code className="bg-blue-900/50 px-1 rounded">/</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-300" />
                    Hướng dẫn nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <FileQuestion className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Khởi động</p>
                      <p className="text-xs text-blue-200">Bắt buộc 4 đáp án A/B/C/D và chọn đáp án đúng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">VCNV</p>
                      <p className="text-xs text-blue-200">Nhập 4 hàng ngang đúng số cột và đáp án trung tâm</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Users className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Video intro</p>
                      <p className="text-xs text-blue-200">Đặt đường dẫn public hoặc upload cho từng phần thi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Lưu dữ liệu</p>
                      <p className="text-xs text-blue-200">Nhấn “Lưu tất cả câu hỏi” để đồng bộ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Cần trợ giúp?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-200 mb-4">
                    Muốn quay lại phòng chờ để host game?
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                    onClick={() => navigate(`/game/lobby/${code}`)}
                  >
                    Về phòng chờ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Save Button (Sticky Footer) */}
          <div className="sticky bottom-0 left-0 right-0 py-4 bg-gradient-to-b from-blue-900/60 to-blue-900 backdrop-blur supports-[backdrop-filter]:bg-blue-900/50 border-t border-white/10 mt-8">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <p className="text-blue-100 text-sm hidden md:block">
                  Tổng số câu hỏi: <span className="font-semibold text-white">{(Object.keys(questions) as RoundType[]).reduce((acc, r) => acc + (questions[r]?.length || 0), 0)}</span>
                </p>
                <div className="ml-auto flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/game/lobby/${code}`)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || Object.values(uploadingVideo).some((v) => v)}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {Object.values(uploadingVideo).some((v) => v) ? 'Đang upload video...' : saving ? 'Đang lưu...' : 'Lưu tất cả câu hỏi'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default GameQuestions;

