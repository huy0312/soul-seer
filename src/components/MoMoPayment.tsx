
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
      <Card className="max-w-sm w-full bg-white/95 backdrop-blur-sm">
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
          {/* QR Code */}
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/30f4b24d-6513-4144-91df-79856e8569f9.png" 
              alt="QR Code thanh toán"
              className="w-64 h-64 object-contain"
            />
          </div>

          {/* Amount */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MoMoPayment;
