
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/lovable-uploads/Logo.png" 
              alt="Soul Seer Logo" 
              className="w-10 h-10 object-contain rounded-full"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Soul Seer
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
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-purple-200 hover:text-purple-100 transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-purple-600 text-white text-sm">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block">{profile?.full_name || 'Tài khoản'}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl py-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-purple-200 hover:text-purple-100 hover:bg-slate-700/50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Thông tin cá nhân
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/tarot-reading">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full">
                    Bói Miễn Phí
                  </Button>
                </Link>
              </div>
            )}
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
              
              {user ? (
                <div className="space-y-4 pt-4 border-t border-purple-500/20">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-purple-200">{profile?.full_name || 'Tài khoản'}</span>
                  </div>
                  <Link 
                    to="/profile" 
                    className="text-purple-200 hover:text-purple-100 transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-purple-500/20">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 w-full">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/tarot-reading" onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full w-full">
                      Bói Miễn Phí
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
