-- Thêm cột phục vụ phần Vượt chướng ngại vật
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS question_type TEXT CHECK (question_type IN ('hang_ngang', 'chuong_ngai_vat')) NULL,
ADD COLUMN IF NOT EXISTS hint TEXT NULL;

COMMENT ON COLUMN public.questions.question_type IS 'Loại câu hỏi cho VCNV: hang_ngang hoặc chuong_ngai_vat';
COMMENT ON COLUMN public.questions.hint IS 'Gợi ý cho từ hàng ngang (tùy chọn)';



