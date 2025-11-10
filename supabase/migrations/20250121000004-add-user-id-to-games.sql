-- Thêm cột user_id vào bảng games để lưu người tạo game
ALTER TABLE public.games
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tạo index cho user_id
CREATE INDEX idx_games_user_id ON public.games(user_id);

-- Cập nhật RLS policies cho games
-- Xóa policy cũ
DROP POLICY IF EXISTS "Anyone can create games" ON public.games;
DROP POLICY IF EXISTS "Anyone can update games" ON public.games;

-- Chỉ cho phép authenticated users tạo game
CREATE POLICY "Authenticated users can create games" 
  ON public.games 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Chỉ cho phép người tạo game hoặc authenticated users cập nhật game
CREATE POLICY "Game creator or authenticated users can update games" 
  ON public.games 
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- Policy "Anyone can view games" đã tồn tại từ migration trước, không cần tạo lại

