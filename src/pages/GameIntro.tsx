import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Play, Users, Clock, Target, Zap } from 'lucide-react';

const GameIntro = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  const handleStart = () => {
    if (code) {
      navigate(`/game/play/${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Trophy className="h-20 w-20 text-yellow-400" />
              <h1 className="text-6xl font-bold">Đường lên đỉnh Olympia</h1>
            </div>
            <p className="text-2xl text-blue-100">Cuộc thi kiến thức dành cho học sinh</p>
          </div>

          {/* Introduction Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Chào mừng đến với cuộc thi!</CardTitle>
              <CardDescription className="text-center text-blue-100 text-lg">
                Bạn sắp tham gia một cuộc thi kiến thức đầy thử thách với 4 phần thi hấp dẫn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Users className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">4 Thí sinh</h3>
                    <p className="text-blue-200 text-sm">Tối đa 4 người chơi cùng thi đấu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Thời gian</h3>
                    <p className="text-blue-200 text-sm">Mỗi phần thi có thời gian riêng</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Target className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Tích điểm</h3>
                    <p className="text-blue-200 text-sm">Trả lời đúng để tích lũy điểm số</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Tốc độ</h3>
                    <p className="text-blue-200 text-sm">Phản ứng nhanh để giành chiến thắng</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules Toggle */}
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowRules(!showRules)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              size="lg"
            >
              {showRules ? 'Ẩn' : 'Xem'} luật chơi
            </Button>
          </div>

          {/* Rules Card */}
          {showRules && (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Luật chơi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">1.</span> Phần 1 - Khởi động
                    </h3>
                    <p className="text-blue-200 ml-6">
                      Các câu hỏi nhanh, mỗi thí sinh lần lượt trả lời. Trả lời đúng sẽ nhận được điểm tương ứng.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">2.</span> Phần 2 - Vượt chướng ngại vật
                    </h3>
                    <p className="text-blue-200 ml-6">
                      Phần thi tương tác với bấm chuông và giải từ khóa. Ai bấm chuông đầu tiên sẽ được quyền trả lời.
                      Điểm thưởng lớn hơn phần 1.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">3.</span> Phần 3 - Tăng tốc
                    </h3>
                    <p className="text-blue-200 ml-6">
                      Cả 4 thí sinh cùng chơi với tốc độ cao. Thời gian rất ngắn, điểm cao. Ai trả lời đúng nhanh
                      nhất sẽ nhận điểm cao nhất.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">4.</span> Phần 4 - Về đích
                    </h3>
                    <p className="text-blue-200 ml-6">
                      Mỗi thí sinh chọn gói câu hỏi với điểm khác nhau. Trả lời đúng cộng điểm, sai trừ điểm. Có thể
                      sử dụng "Ngôi sao hy vọng" để nhân đôi điểm nếu đúng.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-xl px-12 py-6"
            >
              <Play className="h-6 w-6 mr-3" />
              Bắt đầu cuộc thi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameIntro;

