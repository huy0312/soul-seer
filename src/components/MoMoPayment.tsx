
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MoMoPaymentProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const MoMoPayment = ({ amount, description, onSuccess, onCancel }: MoMoPaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleMoMoPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate MoMo payment process
      // In real implementation, this would call MoMo API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll simulate a successful payment
      toast({
        title: "Thanh toán thành công!",
        description: "Bạn đã nâng cấp lên gói Premium thành công.",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Thanh toán thất bại",
        description: "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="mystic-card max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-white text-2xl">Thanh Toán MoMo</CardTitle>
          <CardDescription className="text-purple-200">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(amount)}
            </div>
            <p className="text-purple-200 text-sm">Gói Premium - 1 tháng</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-purple-200">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Bảo mật với MoMo</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              >
                Hủy
              </Button>
              
              <Button
                onClick={handleMoMoPayment}
                disabled={isProcessing}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Thanh toán MoMo'
                )}
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-purple-300">
            Bằng cách thanh toán, bạn đồng ý với điều khoản dịch vụ của chúng tôi
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoMoPayment;
