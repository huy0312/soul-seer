import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Play, Sparkles, Zap, Target, Award } from 'lucide-react';

const GameLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
            <Trophy className="h-20 w-20 text-yellow-400 animate-bounce" />
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Đường lên đỉnh Olympia
            </h1>
          </div>
          
          <p className="text-2xl md:text-3xl text-blue-100 mb-4 font-light">
            Cuộc thi kiến thức dành cho học sinh
          </p>
          
          <p className="text-lg md:text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
            Thử thách bản thân với các câu hỏi kiến thức đa dạng. 
            Cạnh tranh với bạn bè và giành chiến thắng!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              onClick={() => navigate('/game/join')}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Users className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                Tham gia game
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Button>

            <Button
              onClick={() => navigate('/game/create')}
              size="lg"
              variant="outline"
              className="group relative overflow-hidden border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 text-lg px-8 py-6 rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
                Tạo game mới
              </span>
              <Sparkles className="absolute top-2 right-2 h-4 w-4 text-yellow-400 animate-ping" />
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Nhanh chóng</h3>
            <p className="text-blue-100 text-center">
              Tham gia game chỉ trong vài giây với mã game đơn giản
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Thử thách</h3>
            <p className="text-blue-100 text-center">
              Câu hỏi đa dạng từ dễ đến khó, phù hợp mọi trình độ
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="bg-gradient-to-br from-yellow-500 to-red-500 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Cạnh tranh</h3>
            <p className="text-blue-100 text-center">
              Thi đấu với bạn bè và xem ai là người xuất sắc nhất
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            Cách thức hoạt động
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Tham gia hoặc tạo game</h3>
              <p className="text-blue-200">Nhập mã game hoặc tạo game mới</p>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Chọn nhân vật</h3>
              <p className="text-blue-200">Chọn avatar đại diện cho bạn</p>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-yellow-500 to-red-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Bắt đầu chơi</h3>
              <p className="text-blue-200">Trả lời câu hỏi và giành chiến thắng</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default GameLanding;
