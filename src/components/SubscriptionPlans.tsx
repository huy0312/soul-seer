
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

const SubscriptionPlans = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-purple-900 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Chọn Gói Dịch Vụ
            </span>
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Khám phá vận mệnh với bộ bài Smith-Waite cổ điển
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={index}
                className={`mystic-card relative overflow-hidden ${
                  plan.popular ? 'ring-2 ring-purple-400 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold">
                    Phổ Biến
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-2xl font-bold mb-2">
                    {plan.title}
                  </CardTitle>
                  <div className="text-3xl font-bold text-white mb-2">
                    {plan.price}
                    <span className="text-lg text-purple-300 font-normal">{plan.period}</span>
                  </div>
                  <CardDescription className="text-purple-200">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-purple-100">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${plan.color} mr-3 flex-shrink-0`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full mt-6 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-3 rounded-full transition-all duration-300 animate-glow`}
                  >
                    {plan.title === "AI Chat" ? "Trải Nghiệm Ngay" : "Chọn Gói Này"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlans;
