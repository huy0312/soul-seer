import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, RotateCcw, Star, Heart, Eye, Crown, Gift } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TarotCard from '@/components/TarotCard';
import { getRandomCards, getTopicSpecificInterpretation, TarotCardData, getAllCards } from '@/data/tarotData';

const TarotResult = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'free';
  const topic = searchParams.get('topic');
  const cardBack = searchParams.get('cardBack');
  
  const [cards, setCards] = useState<TarotCardData[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCardSelection, setShowCardSelection] = useState(false);
  const [allCards, setAllCards] = useState<TarotCardData[]>([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);

  // Card back mapping - each selection corresponds to specific image
  const cardBackMapping: Record<string, string> = {
    'mystical': "/lovable-uploads/abaade9c-fb7d-41b1-9d08-e0e58a6748ce.png", // Huyền Bí → Lunar Veil
    'celestial': "/lovable-uploads/5b8a4aad-301c-491c-9474-ebbce98faf73.png", // Thiên Thể → Cosmic Whispers
    'classic': "/lovable-uploads/6eca27cb-b928-4990-8a08-e98c20ce32df.png"   // Cổ Điển → Arcana Pulse
  };

  const getCardBackImage = () => {
    return cardBackMapping[cardBack || 'classic'] || cardBackMapping['classic'];
  };

  const topicNames: Record<string, string> = {
    'love': 'Tình Yêu & Tình Cảm',
    'career': 'Sự Nghiệp & Công Việc',
    'money': 'Tài Chính & Tiền Bạc',
    'family': 'Gia Đình & Người Thân',
    'general': 'Tổng Quan Cuộc Sống'
  };

  const cardBackNames: Record<string, string> = {
    'mystical': 'Huyền Bí 🌙',
    'celestial': 'Thiên Thể ⭐',
    'classic': 'Cổ Điển 🔮',
    'default': 'Mặc Định'
  };

  const cardPositions = ['Quá Khứ', 'Hiện Tại', 'Tương Lai'];
  const cardMeanings: Record<string, string> = {
    'Quá Khứ': 'Những ảnh hưởng và kinh nghiệm từ quá khứ đã định hình tình huống hiện tại của bạn',
    'Hiện Tại': 'Tình trạng hiện tại và những thách thức hoặc cơ hội bạn đang đối mặt',
    'Tương Lai': 'Những khả năng và hướng phát triển có thể xảy ra nếu bạn tiếp tục con đường hiện tại'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (plan === 'premium') {
        // For premium, show card selection interface
        const allAvailableCards = getAllCards();
        setAllCards(allAvailableCards);
        setShowCardSelection(true);
        setIsLoading(false);
      } else {
        // For free, auto-select cards
        const selectedCards = getRandomCards(3);
        setCards(selectedCards);
        setRevealedCards(new Array(selectedCards.length).fill(false));
        setIsLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [plan]);

  const handleCardSelect = (cardIndex: number) => {
    if (selectedCardIndices.length < 3 && !selectedCardIndices.includes(cardIndex)) {
      setSelectedCardIndices(prev => [...prev, cardIndex]);
    }
  };

  const handleConfirmSelection = () => {
    const selectedCards = selectedCardIndices.map(index => allCards[index]);
    setCards(selectedCards);
    setRevealedCards(new Array(selectedCards.length).fill(false));
    setShowCardSelection(false);
  };

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
    setShowCardSelection(false);
    setSelectedCardIndices([]);
    
    setTimeout(() => {
      if (plan === 'premium') {
        setShowCardSelection(true);
        setIsLoading(false);
      } else {
        const selectedCards = getRandomCards(3);
        setCards(selectedCards);
        setRevealedCards(new Array(selectedCards.length).fill(false));
        setIsLoading(false);
      }
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

  if (!topic) {
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
                src="/lovable-uploads/Logo.png" 
                alt="Soulseer Logo" 
                className="w-16 h-16 mx-auto animate-glow"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {plan === 'premium' ? 'Premium ' : ''}Kết Quả Bói Bài
              </span>
            </h1>
            
            <div className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <p className="flex items-center">
                  {plan === 'premium' ? <Crown className="w-5 h-5 mr-2 text-amber-400" /> : <Gift className="w-5 h-5 mr-2 text-blue-400" />}
                  Gói: <span className="text-white font-semibold ml-1">
                    {plan === 'premium' ? 'Premium' : 'Miễn Phí'}
                  </span>
                </p>
                <p>Chủ đề: <span className="text-white font-semibold">{topicNames[topic]}</span></p>
                {plan === 'premium' && cardBack && cardBack !== 'default' && (
                  <p>Mặt lưng: <span className="text-white font-semibold">{cardBackNames[cardBack]}</span></p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Loading Section */}
        {isLoading && (
          <section className="py-16 bg-gradient-to-b from-purple-900 to-black">
            <div className="container mx-auto px-4 text-center">
              <div className="animate-spin text-6xl mb-8">🔮</div>
              <h2 className="text-2xl font-bold text-glow mb-4">
                {plan === 'premium' ? 'Chuẩn bị 78 lá bài Smith-Waite...' : 'Đang kết nối với vũ trụ...'}
              </h2>
              <p className="text-purple-200">
                {plan === 'premium' ? 'Bạn sẽ được chọn 3 lá từ bộ bài đầy đủ' : 'Các lá bài đang được chọn dành riêng cho bạn'}
              </p>
            </div>
          </section>
        )}

        {/* Card Selection for Premium */}
        {showCardSelection && plan === 'premium' && (
          <section className="py-16 bg-gradient-to-b from-purple-900 to-black">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8 text-glow">
                <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">
                  Chọn 3 Lá Bài Từ 78 Lá Smith-Waite
                </span>
              </h2>
              
              <div className="text-center mb-8">
                <p className="text-purple-200 mb-4">
                  Đã chọn: <span className="text-white font-bold">{selectedCardIndices.length}/3</span> lá bài
                </p>
                {selectedCardIndices.length === 3 && (
                  <Button
                    onClick={handleConfirmSelection}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold px-8 py-3 rounded-full"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Xác Nhận Lựa Chọn
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 max-w-7xl mx-auto">
                {allCards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedCardIndices.includes(index)
                        ? 'ring-4 ring-amber-400 scale-110 z-10'
                        : ''
                    } ${selectedCardIndices.length >= 3 && !selectedCardIndices.includes(index) ? 'opacity-50' : ''}`}
                    onClick={() => handleCardSelect(index)}
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg border-2 border-purple-400/30">
                      <img 
                        src={getCardBackImage()}
                        alt="Card Back"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedCardIndices.includes(index) && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-20 shadow-lg">
                        {selectedCardIndices.indexOf(index) + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cards Section */}
        {!isLoading && !showCardSelection && (
          <section className="py-16 bg-gradient-to-b from-purple-900 to-black">
            <div className="container mx-auto px-4">
              
              {/* Reading Guide */}
              <Card className="mystic-card mb-12 max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-center">
                    <Eye className="w-6 h-6 mr-2" />
                    Cách Đọc Bài Tarot Smith-Waite
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
                  {plan === 'premium' ? 'Ba Lá Bài Bạn Đã Chọn' : 'Ba Lá Bài Của Bạn'}
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
                        <h4 className="text-purple-300 font-semibold mb-2">Lời khuyên từ Soul Seer:</h4>
                        <p className="text-purple-100">
                          Bộ bài Smith-Waite đã mang đến những thông điệp quý giá cho bạn. 
                          Hãy sử dụng những hiểu biết này như một la bàn để định hướng cuộc sống. 
                          Nhớ rằng, tương lai luôn nằm trong tay bạn và những quyết định hôm nay sẽ tạo nên ngày mai tươi sáng.
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
                        Chọn Gói Khác
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
