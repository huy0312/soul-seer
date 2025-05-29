
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Gift } from 'lucide-react';

const plans = [
  {
    icon: Star,
    title: "Gói Tuần",
    price: "10.000 VND",
    period: "/tuần",
    description: "Trải nghiệm cơ bản với Tarot AI",
    features: [
      "3 lượt trải bài/tuần",
      "Truy cập AI Gemini",
      "Lời khuyên cơ bản"
    ],
    color: "from-blue-500 to-cyan-500",
    popular: false
  },
  {
    icon: Crown,
    title: "VIP 1",
    price: "30.000 VND",
    period: "/tháng",
    description: "Gói phổ biến với nhiều tính năng",
    features: [
      "Trải bài không giới hạn",
      "Truy cập đầy đủ AI Gemini",
      "Blog horoscope 12 cung",
      "Lời khuyên chi tiết"
    ],
    color: "from-purple-500 to-pink-500",
    popular: true
  },
  {
    icon: Zap,
    title: "VIP 2",
    price: "50.000 VND",
    period: "/tháng",
    description: "Gói cao cấp với đặc quyền độc quyền",
    features: [
      "Tất cả tính năng VIP 1",
      "1 lần free book tarot reader",
      "Ưu tiên hỗ trợ 24/7",
      "Truy cập sớm tính năng mới",
      "Báo cáo chi tiết hàng tuần"
    ],
    color: "from-amber-500 to-yellow-500",
    popular: false
  }
];

const SubscriptionPlans = () => {
  return (
    <section id="subscription" className="py-20 bg-gradient-to-b from-purple-900 to-slate-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow font-serif">
            <span className="bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Gói Dịch Vụ Đăng Ký
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-sans">
            Chọn gói phù hợp để trải nghiệm đầy đủ sức mạnh của Tarot AI Soul Seer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`bg-slate-800/50 border-purple-500/30 backdrop-blur-sm group cursor-pointer transform hover:scale-105 transition-all duration-300 relative ${plan.popular ? 'border-amber-400/50 shadow-amber-400/20 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 px-6 py-2 rounded-full text-sm font-bold flex items-center">
                    <Gift className="w-4 h-4 mr-1" />
                    Phổ biến nhất
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center mb-4 group-hover:animate-pulse`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mb-2 font-serif">
                  {plan.title}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white font-sans">{plan.price}</span>
                  <span className="text-slate-400 font-sans">{plan.period}</span>
                </div>
                <CardDescription className="text-slate-300 text-sm leading-relaxed font-sans">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-300 font-sans">
                      <Star className="w-4 h-4 mr-2 text-amber-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-3 rounded-full transition-all duration-300 font-sans`}>
                  Đăng Ký Ngay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlans;
