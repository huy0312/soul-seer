
-- Insert 100 demo users into profiles table
INSERT INTO public.profiles (id, full_name, age, address, created_at) 
SELECT 
  gen_random_uuid(),
  CASE 
    WHEN random() < 0.5 THEN 
      (ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'])[floor(random() * 10 + 1)] || ' ' ||
      (ARRAY['Văn', 'Thị', 'Minh', 'Hồng', 'Thu', 'Lan', 'Hương', 'Mai', 'Hoa', 'Linh'])[floor(random() * 10 + 1)] || ' ' ||
      (ARRAY['An', 'Bình', 'Cường', 'Dũng', 'Giang', 'Hải', 'Khoa', 'Long', 'Nam', 'Phong'])[floor(random() * 10 + 1)]
    ELSE 
      (ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'])[floor(random() * 10 + 1)] || ' ' ||
      (ARRAY['Thị', 'Văn', 'Minh', 'Thu', 'Lan', 'Hương', 'Mai', 'Hoa', 'Linh', 'Ngọc'])[floor(random() * 10 + 1)] || ' ' ||
      (ARRAY['Anh', 'Hương', 'Linh', 'Mai', 'Nga', 'Oanh', 'Phương', 'Quỳnh', 'Thảo', 'Uyên'])[floor(random() * 10 + 1)]
  END,
  floor(random() * 50 + 18)::integer,
  (ARRAY['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Quy Nhon', 'Đà Lạt'])[floor(random() * 10 + 1)],
  now() - (random() * interval '90 days')
FROM generate_series(1, 100);

-- Add some demo bookings to increase visit statistics
INSERT INTO public.bookings (full_name, phone, preferred_date, notes, status, created_at)
SELECT 
  (ARRAY['Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Thu D', 'Hoàng Văn E', 'Huỳnh Thị F', 'Phan Minh G', 'Vũ Thu H', 'Võ Văn I', 'Đặng Thị K'])[floor(random() * 10 + 1)],
  '09' || lpad(floor(random() * 100000000)::text, 8, '0'),
  current_date + (random() * interval '30 days')::integer,
  (ARRAY['Xem tarot tình yêu', 'Tư vấn sự nghiệp', 'Dự đoán tương lai', 'Giải mộng', 'Xem tướng số', 'Tư vấn tổng quát'])[floor(random() * 6 + 1)],
  (ARRAY['pending', 'confirmed', 'cancelled'])[floor(random() * 3 + 1)],
  now() - (random() * interval '7 days')
FROM generate_series(1, 50);
