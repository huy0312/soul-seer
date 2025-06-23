
-- Tạo bảng lưu trữ thông tin đặt lịch hẹn
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bật Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép tất cả mọi người có thể tạo booking (vì đây là form công khai)
CREATE POLICY "Anyone can create bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (true);

-- Tạo policy cho phép tất cả mọi người có thể xem booking (để hiển thị trang xác nhận)
CREATE POLICY "Anyone can view bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (true);

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger để tự động cập nhật updated_at khi có thay đổi
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
