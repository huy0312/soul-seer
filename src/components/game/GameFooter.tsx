import { Link } from 'react-router-dom';
import { Trophy, Users, Play, Mail, Facebook, Instagram } from 'lucide-react';

const GameFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent block">
                  Đường lên đỉnh
                </span>
                <span className="text-lg font-bold text-white">Olympia</span>
              </div>
            </div>
            <p className="text-blue-200 mb-4 leading-relaxed max-w-md">
              Cuộc thi kiến thức dành cho học sinh. Thử thách bản thân với các câu hỏi đa dạng và cạnh tranh với bạn bè để giành chiến thắng!
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110"
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-110"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-200 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/game/join" className="text-blue-200 hover:text-white transition-colors">
                  Tham gia game
                </Link>
              </li>
              <li>
                <Link to="/game/create" className="text-blue-200 hover:text-white transition-colors">
                  Tạo game mới
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <span className="text-blue-200">contact@olympia.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-blue-300">
            © 2024 Đường lên đỉnh Olympia. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GameFooter;

