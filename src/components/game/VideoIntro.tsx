import { useEffect, useRef } from 'react';

interface VideoIntroProps {
  videoUrl: string;
  onComplete: () => void;
  title?: string;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({
  videoUrl,
  onComplete,
  title = 'Phần 1 - Khởi động',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&controls=0&modestbranding=1&playsinline=1&enablejsapi=1&loop=0&mute=0` : '';
  };

  // Extract Vimeo video ID
  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
    return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1&controls=0&background=0&loop=0` : '';
  };

  useEffect(() => {
    // For direct video files, auto-play and handle end
    if (!isYouTube && !isVimeo && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Error playing video:', error);
        // If autoplay fails, still complete after a delay
        setTimeout(() => {
          onComplete();
        }, 1000);
      });
    }

    // For YouTube/Vimeo, listen for postMessage events to detect when video ends
    if (isYouTube || isVimeo) {
      const handleMessage = (event: MessageEvent) => {
        // YouTube sends messages when video state changes
        // event.data can be a string like "onStateChange" or an object
        if (typeof event.data === 'string') {
          // YouTube IFrame API sends string messages
          if (event.data.includes('onStateChange')) {
            // Extract state from message
            const stateMatch = event.data.match(/state=(\d+)/);
            if (stateMatch) {
              const state = parseInt(stateMatch[1]);
              // State 0 = ended
              if (state === 0) {
                onComplete();
              }
            }
          }
        } else if (typeof event.data === 'object' && event.data !== null) {
          // Vimeo sends object messages
          if (event.data.event === 'ended' || event.data.event === 'finish') {
            onComplete();
          }
          // YouTube also sends object messages sometimes
          if (event.data.event === 'onStateChange' && event.data.info?.playerState === 0) {
            onComplete();
          }
        }
      };

      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [isYouTube, isVimeo, onComplete]);

  const handleVideoEnd = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Full screen video container - no controls, no buttons */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isYouTube ? (
          <iframe
            ref={iframeRef}
            src={getYouTubeEmbedUrl(videoUrl)}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 'none' }}
          />
        ) : isVimeo ? (
          <iframe
            ref={iframeRef}
            src={getVimeoEmbedUrl(videoUrl)}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ border: 'none' }}
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            muted={false}
            controls={false}
            onEnded={handleVideoEnd}
            onError={() => {
              // If video fails to load, complete after short delay
              setTimeout(() => {
                onComplete();
              }, 2000);
            }}
          />
        )}
      </div>
    </div>
  );
};

