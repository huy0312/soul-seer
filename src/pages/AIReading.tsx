
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Sparkles, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface AIResponse {
  question: string;
  answer: string;
  timestamp: Date;
}

const AIReading = () => {
  const [question, setQuestion] = useState('');
  // Using your actual Gemini API key
  const apiKey = 'AIzaSyB4DnZgHiY8nVMjwvVsn51_gN0ZCNB0-u8';
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Tôi là Soul Seer, một người có khả năng cảm nhận và hiểu được năng lượng xung quanh. Tôi sẽ chia sẻ những gì tôi cảm nhận được và đưa ra lời khuyên chân thành cho bạn. Tôi luôn cố gắng mang đến những lời khuyên tích cực và thiết thực. Hãy để tôi giúp bạn tìm hiểu về tình huống hiện tại và những gì có thể xảy ra trong tương lai. Tôi sẽ trả lời bằng tiếng Việt một cách ấm áp và gần gũi.\n\nCâu hỏi của bạn: ${question}`
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
        timestamp: new Date()
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
                src="/lovable-uploads/f2a0fcc4-ee53-4dbf-b3ac-219dcb1f6745.png" 
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
            
            {/* Question Form */}
            <Card className="mystic-card mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Hỏi Soul Seer AI
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Đặt câu hỏi về tình yêu, sự nghiệp, tương lai, hoặc bất kỳ điều gì bạn quan tâm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Ví dụ: Tôi nên làm gì để cải thiện mối quan hệ hiện tại? Sự nghiệp của tôi sẽ ra sao trong năm tới?"
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
                        Soul Seer AI đang suy nghĩ...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Gửi câu hỏi
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
                      </CardTitle>
                      <p className="text-purple-100">{response.question}</p>
                    </CardHeader>
                    <CardContent>
                      <h4 className="text-pink-300 font-semibold mb-3 flex items-center">
                        <Bot className="w-5 h-5 mr-2" />
                        Lời khuyên từ Soul Seer AI:
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
                    {[
                      "Tình yêu của tôi sẽ như thế nào trong năm tới?",
                      "Tôi có nên thay đổi công việc hiện tại không?",
                      "Làm sao để cải thiện mối quan hệ với gia đình?",
                      "Con đường nào phù hợp nhất với tôi?",
                      "Tôi nên đầu tư vào lĩnh vực gì?",
                      "Làm thế nào để vượt qua khó khăn hiện tại?"
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
