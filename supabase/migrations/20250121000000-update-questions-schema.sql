-- Cập nhật bảng questions để hỗ trợ format Olympia thực tế

-- Thêm các cột mới cho questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'normal' CHECK (question_type IN ('normal', 'hang_ngang', 'chuong_ngai_vat', 'goi_cau_hoi')),
ADD COLUMN IF NOT EXISTS hang_ngang_index INTEGER, -- Số thứ tự hàng ngang (1-4) cho VCNV
ADD COLUMN IF NOT EXISTS goi_diem INTEGER, -- Điểm của gói câu hỏi (20 hoặc 30) cho Về đích
ADD COLUMN IF NOT EXISTS hint TEXT; -- Gợi ý cho chướng ngại vật

-- Cập nhật bảng answers để lưu thời gian trả lời cho phần Tăng tốc
ALTER TABLE public.answers
ADD COLUMN IF NOT EXISTS response_time INTEGER; -- Thời gian trả lời tính bằng milliseconds

-- Tạo bảng để lưu trạng thái VCNV (hàng ngang nào đã được mở)
CREATE TABLE IF NOT EXISTS public.vcnv_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  hang_ngang_index INTEGER NOT NULL CHECK (hang_ngang_index BETWEEN 1 AND 4),
  is_revealed BOOLEAN NOT NULL DEFAULT false,
  revealed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(game_id, hang_ngang_index)
);

-- Tạo bảng để lưu trạng thái Về đích (thí sinh nào đã chọn gói nào)
CREATE TABLE IF NOT EXISTS public.ve_dich_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  goi_diem INTEGER NOT NULL CHECK (goi_diem IN (20, 30)),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, player_id)
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_vcnv_state_game_id ON public.vcnv_state(game_id);
CREATE INDEX IF NOT EXISTS idx_ve_dich_state_game_id ON public.ve_dich_state(game_id);
CREATE INDEX IF NOT EXISTS idx_ve_dich_state_player_id ON public.ve_dich_state(player_id);

-- Bật RLS cho các bảng mới
ALTER TABLE public.vcnv_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ve_dich_state ENABLE ROW LEVEL SECURITY;

-- Policies cho vcnv_state
CREATE POLICY "Anyone can view vcnv_state" 
  ON public.vcnv_state 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update vcnv_state" 
  ON public.vcnv_state 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can insert vcnv_state" 
  ON public.vcnv_state 
  FOR INSERT 
  WITH CHECK (true);

-- Policies cho ve_dich_state
CREATE POLICY "Anyone can view ve_dich_state" 
  ON public.ve_dich_state 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update ve_dich_state" 
  ON public.ve_dich_state 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can insert ve_dich_state" 
  ON public.ve_dich_state 
  FOR INSERT 
  WITH CHECK (true);

