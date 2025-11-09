-- Thêm trường is_host vào bảng players để xác định người tổ chức
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS is_host BOOLEAN NOT NULL DEFAULT false;

-- Tạo index cho is_host
CREATE INDEX IF NOT EXISTS idx_players_is_host ON public.players(is_host);

-- Đảm bảo mỗi game chỉ có 1 host
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_game_host ON public.players(game_id) 
WHERE is_host = true;

