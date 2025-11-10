import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, SkipForward } from 'lucide-react';

interface VideoIntroProps {
  videoUrl: string;
  onComplete: () => void;
  onSkip?: () => void;
  title?: string;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({
  videoUrl,
  onComplete,
  onSkip,
  title = 'Phần 1 - Khởi động',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Show skip button after 3 seconds
    skipTimeoutRef.current = setTimeout(() => {
      setShowSkip(true);
    }, 3000);

    return () => {
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
      }
    };
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onComplete();
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  // Check if video URL is YouTube or Vimeo
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
  };

  // Extract Vimeo video ID
  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
    return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2">{title}</h2>
          <p className="text-xl text-blue-200">Video giới thiệu</p>
        </div>

        {/* Video Container */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isYouTube ? (
                <iframe
                  src={getYouTubeEmbedUrl(videoUrl)}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  onLoad={() => setIsPlaying(true)}
                />
              ) : isVimeo ? (
                <iframe
                  src={getVimeoEmbedUrl(videoUrl)}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  onLoad={() => setIsPlaying(true)}
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onEnded={handleVideoEnd}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Button
                        onClick={handlePlay}
                        size="lg"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Play className="h-6 w-6 mr-2" />
                        Phát video
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip Button */}
        {showSkip && onSkip && (
          <div className="text-center">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              size="lg"
            >
              <SkipForward className="h-5 w-5 mr-2" />
              Bỏ qua video
            </Button>
          </div>
        )}

        {/* Auto-complete for YouTube/Vimeo after video ends */}
        {(isYouTube || isVimeo) && (
          <div className="text-center">
            <p className="text-blue-200 text-sm mb-4">
              Video sẽ tự động chuyển sang phần thi khi kết thúc
            </p>
            <Button
              onClick={handleSkip}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Bỏ qua và bắt đầu ngay
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

