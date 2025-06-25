import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Heart, Briefcase, DollarSign, Users, Sparkles, Lock, Gift, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePremium } from '@/hooks/usePremium';

const cardBacks = [
  {
    id: 'mystical',
    name: 'Huyền Bí',
    image: '🌙',
    description: 'Mặt lưng với họa tiết mặt trăng và sao'
  },
  {
    id: 'celestial',
    name: 'Thiên Thể',
    image: '⭐',
    description: 'Mặt lưng với họa tiết vũ trụ và thiên hà'
  },
  {
    id: 'classic',
    name: 'Cổ Điển',
    image: '🔮',
    description: 'Mặt lưng truyền thống với họa tiết cổ điển'
  }
];

const topics = [
  {
    id: 'love',
    name: 'Tình Yêu & Tình Cảm',
    description: 'Khám phá vận mệnh tình yêu của bạn',
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'career',
    name: 'Sự Nghiệp & Công Việc',
    description: 'Tìm hiểu về con đường sự nghiệp',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'money',
    name: 'Tài Chính & Tiền Bạc',
    description: 'Dự đoán vận may tài lộc',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'family',
    name: 'Gia Đình & Người Thân',
    description: 'Mối quan hệ với gia đình',
    icon: Users,
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'general',
    name: 'Tổng Quan Cuộc Sống',
    description: 'Nhìn tổng thể về tương lai',
    icon: Star,
    color: 'from-purple-500 to-violet-500'
  }
];

