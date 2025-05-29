
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, BookOpen } from 'lucide-react';

const zodiacSigns = [
  { name: "Bạch Dương", period: "21/3 - 19/4", color: "from-red-500 to-pink-500" },
  { name: "Kim Ngưu", period: "20/4 - 20/5", color: "from-green-500 to-emerald-500" },
  { name: "Song Tử", period: "21/5 - 20/6", color: "from-blue-500 to-cyan-500" },
  { name: "Cự Giải", period: "21/6 - 22/7", color: "from-purple-500 to-violet-500" },
  { name: "Sư Tử", period: "23/7 - 22/8", color: "from-amber-500 to-orange-500" },
  { name: "Xử Nữ", period: "23/8 - 22/9", color: "from-teal-500 to-cyan-500" },
  { name: "Thiên Bình", period: "23/9 - 22/10", color: "from-pink-500 to-rose-500" },
  { name: "Bọ Cạp", period: "23/10 - 21/11", color: "from-red-600 to-red-500" },
  { name: "Nhân Mã", period: "22/11 - 21/12", color: "from-purple-600 to-purple-500" },
  { name: "Ma Kết", period: "22/12 - 19/1", color: "from-slate-600 to-slate-500" },
  { name: "Bảo Bình", period: "20/1 - 18/2", color: "from-blue-600 to-blue-500" },
  { name: "Song Ngư", period: "19/2 - 20/3", color: "from-cyan-500 to-blue-500" }
];

const WeeklyHoroscope = () => {
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
            <Card key={index} className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm group cursor-pointer transform hover:scale-105 transition-all duration-300">
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
                  Xem Thông Điệp
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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
