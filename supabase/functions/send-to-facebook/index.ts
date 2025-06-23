
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { bookingId, fullName, phone, preferredDate, notes } = await req.json()

    // Lấy Facebook Page Access Token từ Supabase secrets
    const pageAccessToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN')
    const pageId = Deno.env.get('FACEBOOK_PAGE_ID')

    if (!pageAccessToken || !pageId) {
      console.error('Missing Facebook credentials')
      return new Response(
        JSON.stringify({ error: 'Facebook credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Tạo message để post lên Facebook
    const message = `
🔮 LỊCH HẸN MỚI - TAROT READING

👤 Khách hàng: ${fullName}
📞 Số điện thoại: ${phone}
📅 Ngày mong muốn: ${new Date(preferredDate).toLocaleDateString('vi-VN')}
📝 Ghi chú: ${notes || 'Không có'}

🆔 Mã đặt lịch: ${bookingId}

⏰ Thời gian đặt: ${new Date().toLocaleString('vi-VN')}

#TarotReading #SoulSeer #BookingNew
    `.trim()

    // Gửi post lên Facebook Page
    const facebookResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          access_token: pageAccessToken
        })
      }
    )

    if (!facebookResponse.ok) {
      const errorData = await facebookResponse.json()
      console.error('Facebook API error:', errorData)
      throw new Error(`Facebook API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const facebookData = await facebookResponse.json()
    console.log('Facebook post created:', facebookData.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        facebookPostId: facebookData.id,
        message: 'Booking sent to Facebook successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending to Facebook:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send booking to Facebook',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
