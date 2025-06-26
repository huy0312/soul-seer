
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, BookOpen } from 'lucide-react';
import { useState } from 'react';

const zodiacSigns = [
  { 
    name: "Bạch Dương", 
    period: "21/3 - 19/4", 
    color: "from-red-500 to-pink-500",
    weeklyMessage: "Tuần này, năng lượng của bạn sẽ được tăng cường mạnh mẽ. Hãy tận dụng sự nhiệt huyết để khởi động những dự án mới. Tình yêu có thể gặp gỡ người đặc biệt vào cuối tuần."
  },
  { 
    name: "Kim Ngưu", 
    period: "20/4 - 20/5", 
    color: "from-green-500 to-emerald-500",
    weeklyMessage: "Sự ổn định tài chính sẽ được cải thiện đáng kể. Đây là thời điểm tốt để đầu tư hoặc tiết kiệm. Mối quan hệ gia đình sẽ trở nên hài hòa hơn."
  },
  { 
    name: "Song Tử", 
    period: "21/5 - 20/6", 
    color: "from-blue-500 to-cyan-500",
    weeklyMessage: "Khả năng giao tiếp của bạn sẽ mở ra nhiều cơ hội mới. Hãy chú ý đến những thông tin quan trọng đến từ bạn bè. Du lịch ngắn ngày sẽ mang lại may mắn."
  },
  { 
    name: "Cử Giải", 
    period: "21/6 - 22/7", 
    color: "from-purple-500 to-violet-500",
    weeklyMessage: "Cảm xúc của bạn sẽ được cân bằng và bình yên. Đây là thời điểm tuyệt vời để chăm sóc gia đình và những người thân yêu. Sức khỏe cần được quan tâm hơn."
  },
  { 
    name: "Sư Tử", 
    period: "23/7 - 22/8", 
    color: "from-amber-500 to-orange-500",
    weeklyMessage: "Ánh hào quang của bạn sẽ thu hút sự chú ý tích cực. Cơ hội thăng tiến trong công việc rất cao. Tình yêu nở rộ với những màn thể hiện lãng mạn."
  },
  { 
    name: "Xử Nữ", 
    period: "23/8 - 22/9", 
    color: "from-teal-500 to-cyan-500",
    weeklyMessage: "Sự tỉ mỉ và cẩn thận của bạn sẽ được đền đáp xứng đang. Công việc tiến triển thuận lợi nhờ kế hoạch chu đáo. Sức khỏe được cải thiện rõ rệt."
  },
  { 
    name: "Thiên Bình", 
    period: "23/9 - 22/10", 
    color: "from-pink-500 to-rose-500",
    weeklyMessage: "Cần cân bằng giữa công việc và cuộc sống cá nhân. Mối quan hệ đối tác sẽ mang lại lợi ích lớn. Nghệ thuật và cái đẹp sẽ truyền cảm hứng cho bạn."
  },
  { 
    name: "Bọ Cạp", 
    period: "23/10 - 21/11", 
    color: "from-red-600 to-red-500",
    weeklyMessage: "Trực giác mạnh mẽ sẽ dẫn dắt bạn đến những quyết định đúng đắn. Bí mật có thể được tiết lộ. Đừng ngại khám phá những điều sâu sắc trong nội tâm."
  },
  { 
    name: "Nhân Mã", 
    period: "22/11 - 21/12", 
    color: "from-purple-600 to-purple-500",
    weeklyMessage: "Tinh thần phiêu lưu sẽ dẫn bạn đến những trải nghiệm thú vị. Học hỏi và mở rộng kiến thức sẽ mang lại may mắn. Người từ xa có thể mang tin vui."
  },
  { 
    name: "Ma Kết", 
    period: "22/12 - 19/1", 
    color: "from-slate-600 to-slate-500",
    weeklyMessage: "Sự kiên trì của bạn sắp được đền đáp. Mục tiêu dài hạn đang dần hiện thực. Danh tiếng và uy tín sẽ được nâng cao trong tuần này."
  },
  { 
    name: "Bảo Bình", 
    period: "20/1 - 18/2", 
    color: "from-blue-600 to-blue-500",
    weeklyMessage: "Tư duy sáng tạo và độc đáo sẽ thu hút sự chú ý. Bạn bè và cộng đồng sẽ hỗ trợ nhiều cho bạn. Công nghệ có thể mang lại cơ hội bất ngờ."
  },
  { 
    name: "Song Ngư", 
    period: "19/2 - 20/3", 
    color: "from-cyan-500 to-blue-500",
    weeklyMessage: "Cảm xúc sẽ được chữa lành và thanh tẩy. Nghệ thuật, âm nhạc sẽ mang lại cảm hứng mạnh mẽ. Hãy tin vào trực giác của mình trong các quyết định quan trọng."
  }
];

const WeeklyHoroscope = () => {
  const [selectedSign, setSelectedSign] = useState<number | null>(null);

  return (
    <section id="horoscope" className="py-20 bg-gradient-to-b from-slate-900 to-purple-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow font-serif">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              Thông Điệp Tuần 12 Cung
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-sans">
            Khám phá vận mệnh hàng tuần cho từng cung hoàng đạo qua lá bài Tarot
          </p>
          <div className="flex items-center justify-center mt-4 text-slate-400">
            <Calendar className="w-5 h-5 mr-2" />
            <span className="font-sans">Cập nhật mỗi tuần</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {zodiacSigns.map((sign, index) => (
            <Card 
              key={index} 
              className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm group cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => setSelectedSign(selectedSign === index ? null : index)}
            >
              <CardHeader className="text-center pb-3">
                <div className={`mx-auto w-12 h-12 bg-gradient-to-br ${sign.color} rounded-full flex items-center justify-center mb-3 group-hover:animate-pulse`}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-white mb-1 font-serif">
                  {sign.name}
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs font-sans">
                  {sign.period}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center pt-0">
                <Button className={`w-full bg-gradient-to-r ${sign.color} hover:opacity-90 text-white font-semibold py-2 rounded-full transition-all duration-300 text-sm font-sans`}>
                  {selectedSign === index ? 'Ẩn Thông Điệp' : 'Xem Thông Điệp'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Message Display */}
        {selectedSign !== null && (
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-purple-900/80 to-slate-900/80 border-purple-400/30 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${zodiacSigns[selectedSign].color} rounded-full flex items-center justify-center mb-4`}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2 font-serif">
                  Thông Điệp Tuần Này - {zodiacSigns[selectedSign].name}
                </CardTitle>
                <CardDescription className="text-purple-200 font-sans">
                  {zodiacSigns[selectedSign].period}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-purple-100 leading-relaxed font-sans mb-6">
                  {zodiacSigns[selectedSign].weeklyMessage}
                </p>
                <div className="flex items-center justify-center text-purple-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm font-sans">Cập nhật: Tuần {Math.ceil(new Date().getDate() / 7)} tháng {new Date().getMonth() + 1}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-full text-lg animate-glow font-sans"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Xem Tất Cả Blog Horoscope
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WeeklyHoroscope;
