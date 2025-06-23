
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Sparkles, Star, Wand2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getRandomCards, TarotCardData } from '@/data/tarotData';

interface AIResponse {
  question: string;
  answer: string;
  tarotCards?: TarotCardData[];
  timestamp: Date;
  type: 'general' | 'tarot';
}

const AIReading = () => {
  const [question, setQuestion] = useState('');
  const [readingMode, setReadingMode] = useState<'general' | 'tarot'>('general');
  const apiKey = 'AIzaSyB4DnZgHiY8nVMjwvVsn51_gN0ZCNB0-u8';
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    
    try {
      let prompt = '';
      let selectedCards: TarotCardData[] = [];

      if (readingMode === 'tarot') {
        selectedCards = getRandomCards(3);
        const cardDescriptions = selectedCards.map((card, index) => 
          `Lá ${index + 1} (${['Quá khứ', 'Hiện tại', 'Tương lai'][index]}): ${card.name} - ${card.meaning}. Từ khóa: ${card.keywords.join(', ')}`
        ).join('\n');

        prompt = `Tôi là Soul Seer, một thầy bói Tarot có kinh nghiệm. Tôi đã rút 3 lá bài Smith-Waite cho câu hỏi của bạn:

${cardDescriptions}

Câu hỏi: "${question}"

Tôi sẽ giải thích ý nghĩa của từng lá bài và liên kết chúng với câu hỏi của bạn. Tôi sẽ phân tích cách 3 lá bài này tương tác với nhau để đưa ra lời khuyên tổng thể. Trả lời bằng tiếng Việt một cách ấm áp và chi tiết.`;
      } else {
        prompt = `Tôi là Soul Seer, một người có khả năng cảm nhận và hiểu được năng lượng xung quanh. Tôi sẽ chia sẻ những gì tôi cảm nhận được và đưa ra lời khuyên chân thành cho bạn. Tôi luôn cố gắng mang đến những lời khuyên tích cực và thiết thực. Hãy để tôi giúp bạn tìm hiểu về tình huống hiện tại và những gì có thể xảy ra trong tương lai. Tôi sẽ trả lời bằng tiếng Việt một cách ấm áp và gần gũi.

Câu hỏi của bạn: ${question}`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get AI response');
      }

      const data = await response.json();
      const aiAnswer = data.candidates[0].content.parts[0].text;

      const newResponse: AIResponse = {
        question,
        answer: aiAnswer,
        tarotCards: readingMode === 'tarot' ? selectedCards : undefined,
        timestamp: new Date(),
        type: readingMode
      };

      setResponses(prev => [newResponse, ...prev]);
      setQuestion('');
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi kết nối với Soul Seer AI. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
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
            <div className="mb-8">
              <img 
                src="/lovable-uploads/Logo.png" 
                alt="Soul Seer Logo" 
                className="w-16 h-16 mx-auto animate-glow rounded-full"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                SOUL SEER AI
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Trò chuyện trực tiếp với Soul Seer AI để nhận được lời khuyên và dự đoán cá nhân hóa về cuộc sống của bạn.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-gradient-to-b from-purple-900 to-black">
          <div className="container mx-auto px-4 max-w-4xl">
            
            {/* Mode Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-center mb-4 text-white">Chọn Chế Độ Tư Vấn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card 
                  className={`mystic-card cursor-pointer transition-all duration-300 ${
                    readingMode === 'general' ? 'ring-2 ring-purple-400 bg-purple-800/50' : ''
                  }`}
                  onClick={() => setReadingMode('general')}
                >
                  <CardHeader className="text-center pb-3">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <CardTitle className="text-white text-lg">Tư Vấn Tổng Quát</CardTitle>
                    <CardDescription className="text-purple-200 text-sm">
                      AI phân tích và đưa ra lời khuyên dựa trên năng lượng
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card 
                  className={`mystic-card cursor-pointer transition-all duration-300 ${
                    readingMode === 'tarot' ? 'ring-2 ring-pink-400 bg-pink-800/50' : ''
                  }`}
                  onClick={() => setReadingMode('tarot')}
                >
                  <CardHeader className="text-center pb-3">
                    <Wand2 className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                    <CardTitle className="text-white text-lg">Bói Bài Tarot AI</CardTitle>
                    <CardDescription className="text-purple-200 text-sm">
                      AI rút 3 lá bài Smith-Waite và giải nghĩa
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Question Form */}
            <Card className="mystic-card mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {readingMode === 'tarot' ? <Wand2 className="w-6 h-6 mr-2" /> : <Sparkles className="w-6 h-6 mr-2" />}
                  {readingMode === 'tarot' ? 'Hỏi Soul Seer AI + Tarot' : 'Hỏi Soul Seer AI'}
                </CardTitle>
                <CardDescription className="text-purple-200">
                  {readingMode === 'tarot' 
                    ? 'Đặt câu hỏi và AI sẽ rút 3 lá bài Smith-Waite để trả lời bạn'
                    : 'Đặt câu hỏi về tình yêu, sự nghiệp, tương lai, hoặc bất kỳ điều gì bạn quan tâm'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder={
                      readingMode === 'tarot' 
                        ? "Ví dụ: Tình yêu của tôi sẽ như thế nào? Tôi có nên thay đổi công việc không?"
                        : "Ví dụ: Tôi nên làm gì để cải thiện mối quan hệ hiện tại? Sự nghiệp của tôi sẽ ra sao trong năm tới?"
                    }
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="bg-purple-900/50 border-purple-400 text-white placeholder-purple-300 min-h-24"
                    rows={4}
                  />
                  <Button
                    type="submit"
                    disabled={!question.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-full w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        {readingMode === 'tarot' ? 'AI đang rút bài...' : 'Soul Seer AI đang suy nghĩ...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {readingMode === 'tarot' ? 'Rút Bài & Hỏi' : 'Gửi câu hỏi'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Responses */}
            {responses.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-glow">
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Lời Khuyên Từ Soul Seer AI
                  </span>
                </h2>
                
                {responses.map((response, index) => (
                  <Card key={index} className="mystic-card">
                    <CardHeader>
                      <CardTitle className="text-purple-300 flex items-center text-lg">
                        <Star className="w-5 h-5 mr-2" />
                        Câu hỏi của bạn
                        {response.type === 'tarot' && (
                          <span className="ml-2 px-2 py-1 bg-pink-600/30 rounded-full text-xs border border-pink-400/30">
                            + Tarot
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-purple-100">{response.question}</p>
                    </CardHeader>
                    <CardContent>
                      {/* Show Tarot Cards if this is a tarot reading */}
                      {response.tarotCards && (
                        <div className="mb-6">
                          <h4 className="text-pink-300 font-semibold mb-3 flex items-center">
                            <Wand2 className="w-5 h-5 mr-2" />
                            3 Lá Bài Smith-Waite Được Chọn:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {response.tarotCards.map((card, cardIndex) => (
                              <div key={card.id} className="text-center">
                                <div className="bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 rounded-lg w-16 h-24 mx-auto mb-2 flex items-center justify-center text-2xl font-bold text-purple-900 shadow-lg border-2 border-yellow-400">
                                  {card.image}
                                </div>
                                <h5 className="text-purple-200 font-semibold text-sm">{card.name}</h5>
                                <p className="text-purple-300 text-xs">
                                  {['Quá Khứ', 'Hiện Tại', 'Tương Lai'][cardIndex]}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <h4 className="text-pink-300 font-semibold mb-3 flex items-center">
                        <Bot className="w-5 h-5 mr-2" />
                        {response.type === 'tarot' ? 'Giải nghĩa Tarot từ Soul Seer AI:' : 'Lời khuyên từ Soul Seer AI:'}
                      </h4>
                      <div className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                        {response.answer}
                      </div>
                      <p className="text-purple-400 text-sm mt-4">
                        {response.timestamp.toLocaleString('vi-VN')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Sample Questions */}
            {responses.length === 0 && (
              <Card className="mystic-card">
                <CardHeader>
                  <CardTitle className="text-white">Gợi ý câu hỏi</CardTitle>
                  <CardDescription className="text-purple-200">
                    Một số câu hỏi mẫu bạn có thể hỏi Soul Seer AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {readingMode === 'tarot' ? [
                      "Tình yêu của tôi sẽ như thế nào trong 3 tháng tới?",
                      "Tôi có nên thay đổi công việc hiện tại không?",
                      "Điều gì đang cản trở sự phát triển của tôi?",
                      "Làm sao để cải thiện mối quan hệ với người yêu?",
                      "Con đường nào sẽ mang lại thành công cho tôi?",
                      "Tôi cần chuẩn bị gì cho tương lai?"
                    ] : [
                      "Tình yêu của tôi sẽ như thế nào trong năm tới?",
                      "Tôi có nên đầu tư vào dự án này không?",
                      "Làm sao để vượt qua khó khăn hiện tại?",
                      "Con đường nào phù hợp nhất với tôi?",
                      "Làm thế nào để cải thiện mối quan hệ gia đình?",
                      "Tôi nên tập trung vào điều gì trong thời gian tới?"
                    ].map((sampleQ, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={() => setQuestion(sampleQ)}
                        className="text-left border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-white p-4 h-auto whitespace-normal"
                      >
                        {sampleQ}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AIReading;
