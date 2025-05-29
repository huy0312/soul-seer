
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Phone } from 'lucide-react';

const BookingSection = () => {
  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-purple-900 to-slate-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow font-serif">
            <span className="bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Booking Tarot Reader Offline
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-sans">
            Trải nghiệm trực tiếp với chuyên gia Tarot Reader chuyên nghiệp
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Thông tin dịch vụ */}
            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white mb-4 font-serif flex items-center">
                  <User className="w-6 h-6 mr-2 text-amber-400" />
                  Dịch Vụ Tarot Reader
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-slate-300 font-sans">
                  <Clock className="w-5 h-5 mr-3 text-cyan-400" />
                  <span>60-90 phút/buổi</span>
                </div>
                <div className="flex items-center text-slate-300 font-sans">
                  <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                  <span>Tại quán cà phê hoặc không gian riêng</span>
                </div>
                <div className="flex items-center text-slate-300 font-sans">
                  <Calendar className="w-5 h-5 mr-3 text-amber-400" />
                  <span>Thứ 2 - Chủ nhật (9:00 - 21:00)</span>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-amber-600/20 rounded-lg border border-purple-400/30">
                  <h4 className="font-semibold text-amber-300 mb-2 font-serif">Bao gồm:</h4>
                  <ul className="text-sm text-slate-300 space-y-1 font-sans">
                    <li>• Tư vấn trực tiếp 1-1</li>
                    <li>• Trải bài Smith Waite</li>
                    <li>• Phân tích chi tiết từng lá bài</li>
                    <li>• Lời khuyên và hướng dẫn cụ thể</li>
                    <li>• Ghi âm buổi tư vấn (nếu yêu cầu)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Form booking */}
            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white mb-4 font-serif flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-cyan-400" />
                  Đặt Lịch Hẹn
                </CardTitle>
                <CardDescription className="text-slate-300 font-sans">
                  Điền thông tin để đặt lịch với Tarot Reader
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 font-sans">Họ tên</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-700/50 border border-purple-400/30 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none font-sans"
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 font-sans">Số điện thoại</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-2 bg-slate-700/50 border border-purple-400/30 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none font-sans"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 font-sans">Ngày mong muốn</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-slate-700/50 border border-purple-400/30 rounded-lg text-white focus:border-purple-400 focus:outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 font-sans">Ghi chú</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-slate-700/50 border border-purple-400/30 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none font-sans"
                    rows={3}
                    placeholder="Câu hỏi hoặc yêu cầu đặc biệt..."
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold py-3 rounded-full transition-all duration-300 font-sans">
                  <Phone className="w-5 h-5 mr-2" />
                  Đặt Lịch Ngay
                </Button>
                <p className="text-xs text-slate-400 text-center font-sans">
                  Chúng tôi sẽ liên hệ xác nhận lịch hẹn trong 24h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Giá dịch vụ */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-400/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4 font-serif">Bảng Giá Dịch Vụ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <h4 className="font-semibold text-amber-300 mb-2 font-serif">Cơ Bản</h4>
                  <p className="text-2xl font-bold text-white mb-1 font-sans">300.000đ</p>
                  <p className="text-sm text-slate-300 font-sans">Trải 3-5 lá bài</p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-purple-400/30">
                  <h4 className="font-semibold text-purple-300 mb-2 font-serif">Tiêu Chuẩn</h4>
                  <p className="text-2xl font-bold text-white mb-1 font-sans">500.000đ</p>
                  <p className="text-sm text-slate-300 font-sans">Trải đầy đủ + tư vấn</p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <h4 className="font-semibold text-cyan-300 mb-2 font-serif">Cao Cấp</h4>
                  <p className="text-2xl font-bold text-white mb-1 font-sans">800.000đ</p>
                  <p className="text-sm text-slate-300 font-sans">Tư vấn sâu + ghi âm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
