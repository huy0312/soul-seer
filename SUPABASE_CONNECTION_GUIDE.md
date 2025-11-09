# Hướng dẫn cập nhật Supabase Connection String

## Bước 1: Lấy thông tin từ Supabase Dashboard

1. Đăng nhập vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** (biểu tượng bánh răng) > **API**
4. Copy 2 thông tin sau:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Bước 2: Cập nhật file `src/integrations/supabase/client.ts`

Thay thế 2 dòng sau:

```typescript
const SUPABASE_URL = "https://YOUR_NEW_PROJECT_URL.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_NEW_ANON_PUBLIC_KEY";
```

## Bước 3: Chạy lại migration SQL

Sau khi cập nhật connection string, cần chạy file migration SQL trong Supabase Dashboard:

1. Vào **SQL Editor** trong Supabase Dashboard
2. Tạo **New query**
3. Copy nội dung file `supabase/migrations/20250120000000-olympia-game.sql`
4. Paste và chạy (Run)

## Kiểm tra kết nối

Sau khi cập nhật, chạy ứng dụng và kiểm tra xem có kết nối được không.

