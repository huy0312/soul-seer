
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Gift } from 'lucide-react';

const plans = [
  {
    icon: Star,
    title: "Gói Miễn Phí",
    price: "0 VND",
    period: "/ngày",
    description: "Trải nghiệm cơ bản với Tarot Smith-Waite",
    features: [
      "2 lượt trải bài/ngày", 
      "Máy tự động rút 3 lá bài",
      "Giải nghĩa chi tiết từng lá",
      "Thông điệp tổng quan",
      "Truy cập AI Chat cơ bản"
    ],
    color: "from-blue-500 to-cyan-500",
    popular: false
  },
  {
    icon: Crown,
    title: "Gói Premium",
    price: "30.000 VND",
    period: "/tháng",
    description: "Trải nghiệm đầy đủ với đặc quyền Premium",
    features: [
      "Trải bài không giới hạn",
      "Chọn mặt lưng bài yêu thích",
      "Tự chọn 3 lá từ 78 lá Smith-Waite",
      "Giải nghĩa chi tiết chuyên sâu",
      "AI Chat + Tarot không giới hạn",
      "Ưu tiên hỗ trợ"
    ],
    color: "from-purple-500 to-pink-500",
    popular: true
  },
  {
    icon: Zap,
    title: "AI Chat",
    price: "Miễn Phí",
    period: "",
    description: "Tư vấn trực tiếp với Soul Seer AI",
    features: [
      "Chat không giới hạn với AI",
      "Tư vấn tổng quát",
      "Bói bài Tarot bằng AI",
      "AI rút 3 lá bài Smith-Waite",
      "Giải nghĩa text chi tiết"
    ],
    color: "from-amber-500 to-yellow-500",
    popular: false
  }
];
