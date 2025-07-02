
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VerificationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect to login after 3 seconds
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/Logo.png" 
              alt="Soul Seer Logo" 
              className="w-16 h-16 mx-auto mb-4 rounded-full"
            />
            <h1 className="text-3xl font-bold text-white font-serif">
              <span className="bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">
                Soul Seer
              </span>
            </h1>
          </div>

          <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center font-serif flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
                Xác Nhận Thành Công
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-slate-300 text-lg">
                  Tài khoản của bạn đã được xác nhận thành công!
                </p>
                <p className="text-slate-400">
                  Bạn sẽ được chuyển về trang đăng nhập trong 3 giây...
                </p>
              </div>
              
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-semibold py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Đăng Nhập Ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccess;
