
import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('canplaythrough', () => setIsLoaded(true));
      audio.addEventListener('error', () => {
        console.log('Audio file not found, using alternative source');
        setIsLoaded(false);
      });
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current && isLoaded) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {/* Multiple source formats for better browser compatibility */}
        <source src="/ambient-music.mp3" type="audio/mpeg" />
        <source src="/ambient-music.ogg" type="audio/ogg" />
        <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
      </audio>

      {/* Music Control Button */}
      {isLoaded && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleMusic}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700/90 border-purple-400/50 backdrop-blur-sm transition-all duration-300 hover:scale-110"
            title={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
          >
            {isPlaying ? (
              <Volume2 className="h-5 w-5 text-purple-300" />
            ) : (
              <VolumeX className="h-5 w-5 text-slate-400" />
            )}
          </Button>
        </div>
      )}

      {/* Music indicator when playing */}
      {isPlaying && (
        <div className="fixed bottom-20 right-6 z-40">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-purple-300 border border-purple-400/30">
            ♪ Nhạc nền
          </div>
        </div>
      )}
    </>
  );
};

export default BackgroundMusic;
