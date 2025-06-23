
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Phone, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Booking {
  id: string;
  full_name: string;
  phone: string;
  preferred_date: string;
  notes: string;
  status: string;
  created_at: string;
}

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur-sm max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Không tìm thấy thông tin đặt lịch</h2>
            <Link to="/">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay về trang chủ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2 font-serif">
              Đặt Lịch Thành Công!
            </h1>
            <p className="text-slate-300 text-lg font-sans">
              Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi
            </p>
          </div>

          {/* Booking Details */}
          <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white font-serif flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-amber-400" />
                Thông Tin Lịch Hẹn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-slate-300">
                    <User className="w-5 h-5 mr-3 text-cyan-400" />
                    <div>
                      <p className="text-sm text-slate-400">Họ tên</p>
                      <p className="font-semibold text-white">{booking.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-slate-300">
                    <Phone className="w-5 h-5 mr-3 text-purple-400" />
                    <div>
                      <p className="text-sm text-slate-400">Số điện thoại</p>
                      <p className="font-semibold text-white">{booking.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-slate-300">
                    <Calendar className="w-5 h-5 mr-3 text-amber-400" />
                    <div>
                      <p className="text-sm text-slate-400">Ngày hẹn</p>
                      <p className="font-semibold text-white">{formatDate(booking.preferred_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start text-slate-300">
                    <MessageSquare className="w-5 h-5 mr-3 text-green-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400">Trạng thái</p>
                      <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-semibold">
                        Chờ xác nhận
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {booking.notes && (
                <div className="border-t border-slate-600 pt-4">
                  <p className="text-sm text-slate-400 mb-2">Ghi chú</p>
                  <p className="text-white bg-slate-700/30 p-3 rounded-lg">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-400/30 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 font-serif">Bước tiếp theo</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span>Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận lịch hẹn</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  <span>Thông tin đặt lịch đã được gửi đến fanpage Facebook của chúng tôi</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span>Vui lòng giữ máy để nhận cuộc gọi xác nhận từ chúng tôi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay về trang chủ
              </Button>
            </Link>
            <Link to="/#booking">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900">
                Đặt lịch hẹn khác
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
