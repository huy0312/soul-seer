
import { Check, Star, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Star,
    title: "Chính Xác Cao",
    description: "Sử dụng bộ bài Tarot truyền thống với phương pháp bói cổ xưa"
  },
  {
    icon: Shield,
    title: "Bảo Mật Tuyệt Đối",
    description: "Thông tin cá nhân được bảo vệ và giữ bí mật hoàn toàn"
  },
  {
    icon: Clock,
    title: "Phản Hồi Nhanh",
    description: "Kết quả bói bài được gửi đến bạn trong vòng 24 giờ"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-purple-900 to-black relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Tại Sao Chọn Chúng Tôi?
              </span>
            </h2>
            
            <p className="text-lg text-purple-200 mb-8 leading-relaxed">
              Với hơn 10 năm kinh nghiệm trong lĩnh vực bói bài Tarot, chúng tôi mang đến cho bạn 
              những dự đoán chính xác và những lời khuyên hữu ích cho cuộc sống.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-purple-200">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 mystic-card rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Cam Kết Của Chúng Tôi:</h3>
              <div className="space-y-2">
                {[
                  "Kết quả bói bài chính xác và chi tiết",
                  "Tư vấn tận tình và chuyên nghiệp", 
                  "Hỗ trợ khách hàng 24/7",
                  "Hoàn tiền 100% nếu không hài lòng"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-purple-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Tarot Cards Display */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((card) => (
                <div
                  key={card}
                  className="h-32 bg-gradient-to-b from-purple-800 to-purple-900 rounded-lg border-2 border-purple-400 shadow-2xl animate-float mystic-card flex items-center justify-center"
                  style={{
                    animationDelay: `${card * 0.3}s`,
                  }}
                >
                  <Star className="w-8 h-8 text-purple-300" />
                </div>
              ))}
            </div>
            
            {/* Center mystical symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-glow">
                <Star className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
