
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MoMoPaymentProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const MoMoPayment = ({ amount, description, onSuccess, onCancel }: MoMoPaymentProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Auto-complete payment after 20 seconds
    const timer = setTimeout(() => {
      toast({
        title: "Thanh toán thành công!",
        description: "Bạn đã nâng cấp lên gói Premium thành công.",
      });
      onSuccess();
    }, 20000);

    return () => clearTimeout(timer);
  }, [onSuccess, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* QR Code Section */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-gray-900 text-xl font-bold mb-2">NGUYỄN HOÀNG THÁI</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              *******503
            </CardDescription>
            
            {/* Payment method logos */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="text-pink-600 font-bold text-lg">momo</div>
              <div className="text-red-600 font-bold text-sm">VIETQR</div>
              <div className="text-blue-600 font-bold text-sm">napas 247</div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* QR Code - Made bigger */}
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/30f4b24d-6513-4144-91df-79856e8569f9.png" 
                alt="QR Code thanh toán"
                className="w-80 h-80 object-contain border-4 border-gray-200 rounded-lg shadow-lg"
              />
            </div>

            {/* Amount */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                30.000đ
              </div>
              <p className="text-gray-600 text-sm">đăng ký gói premium</p>
            </div>

            {/* Cancel button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Hủy thanh toán
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500">
              Thanh toán sẽ tự động hoàn tất sau 20 giây
            </div>
          </CardContent>
        </Card>

        {/* Instructions Section */}
        <div className="space-y-6 text-white">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Hướng dẫn thanh toán
            </h2>
            <p className="text-purple-200 text-lg">
              Quét mã QR để thanh toán và kích hoạt gói Premium
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
              <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                Mở ứng dụng MoMo
              </h3>
              <p className="text-purple-200 text-sm">
                Khởi động ứng dụng MoMo trên điện thoại của bạn
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
              <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                Quét mã QR
              </h3>
              <p className="text-purple-200 text-sm">
                Chọn "Quét mã QR" và hướng camera vào mã QR bên trái
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
              <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                Xác nhận thanh toán
              </h3>
              <p className="text-purple-200 text-sm">
                Kiểm tra thông tin và xác nhận thanh toán 30.000đ
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-400/30">
              <h3 className="text-lg font-semibold text-green-300 mb-2 flex items-center">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">✓</span>
                Hoàn tất
              </h3>
              <p className="text-green-200 text-sm">
                Tài khoản sẽ được nâng cấp lên Premium ngay lập tức
              </p>
            </div>
          </div>

          <div className="bg-amber-600/20 rounded-lg p-4 border border-amber-400/30">
            <h4 className="text-amber-300 font-semibold mb-2">💡 Lưu ý:</h4>
            <p className="text-amber-200 text-sm">
              Để thuận tiện cho việc demo, thanh toán sẽ tự động hoàn tất sau 20 giây. 
              Trong thực tế, bạn cần thực hiện thanh toán qua MoMo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoMoPayment;
