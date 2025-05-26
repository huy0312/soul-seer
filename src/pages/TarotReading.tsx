
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Briefcase, DollarSign, Users, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const tarotDecks = [
  {
    id: 'classic',
    name: 'Bộ Bài Tarot Cổ Điển',
    description: 'Bộ bài truyền thống với 78 lá bài',
    image: '🃏'
  },
  {
    id: 'rider-waite',
    name: 'Rider-Waite Tarot',
    description: 'Bộ bài phổ biến nhất thế giới',
    image: '🌟'
  },
  {
    id: 'mystical',
    name: 'Bộ Bài Huyền Bí',
    description: 'Dành cho những câu hỏi sâu sắc',
    image: '🔮'
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
  const [selectedDeck, setSelectedDeck] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isReading, setIsReading] = useState(false);

  const handleStartReading = () => {
    if (selectedDeck && selectedTopic) {
      setIsReading(true);
      // TODO: Navigate to reading result page
      console.log('Starting reading with:', { selectedDeck, selectedTopic });
    }
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
                Bói Bài Miễn Phí
              </span>
            </h1>
            <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Khám phá tương lai với dịch vụ bói bài Tarot miễn phí. Chọn bộ bài và chủ đề để bắt đầu.
            </p>
          </div>
        </section>

        {/* Selection Section */}
        <section className="py-16 bg-gradient-to-b from-purple-900 to-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Deck Selection */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-center mb-8 text-glow">
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Chọn Bộ Bài Tarot
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tarotDecks.map((deck) => (
                    <Card 
                      key={deck.id}
                      className={`mystic-card cursor-pointer transition-all duration-300 ${
                        selectedDeck === deck.id ? 'ring-2 ring-purple-400 bg-purple-800/50' : ''
                      }`}
                      onClick={() => setSelectedDeck(deck.id)}
                    >
                      <CardHeader className="text-center">
                        <div className="text-4xl mb-4">{deck.image}</div>
                        <CardTitle className="text-white text-lg">{deck.name}</CardTitle>
                        <CardDescription className="text-purple-200">
                          {deck.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-center mb-8 text-glow">
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Chọn Chủ Đề Bói
                  </span>
                </h2>
                
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
                  disabled={!selectedDeck || !selectedTopic || isReading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-12 py-4 rounded-full text-xl animate-glow transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  {isReading ? 'Đang Bói...' : 'Bắt Đầu Bói Bài'}
                </Button>
                
                {(!selectedDeck || !selectedTopic) && (
                  <p className="text-purple-300 mt-4 text-sm">
                    Vui lòng chọn bộ bài và chủ đề để tiếp tục
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
