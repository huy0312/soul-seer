
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Star className="w-8 h-8 text-purple-400 animate-glow" />
              <div className="absolute inset-0 animate-spin">
                <Star className="w-8 h-8 text-purple-300 opacity-30" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Soulseer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-white hover:text-purple-300 transition-colors">
              Trang chủ
            </a>
            <a href="#services" className="text-white hover:text-purple-300 transition-colors">
              Dịch vụ
            </a>
            <a href="#about" className="text-white hover:text-purple-300 transition-colors">
              Về chúng tôi
            </a>
            <a href="#contact" className="text-white hover:text-purple-300 transition-colors">
              Liên hệ
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Link to="/tarot-reading">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full animate-glow">
                Bói ngay
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-purple-500/20">
            <nav className="flex flex-col space-y-4 mt-4">
              <a href="#home" className="text-white hover:text-purple-300 transition-colors">
                Trang chủ
              </a>
              <a href="#services" className="text-white hover:text-purple-300 transition-colors">
                Dịch vụ
              </a>
              <a href="#about" className="text-white hover:text-purple-300 transition-colors">
                Về chúng tôi
              </a>
              <a href="#contact" className="text-white hover:text-purple-300 transition-colors">
                Liên hệ
              </a>
              <Link to="/tarot-reading">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full w-fit">
                  Bói ngay
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
