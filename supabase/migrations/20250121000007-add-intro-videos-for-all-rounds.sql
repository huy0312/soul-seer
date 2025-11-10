-- Thay đổi cột intro_video_url thành intro_videos (JSONB) để lưu video cho từng phần thi
-- Xóa cột cũ
ALTER TABLE public.games
DROP COLUMN IF EXISTS intro_video_url;

-- Thêm cột mới để lưu video intro cho từng phần thi
ALTER TABLE public.games
ADD COLUMN intro_videos JSONB DEFAULT '{}'::jsonb;

-- Thêm comment
COMMENT ON COLUMN public.games.intro_videos IS 'Lưu video intro cho từng phần thi: {"khoi_dong": "/videos/khoi-dong.mp4", "vuot_chuong_ngai_vat": "/videos/vuot-chuong-ngai-vat.mp4", ...}';

