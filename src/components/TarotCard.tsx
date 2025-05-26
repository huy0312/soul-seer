
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
    <Card 
      className={`mystic-card cursor-pointer transition-all duration-500 transform ${
        isRevealed ? 'rotate-y-0' : 'rotate-y-180'
      } max-w-sm mx-auto`}
      onClick={!isRevealed ? onReveal : undefined}
    >
      <CardHeader className="text-center">
        {!isRevealed ? (
          <>
            <div className="text-6xl mb-4 animate-pulse">🃏</div>
            <CardTitle className="text-white text-lg">Nhấp để lật bài</CardTitle>
            <CardDescription className="text-purple-200">
              Khám phá thông điệp dành cho bạn
            </CardDescription>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-glow">{card.image}</div>
            <CardTitle className="text-white text-lg">{card.name}</CardTitle>
            <CardDescription className="text-purple-200">
              {card.meaning}
            </CardDescription>
          </>
        )}
      </CardHeader>
      
      {isRevealed && (
        <CardContent className="text-center">
          <p className="text-purple-100 mb-4">{interpretation}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {card.keywords.map((keyword) => (
              <span 
                key={keyword}
                className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded-full text-xs"
              >
                {keyword}
              </span>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TarotCard;
