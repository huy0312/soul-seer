
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TarotCardData } from '@/data/tarotData';

interface TarotCardProps {
  card: TarotCardData;
  interpretation: string;
  isRevealed: boolean;
  onReveal: () => void;
}

const TarotCard = ({ card, interpretation, isRevealed, onReveal }: TarotCardProps) => {
  return (
    <div className="perspective-1000">
      <Card 
        className={`mystic-card cursor-pointer transition-all duration-700 transform-style-preserve-3d ${
          isRevealed ? 'rotate-y-0' : 'rotate-y-180'
        } max-w-sm mx-auto h-96 relative`}
        onClick={!isRevealed ? onReveal : undefined}
      >
        {/* Card Back */}
        <div className={`absolute inset-0 backface-hidden ${isRevealed ? 'rotate-y-180' : 'rotate-y-0'}`}>
          <CardHeader className="text-center h-full flex flex-col justify-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800 rounded-full flex items-center justify-center border-4 border-gold animate-pulse shadow-2xl">
                <img 
                  src="/lovable-uploads/f06dd398-3fe1-400c-b402-f4b361db1465.png" 
                  alt="Soulseer Logo" 
                  className="w-20 h-20 animate-glow"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-spin-slow"></div>
            </div>
            <CardTitle className="text-white text-lg mb-2">Nhấp để lật bài</CardTitle>
            <CardDescription className="text-purple-200">
              Khám phá thông điệp dành cho bạn
            </CardDescription>
          </CardHeader>
        </div>

        {/* Card Front */}
        <div className={`absolute inset-0 backface-hidden ${isRevealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
          <CardHeader className="text-center">
            <div className="relative mb-4">
              <div className="w-24 h-32 mx-auto bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 rounded-lg flex items-center justify-center text-4xl font-bold text-purple-900 shadow-2xl border-2 border-yellow-400">
                {card.image}
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-500 rounded-full animate-pulse delay-1000"></div>
            </div>
            <CardTitle className="text-white text-lg transform rotate-0">{card.name}</CardTitle>
            <CardDescription className="text-purple-200 transform rotate-0">
              {card.meaning}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-purple-100 mb-4 text-sm leading-relaxed transform rotate-0">{interpretation}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {card.keywords.map((keyword) => (
                <span 
                  key={keyword}
                  className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 px-2 py-1 rounded-full text-xs border border-purple-400/20 backdrop-blur-sm transform rotate-0"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default TarotCard;
