
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/lovable-uploads/f06dd398-3fe1-400c-b402-f4b361db1465.png" 
              alt="Soulseer Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Soulseer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-purple-200 hover:text-purple-100 transition-colors ${
                isActive('/') ? 'text-purple-100 font-semibold' : ''
              }`}
            >
              Trang Chủ
            </Link>
            <Link 
              to="/tarot-reading" 
              className={`text-purple-200 hover:text-purple-100 transition-colors ${
                isActive('/tarot-reading') ? 'text-purple-100 font-semibold' : ''
              }`}
            >
              Bói Bài
            </Link>
            <Link 
              to="/ai-reading" 
              className={`text-purple-200 hover:text-purple-100 transition-colors ${
                isActive('/ai-reading') ? 'text-purple-100 font-semibold' : ''
              }`}
            >
              Bói AI
            </Link>
            
            <Link to="/tarot-reading">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full">
                Bói Miễn Phí
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-purple-200 hover:text-purple-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-purple-500/20">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-purple-200 hover:text-purple-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang Chủ
              </Link>
              <Link 
                to="/tarot-reading" 
                className="text-purple-200 hover:text-purple-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Bói Bài
              </Link>
              <Link 
                to="/ai-reading" 
                className="text-purple-200 hover:text-purple-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Bói AI
              </Link>
              <Link to="/tarot-reading" onClick={() => setIsMenuOpen(false)}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full w-full">
                  Bói Miễn Phí
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
