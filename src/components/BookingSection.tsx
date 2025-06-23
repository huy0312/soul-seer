
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar, Clock, MapPin, User, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const bookingSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  preferredDate: z.string().min(1, 'Vui lòng chọn ngày'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      preferredDate: '',
      notes: '',
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      // Lưu booking vào database
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          full_name: data.fullName,
          phone: data.phone,
          preferred_date: data.preferredDate,
          notes: data.notes || '',
        })
        .select()
        .single();

      if (error) throw error;

      // Gửi thông tin lên Facebook fanpage
      try {
        await fetch('/api/send-to-facebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: booking.id,
            fullName: data.fullName,
            phone: data.phone,
            preferredDate: data.preferredDate,
            notes: data.notes || '',
          }),
        });
      } catch (fbError) {
        console.error('Facebook integration error:', fbError);
        // Không block việc đặt lịch nếu Facebook API lỗi
      }

      toast({
        title: 'Đặt lịch thành công!',
        description: 'Chúng tôi sẽ liên hệ xác nhận trong 24h',
      });

      // Chuyển đến trang xác nhận
      navigate(`/booking-confirmation/${booking.id}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Lỗi đặt lịch',
        description: 'Có lỗi xảy ra, vui lòng thử lại sau',
        variant: 'destructive',
      });
    }
  };

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-purple-900 to-slate-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow font-serif">
            <span className="bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Booking Tarot Reader Offline
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-sans">
            Trải nghiệm trực tiếp với chuyên gia Tarot Reader chuyên nghiệp
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Thông tin dịch vụ */}
            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white mb-4 font-serif flex items-center">
                  <User className="w-6 h-6 mr-2 text-amber-400" />
                  Dịch Vụ Tarot Reader
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-slate-300 font-sans">
                  <Clock className="w-5 h-5 mr-3 text-cyan-400" />
                  <span>60-90 phút/buổi</span>
                </div>
                <div className="flex items-center text-slate-300 font-sans">
                  <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                  <span>Tại quán cà phê hoặc không gian riêng</span>
                </div>
                <div className="flex items-center text-slate-300 font-sans">
                  <Calendar className="w-5 h-5 mr-3 text-amber-400" />
                  <span>Thứ 2 - Chủ nhật (9:00 - 21:00)</span>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-amber-600/20 rounded-lg border border-purple-400/30">
                  <h4 className="font-semibold text-amber-300 mb-2 font-serif">Bao gồm:</h4>
                  <ul className="text-sm text-slate-300 space-y-1 font-sans">
                    <li>• Tư vấn trực tiếp 1-1</li>
                    <li>• Trải bài Smith Waite</li>
                    <li>• Phân tích chi tiết từng lá bài</li>
                    <li>• Lời khuyên và hướng dẫn cụ thể</li>
                    <li>• Ghi âm buổi tư vấn (nếu yêu cầu)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Form booking */}
            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white mb-4 font-serif flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-cyan-400" />
                  Đặt Lịch Hẹn
                </CardTitle>
                <CardDescription className="text-slate-300 font-sans">
                  Điền thông tin để đặt lịch với Tarot Reader
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-sans">Họ tên</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nhập họ tên của bạn"
                              className="bg-slate-700/50 border-purple-400/30 text-white placeholder-slate-400 focus:border-purple-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-sans">Số điện thoại</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Số điện thoại liên hệ"
                              className="bg-slate-700/50 border-purple-400/30 text-white placeholder-slate-400 focus:border-purple-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-sans">Ngày mong muốn</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              className="bg-slate-700/50 border-purple-400/30 text-white focus:border-purple-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-sans">Ghi chú</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Câu hỏi hoặc yêu cầu đặc biệt..."
                              className="bg-slate-700/50 border-purple-400/30 text-white placeholder-slate-400 focus:border-purple-400"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold py-3 rounded-full transition-all duration-300 font-sans"
                      disabled={form.formState.isSubmitting}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {form.formState.isSubmitting ? 'Đang đặt lịch...' : 'Đặt Lịch Ngay'}
                    </Button>
                    
                    <p className="text-xs text-slate-400 text-center font-sans">
                      Chúng tôi sẽ liên hệ xác nhận lịch hẹn trong 24h
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Giá dịch vụ */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-400/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4 font-serif">Bảng Giá Dịch Vụ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <h4 className="font-semibold text-amber-300 mb-2 font-serif">Cơ Bản</h4>
                  <p className="text-2xl font-bold text-white mb-1 font-sans">300.000đ</p>
                  <p className="text-sm text-slate-300 font-sans">Trải 3-5 lá bài</p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-purple-400/30">
                  <h4 className="font-semibold text-purple-300 mb-2 font-serif">Tiêu Chuẩn</h4>
                  <p className="text-2xl font-bold text-white mb-1 font-sans">500.000đ</p>
                  <p className="text-sm text-slate-300 font-sans">Trải đầy đủ + tư vấn</p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <h4 className="font-semibold text-cyan-300 mb-2 font-serif">Cao Cấp</h4>
                  <p className="text-2xl font-bold text-white mb-1 font-sans">800.000đ</p>
                  <p className="text-sm text-slate-300 font-sans">Tư vấn sâu + ghi âm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
