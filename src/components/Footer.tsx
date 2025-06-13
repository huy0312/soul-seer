
import { Star, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-purple-500/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Soulseer
              </span>
            </div>
            <p className="text-purple-200 mb-4 leading-relaxed">
              Khám phá vận mệnh của bạn với dịch vụ Soulseer chuyên nghiệp. 
              Chúng tôi mang đến những dự đoán chính xác và lời khuyên hữu ích cho cuộc sống.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                <span className="text-white font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                <span className="text-white font-bold">@</span>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                <span className="text-white font-bold">in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-purple-200 hover:text-purple-300 transition-colors">Trang chủ</a></li>
              <li><a href="#services" className="text-purple-200 hover:text-purple-300 transition-colors">Dịch vụ</a></li>
              <li><a href="#about" className="text-purple-200 hover:text-purple-300 transition-colors">Về chúng tôi</a></li>
              <li><a href="#contact" className="text-purple-200 hover:text-purple-300 transition-colors">Liên hệ</a></li>
              <li><a href="#faq" className="text-purple-200 hover:text-purple-300 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liên Hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-purple-400" />
                <span className="text-purple-200">0862031203</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-purple-200">contact@soulseer.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-purple-400 mt-1" />
                <span className="text-purple-200">Đại học FPT Hòa Lạc</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-500/20 mt-8 pt-8 text-center">
          <p className="text-purple-300">
            © 2024 Soulseer. Tất cả quyền được bảo lưu. | 
            <a href="#privacy" className="hover:text-purple-200 ml-1">Chính sách bảo mật</a> | 
            <a href="#terms" className="hover:text-purple-200 ml-1">Điều khoản sử dụng</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
