
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, Calendar, User } from 'lucide-react';

const services = [
  {
    icon: Heart,
    title: "Tình Yêu & Tương Lai",
    description: "Khám phá vận mệnh tình yêu, tìm hiểu về người ấy và tương lai của mối quan hệ.",
    price: "50.000 VND",
    popular: true
  },
  {
    icon: Star,
    title: "Vận May & Tài Lộc",
    description: "Dự đoán vận may, cơ hội kinh doanh và những thay đổi tích cực sắp tới.",
    price: "70.000 VND",
    popular: false
  },
  {
    icon: User,
    title: "Sự Nghiệp & Học Tập",
    description: "Tìm hiểu về con đường sự nghiệp, cơ hội thăng tiến và hướng phát triển.",
    price: "60.000 VND",
    popular: false
  },
  {
    icon: Calendar,
    title: "Tổng Quan Năm",
    description: "Xem tổng quan vận mệnh cả năm, những tháng thuận lợi và cần chú ý.",
    price: "100.000 VND",
    popular: true
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-black to-purple-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Dịch Vụ Bói Bài
            </span>
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Chọn loại bói bài phù hợp với câu hỏi và tình huống của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="mystic-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Phổ biến
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:animate-pulse">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mb-2">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-purple-200 text-sm leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-purple-300">{service.price}</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 rounded-full transition-all duration-300">
                  Chọn dịch vụ
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-full text-lg animate-glow"
          >
            Xem Tất Cả Dịch Vụ
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
