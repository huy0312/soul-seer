
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, Sparkles, Users } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-slate-900 to-black relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow font-serif">
            <span className="bg-gradient-to-r from-purple-300 via-amber-300 to-cyan-300 bg-clip-text text-transparent">
              Về Soul Seer
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto font-sans leading-relaxed">
            Soul Seer là nền tảng Tarot AI tiên tiến, kết hợp trí tuệ nhân tạo với nghệ thuật bói bài truyền thống, 
            mang đến trải nghiệm khám phá vận mệnh độc đáo và chính xác.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Nội dung chính */}
          <div className="space-y-6">
            <Card className="bg-slate-800/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 font-serif">Công Nghệ AI Tiên Tiến</h3>
                    <p className="text-slate-300 font-sans">
                      Sử dụng Gemini AI để phân tích và giải mã ý nghĩa sâu xa của từng lá bài Tarot, 
                      mang đến lời khuyên chính xác và cá nhân hóa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 font-serif">Bộ Bài Smith Waite Cổ Điển</h3>
                    <p className="text-slate-300 font-sans">
                      Sử dụng bộ bài Tarot Smith Waite nổi tiếng với 78 lá bài đầy biểu tượng, 
                      được công nhận là chuẩn mực trong thế giới Tarot.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 font-serif">Trải Nghiệm Cá Nhân Hóa</h3>
                    <p className="text-slate-300 font-sans">
                      Từ trải bài online đến tư vấn trực tiếp với Tarot Reader chuyên nghiệp, 
                      chúng tôi mang đến giải pháp phù hợp cho mọi nhu cầu khám phá bản thân.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Thống kê */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-purple-600/20 to-amber-600/20 border-purple-400/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                <h3 className="text-3xl font-bold text-white mb-2 font-sans">10,000+</h3>
                <p className="text-slate-300 font-sans">Người dùng tin tưởng</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <h4 className="text-2xl font-bold text-amber-400 mb-1 font-sans">99%</h4>
                  <p className="text-slate-300 text-sm font-sans">Độ chính xác</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <h4 className="text-2xl font-bold text-purple-400 mb-1 font-sans">24/7</h4>
                  <p className="text-slate-300 text-sm font-sans">Hỗ trợ</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-white mb-3 font-serif">Tại sao chọn Soul Seer?</h4>
                <ul className="space-y-2 text-slate-300 font-sans">
                  <li className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-amber-400" />
                    Kết hợp truyền thống và công nghệ
                  </li>
                  <li className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-purple-400" />
                    Đội ngũ chuyên gia giàu kinh nghiệm
                  </li>
                  <li className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-cyan-400" />
                    Bảo mật thông tin tuyệt đối
                  </li>
                  <li className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-amber-400" />
                    Gói dịch vụ linh hoạt, phù hợp mọi túi tiền
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
