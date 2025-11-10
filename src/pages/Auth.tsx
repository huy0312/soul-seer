
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, Star, Trophy } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          toast({
            title: "Lỗi đăng nhập",
            description: error.message === 'Invalid login credentials' 
              ? "Email hoặc mật khẩu không chính xác"
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Đăng nhập thành công",
            description: "Chào mừng bạn quay trở lại!",
          });
          navigate('/');
        }
      } else {
        if (!formData.fullName.trim()) {
          toast({
            title: "Thiếu thông tin",
            description: "Vui lòng nhập họ tên",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Email đã tồn tại",
              description: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Lỗi đăng ký",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Đăng ký thành công",
            description: "Vui lòng kiểm tra email để xác nhận tài khoản.",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Có lỗi xảy ra",
        description: "Vui lòng thử lại sau",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Back to home */}
          <Link to="/" className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay về trang chủ
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-16 w-16 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Đường lên đỉnh Olympia
              </span>
            </h1>
            <p className="text-blue-200 mt-2">Cuộc thi kiến thức dành cho học sinh</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">
                {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">
                      Họ và tên *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="bg-white text-gray-800"
                      placeholder="Nhập họ và tên của bạn"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-white text-gray-800"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Mật khẩu *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-white text-gray-800 pr-10"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-300 hover:text-blue-200 transition-colors"
                >
                  {isLogin ? (
                    <>
                      Chưa có tài khoản? <span className="font-semibold">Đăng ký ngay</span>
                    </>
                  ) : (
                    <>
                      Đã có tài khoản? <span className="font-semibold">Đăng nhập</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
