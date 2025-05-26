
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, RotateCcw, Star, Heart, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TarotCard from '@/components/TarotCard';
import { getRandomCards, getTopicSpecificInterpretation, TarotCardData } from '@/data/tarotData';

const TarotResult = () => {
  const [searchParams] = useSearchParams();
  const deck = searchParams.get('deck');
  const topic = searchParams.get('topic');
  
  const [cards, setCards] = useState<TarotCardData[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const topicNames: Record<string, string> = {
    'love': 'Tình Yêu & Tình Cảm',
    'career': 'Sự Nghiệp & Công Việc',
    'money': 'Tài Chính & Tiền Bạc',
    'family': 'Gia Đình & Người Thân',
    'general': 'Tổng Quan Cuộc Sống'
  };

  const deckNames: Record<string, string> = {
    'classic': 'Bộ Bài Tarot Cổ Điển',
    'rider-waite': 'Rider-Waite Tarot',
    'mystical': 'Bộ Bài Huyền Bí'
  };

  const cardPositions = ['Quá Khứ', 'Hiện Tại', 'Tương Lai'];
  const cardMeanings: Record<string, string> = {
    'Quá Khứ': 'Những ảnh hưởng và kinh nghiệm từ quá khứ đã định hình tình huống hiện tại của bạn',
    'Hiện Tại': 'Tình trạng hiện tại và những thách thức hoặc cơ hội bạn đang đối mặt',
    'Tương Lai': 'Những khả năng và hướng phát triển có thể xảy ra nếu bạn tiếp tục con đường hiện tại'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const selectedCards = getRandomCards(3);
      setCards(selectedCards);
      setRevealedCards(new Array(selectedCards.length).fill(false));
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleRevealCard = (index: number) => {
    setRevealedCards(prev => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });
  };

  const handleNewReading = () => {
    setIsLoading(true);
    setRevealedCards([]);
    
    setTimeout(() => {
      const selectedCards = getRandomCards(3);
      setCards(selectedCards);
      setRevealedCards(new Array(selectedCards.length).fill(false));
      setIsLoading(false);
    }, 1500);
  };

  const getOverallReading = () => {
    if (!topic || cards.length === 0) return '';
    
    const readings: Record<string, string> = {
      'love': 'Trong tình yêu, hành trình của bạn từ quá khứ đến tương lai cho thấy sự trưởng thành và phát triển. Hãy học hỏi từ những trải nghiệm đã qua, trân trọng hiện tại và mở lòng đón nhận những điều tốt đẹp sắp tới.',
      'career': 'Con đường sự nghiệp của bạn đang trong giai đoạn chuyển đổi quan trọng. Những kinh nghiệm quý báu từ quá khứ sẽ là nền tảng cho thành công trong tương lai. Hãy kiên nhẫn và tin tưởng vào khả năng của bản thân.',
      'money': 'Về mặt tài chính, bạn đang học cách quản lý và phát triển tài sản một cách khôn ngoan. Quá khứ đã dạy bạn những bài học quý giá, hãy áp dụng chúng để tạo nên sự thịnh vượng bền vững.',
      'family': 'Mối quan hệ gia đình của bạn đang trải qua những thay đổi tích cực. Sự hiểu biết và tình yêu thương sẽ giúp hàn gắn những tổn thương trong quá khứ và xây dựng tương lai hạnh phúc hơn.',
      'general': 'Cuộc sống của bạn đang trong hành trình tự khám phá và phát triển bản thân. Mỗi giai đoạn đều mang lại những bài học quý báu, giúp bạn trở thành phiên bản tốt nhất của chính mình.'
    };
    
    return readings[topic] || readings['general'];
  };

  if (!deck || !topic) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lỗi: Thiếu thông tin</h1>
          <Link to="/tarot-reading">
            <Button>Quay lại chọn bài</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 hero-gradient relative overflow-hidden">
          <div className="stars"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <Link to="/tarot-reading" className="inline-flex items-center text-purple-300 hover:text-purple-100 mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại chọn bài
            </Link>
            
            <div className="mb-6">
              <img 
                src="/lovable-uploads/f06dd398-3fe1-400c-b402-f4b361db1465.png" 
                alt="Soulseer Logo" 
                className="w-16 h-16 mx-auto animate-glow"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Kết Quả Bói Bài
              </span>
            </h1>
            
            <div className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              <p className="mb-2">Bộ bài: <span className="text-white font-semibold">{deckNames[deck]}</span></p>
              <p>Chủ đề: <span className="text-white font-semibold">{topicNames[topic]}</span></p>
            </div>
          </div>
        </section>

        {/* Loading Section */}
        {isLoading && (
          <section className="py-16 bg-gradient-to-b from-purple-900 to-black">
            <div className="container mx-auto px-4 text-center">
              <div className="animate-spin text-6xl mb-8">🔮</div>
              <h2 className="text-2xl font-bold text-glow mb-4">
                Đang kết nối với vũ trụ...
              </h2>
              <p className="text-purple-200">Các lá bài đang được chọn dành riêng cho bạn</p>
            </div>
          </section>
        )}

        {/* Cards Section */}
        {!isLoading && (
          <section className="py-16 bg-gradient-to-b from-purple-900 to-black">
            <div className="container mx-auto px-4">
              
              {/* Reading Guide */}
              <Card className="mystic-card mb-12 max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-center">
                    <Eye className="w-6 h-6 mr-2" />
                    Cách Đọc Bài Tarot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {cardPositions.map((position, index) => (
                      <div key={position} className="space-y-2">
                        <h3 className="text-lg font-semibold text-purple-300">{position}</h3>
                        <p className="text-purple-100 text-sm">{cardMeanings[position]}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <h2 className="text-3xl font-bold text-center mb-12 text-glow">
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Ba Lá Bài Của Bạn
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                {cards.map((card, index) => (
                  <div key={card.id} className="text-center">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                      {cardPositions[index]}
                    </h3>
                    <p className="text-sm text-purple-200 mb-4 px-2">
                      {cardMeanings[cardPositions[index]]}
                    </p>
                    <TarotCard
                      card={card}
                      interpretation={getTopicSpecificInterpretation(card, topic)}
                      isRevealed={revealedCards[index]}
                      onReveal={() => handleRevealCard(index)}
                    />
                  </div>
                ))}
              </div>

              {/* Detailed Analysis */}
              {revealedCards.every(revealed => revealed) && (
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Individual Card Analysis */}
                  <Card className="mystic-card">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Star className="w-6 h-6 mr-2" />
                        Phân Tích Chi Tiết Từng Lá Bài
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {cards.map((card, index) => (
                        <div key={card.id} className="border-l-4 border-purple-400 pl-4">
                          <h4 className="text-lg font-semibold text-purple-300 mb-2">
                            {cardPositions[index]}: {card.name}
                          </h4>
                          <p className="text-purple-100 mb-3">
                            {getTopicSpecificInterpretation(card, topic)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {card.keywords.map((keyword) => (
                              <span 
                                key={keyword}
                                className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 px-2 py-1 rounded-full text-xs border border-purple-400/20"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Overall Summary */}
                  <Card className="mystic-card">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Heart className="w-6 h-6 mr-2" />
                        Tổng Kết & Lời Khuyên
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-100 text-lg leading-relaxed mb-6">
                        {getOverallReading()}
                      </p>
                      <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 p-4 rounded-lg border border-purple-400/20">
                        <h4 className="text-purple-300 font-semibold mb-2">Lời khuyên từ Soulseer:</h4>
                        <p className="text-purple-100">
                          Nhớ rằng, các lá bài Tarot chỉ là công cụ để phản ánh năng lượng hiện tại và những khả năng có thể xảy ra. 
                          Tương lai luôn nằm trong tay bạn, và những quyết định bạn đưa ra hôm nay sẽ tạo nên ngày mai. 
                          Hãy sử dụng những thông điệp này như một nguồn cảm hứng để tạo ra cuộc sống mà bạn mong muốn.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleNewReading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-full animate-glow"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Bói Lại
                    </Button>
                    
                    <Link to="/tarot-reading">
                      <Button
                        variant="outline"
                        className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 rounded-full"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Chọn Chủ Đề Khác
                      </Button>
                    </Link>

                    <Link to="/ai-reading">
                      <Button
                        variant="outline"
                        className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white px-8 py-3 rounded-full"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Hỏi AI Thêm
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TarotResult;