const TarotReading = () => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCardBack, setSelectedCardBack] = useState('');
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const navigate = useNavigate();
  const { isPremium } = usePremium();

  // Load free usage count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('freeUsageCount');
    if (savedCount) {
      setFreeUsageCount(parseInt(savedCount));
    }
    
    // Auto-select premium if user has premium
    if (isPremium) {
      setSelectedPlan('premium');
    }
  }, [isPremium]);

  const canUseFree = freeUsageCount < 2;

  const handleStartReading = () => {
    if (!selectedTopic) return;

    if (selectedPlan === 'free' && !canUseFree) {
      alert('Bạn đã hết lượt bói miễn phí! Vui lòng nâng cấp Premium hoặc thử lại vào ngày mai.');
      return;
    }

    if (selectedPlan === 'premium' && !isPremium) {
      // Redirect to payment
      navigate('/payment?plan=premium&amount=30000');
      return;
    }

    if (selectedPlan === 'premium' && !selectedCardBack) {
      alert('Vui lòng chọn mặt lưng bài cho gói Premium');
      return;
    }

    setIsReading(true);

    // Update free usage count
    if (selectedPlan === 'free') {
      const newCount = freeUsageCount + 1;
      setFreeUsageCount(newCount);
      localStorage.setItem('freeUsageCount', newCount.toString());
    }

    // Navigate to result page with parameters
    setTimeout(() => {
      navigate(`/tarot-result?plan=${selectedPlan}&topic=${selectedTopic}&cardBack=${selectedCardBack || 'default'}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 hero-gradient relative overflow-hidden">
          <div className="stars"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Bói Bài Smith-Waite
              </span>
            </h1>
            <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Khám phá tương lai với bộ bài Tarot Smith-Waite chính thống. Chọn gói phù hợp với bạn.
            </p>
          </div>
        </section>

        {/* Plan Selection */}
        <section className="py-16 bg-gradient-to-b from-purple-900 to-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Plan Selection */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-center mb-8 text-glow">
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Chọn Gói Dịch Vụ
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Free Plan */}
                  <Card 
                    className={`mystic-card cursor-pointer transition-all duration-300 ${
                      selectedPlan === 'free' ? 'ring-2 ring-blue-400 bg-blue-800/30' : ''
                    } ${!canUseFree ? 'opacity-60' : ''}`}
                    onClick={() => !isPremium && setSelectedPlan('free')}
                  >
                    <CardHeader className="text-center">
                      <div className="text-4xl mb-4">🆓</div>
                      <CardTitle className="text-white text-xl">Gói Miễn Phí</CardTitle>
                      <CardDescription className="text-purple-200">
                        {canUseFree 
                          ? `Còn ${2 - freeUsageCount} lượt bói hôm nay` 
                          : 'Đã hết lượt bói hôm nay'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-2 text-sm text-purple-100">
                        <p>• Chỉ được trải bài 2 lần/ngày</p>
                        <p>• Máy tự động rút 3 lá bài</p>
                        <p>• Giải nghĩa chi tiết từng lá</p>
                        <p>• Thông điệp tổng quan</p>
                      </div>
                      {!canUseFree && (
                        <div className="mt-4 p-2 bg-red-800/30 rounded-lg border border-red-400/30">
                          <Lock className="w-5 h-5 mx-auto mb-2 text-red-400" />
                          <p className="text-red-300 text-xs">Hết lượt bói miễn phí</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Premium Plan */}
                  <Card 
                    className={`mystic-card cursor-pointer transition-all duration-300 relative ${
                      selectedPlan === 'premium' ? 'ring-2 ring-amber-400 bg-amber-800/30' : ''
                    }`}
                    onClick={() => setSelectedPlan('premium')}
                  >
                    {isPremium ? (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <Crown className="w-3 h-3 mr-1" />
                          ĐANG SỬ DỤNG
                        </span>
                      </div>
                    ) : (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <Gift className="w-3 h-3 mr-1" />
                          PREMIUM
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <div className="text-4xl mb-4">👑</div>
                      <CardTitle className="text-white text-xl">Gói Premium</CardTitle>
                      <CardDescription className="text-amber-200">
                        {isPremium ? 'Đã kích hoạt' : '30.000 VNĐ/tháng'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-2 text-sm text-purple-100">
                        <p>• Không giới hạn lượt trải bài</p>
                        <p>• Chọn mặt lưng bài yêu thích</p>
                        <p>• Tự chọn 3 lá từ 78 lá bài</p>
                        <p>• Giải nghĩa chi tiết</p>
                        <p>• Thông điệp tổng quan</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Card Back Selection (Premium only) */}
              {selectedPlan === 'premium' && (isPremium || !isPremium) && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-center mb-6 text-glow">
                    <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">
                      Chọn Mặt Lưng Bài
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cardBacks.map((cardBack) => (
                      <Card 
                        key={cardBack.id}
                        className={`mystic-card cursor-pointer transition-all duration-300 ${
                          selectedCardBack === cardBack.id ? 'ring-2 ring-amber-400 bg-amber-800/30' : ''
                        }`}
                        onClick={() => setSelectedCardBack(cardBack.id)}
                      >
                        <CardHeader className="text-center">
                          <div className="text-4xl mb-4">{cardBack.image}</div>
                          <CardTitle className="text-white text-lg">{cardBack.name}</CardTitle>
                          <CardDescription className="text-purple-200 text-sm">
                            {cardBack.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Selection */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-center mb-6 text-glow">
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Chọn Chủ Đề Bói
                  </span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topics.map((topic) => {
                    const IconComponent = topic.icon;
                    return (
                      <Card 
                        key={topic.id}
                        className={`mystic-card cursor-pointer transition-all duration-300 group ${
                          selectedTopic === topic.id ? 'ring-2 ring-purple-400 bg-purple-800/50' : ''
                        }`}
                        onClick={() => setSelectedTopic(topic.id)}
                      >
                        <CardHeader className="text-center">
                          <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${topic.color} rounded-full flex items-center justify-center mb-4 group-hover:animate-pulse`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <CardTitle className="text-white text-lg">{topic.name}</CardTitle>
                          <CardDescription className="text-purple-200">
                            {topic.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleStartReading}
                  disabled={!selectedTopic || isReading || (selectedPlan === 'free' && !canUseFree)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-12 py-4 rounded-full text-xl animate-glow transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  {isReading ? 'Đang Bói...' : 
                   selectedPlan === 'premium' && !isPremium ? 'Nâng Cấp & Bắt Đầu' : 
                   'Bắt Đầu Bói Bài'}
                </Button>
                
                {!selectedTopic && (
                  <p className="text-purple-300 mt-4 text-sm">
                    Vui lòng chọn chủ đề để tiếp tục
                  </p>
                )}
                
                {selectedPlan === 'free' && !canUseFree && (
                  <p className="text-red-300 mt-4 text-sm">
                    Bạn đã hết lượt bói miễn phí hôm nay. Hãy thử gói Premium!
                  </p>
                )}
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TarotReading;
