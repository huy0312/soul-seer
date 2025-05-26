
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
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

  useEffect(() => {
    // Simulate loading time for mystical effect
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
              <h2 className="text-3xl font-bold text-center mb-12 text-glow">
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Ba Lá Bài Của Bạn
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                {cards.map((card, index) => (
                  <div key={card.id} className="text-center">
                    <h3 className="text-lg font-semibold text-purple-300 mb-4">
                      {index === 0 ? 'Quá Khứ' : index === 1 ? 'Hiện Tại' : 'Tương Lai'}
                    </h3>
                    <TarotCard
                      card={card}
                      interpretation={getTopicSpecificInterpretation(card, topic)}
                      isRevealed={revealedCards[index]}
                      onReveal={() => handleRevealCard(index)}
                    />
                  </div>
                ))}
              </div>

              {/* Summary Section */}
              {revealedCards.every(revealed => revealed) && (
                <div className="max-w-4xl mx-auto text-center">
                  <div className="mystic-card p-8 mb-8">
                    <h3 className="text-2xl font-bold text-glow mb-6">
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                        Tổng Kết
                      </span>
                    </h3>
                    <p className="text-purple-100 text-lg leading-relaxed">
                      Các lá bài đã tiết lộ hành trình của bạn từ quá khứ đến tương lai. 
                      Hãy sử dụng những thông điệp này như một kim chỉ nam để điều hướng 
                      cuộc sống của mình. Nhớ rằng, tương lai luôn có thể thay đổi dựa 
                      trên những quyết định bạn đưa ra ngày hôm nay.
                    </p>
                  </div>

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
