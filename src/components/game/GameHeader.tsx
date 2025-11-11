import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Trophy, Users, Play } from 'lucide-react';

const GameHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
            <div className="relative">
              <Trophy className="h-10 w-10 text-yellow-400 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/30 transition-colors"></div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent block">
                Đường lên đỉnh
              </span>
              <span className="text-lg font-bold text-white">Olympia</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/game/join"
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                isActive('/game/join')
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="h-4 w-4" />
              Tham gia
            </Link>
            <Link to="/game/create">
              <Button
                className={`bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold ${
                  isActive('/game/create') ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <Play className="h-4 w-4 mr-2" />
                Tạo game
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white hover:text-blue-200 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/game/join"
                className="px-4 py-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                Tham gia game
              </Link>
              <Link to="/game/create" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold">
                  <Play className="h-4 w-4 mr-2" />
                  Tạo game mới
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default GameHeader;

