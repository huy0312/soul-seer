-- Thêm cấu hình VCNV vào bảng games để lưu số cột, 4 từ hàng ngang và đáp án trung tâm
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS vcnv_config JSONB;

COMMENT ON COLUMN public.games.vcnv_config IS 'Cấu hình phần VCNV: {"cols": number, "rows": 4, "words": [w1,w2,w3,w4], "central": string}';


