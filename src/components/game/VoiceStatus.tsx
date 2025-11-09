import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Users, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

interface VoiceStatusProps {
  gameId: string;
  currentPlayerId: string;
  players: Player[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
}

interface PlayerVoiceStatus {
  playerId: string;
  playerName: string;
  isMicOn: boolean;
  volume: number;
  frequency: number[];
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({
  gameId,
  currentPlayerId,
  players,
  localStream,
  remoteStreams,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceStatuses, setVoiceStatuses] = useState<Map<string, PlayerVoiceStatus>>(new Map());
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const animationFrames = useRef<Map<string, number>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRefs = useRef<Map<string, AnalyserNode>>(new Map());
  const dataArrayRefs = useRef<Map<string, Uint8Array>>(new Map());

  // Subscribe to mic status changes
  useEffect(() => {
    const channelName = `voice-status:${gameId}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'mic-status' }, (payload) => {
        const { playerId, isMicOn } = payload.payload;
        setVoiceStatuses((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(playerId) || {
            playerId,
            playerName: players.find((p) => p.id === playerId)?.name || 'Unknown',
            isMicOn: false,
            volume: 0,
            frequency: new Array(32).fill(0),
          };
          updated.set(playerId, { ...existing, isMicOn });
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, players]);

  // Initialize audio context and analysers
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    // Setup analyser for local stream
    if (localStream && audioContextRef.current) {
      const source = audioContextRef.current.createMediaStreamSource(localStream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRefs.current.set(currentPlayerId, analyser);
      dataArrayRefs.current.set(currentPlayerId, new Uint8Array(analyser.frequencyBinCount));
    }

    // Setup analysers for remote streams
    remoteStreams.forEach((stream, playerId) => {
      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRefs.current.set(playerId, analyser);
        dataArrayRefs.current.set(playerId, new Uint8Array(analyser.frequencyBinCount));
      }
    });

    return () => {
      analyserRefs.current.clear();
      dataArrayRefs.current.clear();
    };
  }, [localStream, remoteStreams, currentPlayerId]);

  // Update voice statuses and visualize
  useEffect(() => {
    if (!isOpen) return;

    const updateVisualization = () => {
      setVoiceStatuses((prev) => {
        const updated = new Map(prev);

        // Update local player
        if (localStream && analyserRefs.current.has(currentPlayerId)) {
          const analyser = analyserRefs.current.get(currentPlayerId)!;
          const dataArray = dataArrayRefs.current.get(currentPlayerId)!;
          analyser.getByteFrequencyData(dataArray);

          const volume = Math.max(...dataArray) / 255;
          const frequency = Array.from(dataArray.slice(0, 32));

          updated.set(currentPlayerId, {
            playerId: currentPlayerId,
            playerName: players.find((p) => p.id === currentPlayerId)?.name || 'You',
            isMicOn: true,
            volume,
            frequency,
          });

          drawVisualization(currentPlayerId, frequency, volume);
        }

        // Update remote players
        remoteStreams.forEach((stream, playerId) => {
          if (analyserRefs.current.has(playerId)) {
            const analyser = analyserRefs.current.get(playerId)!;
            const dataArray = dataArrayRefs.current.get(playerId)!;
            analyser.getByteFrequencyData(dataArray);

            const volume = Math.max(...dataArray) / 255;
            const frequency = Array.from(dataArray.slice(0, 32));

            updated.set(playerId, {
              playerId,
              playerName: players.find((p) => p.id === playerId)?.name || 'Unknown',
              isMicOn: true,
              volume,
              frequency,
            });

            drawVisualization(playerId, frequency, volume);
          }
        });

        return updated;
      });

      if (isOpen) {
        animationFrames.current.set('main', requestAnimationFrame(updateVisualization));
      }
    };

    if (isOpen && (localStream || remoteStreams.size > 0)) {
      animationFrames.current.set('main', requestAnimationFrame(updateVisualization));
    }

    return () => {
      animationFrames.current.forEach((frame) => cancelAnimationFrame(frame));
      animationFrames.current.clear();
    };
  }, [isOpen, localStream, remoteStreams, currentPlayerId, players]);

  const drawVisualization = (playerId: string, frequency: number[], volume: number) => {
    const canvas = canvasRefs.current.get(playerId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bars
    const barWidth = width / frequency.length;
    frequency.forEach((value, index) => {
      const barHeight = (value / 255) * height * 0.8;
      const x = index * barWidth;
      const y = height - barHeight;

      // Color based on volume
      const intensity = value / 255;
      ctx.fillStyle = `rgba(${Math.floor(100 + intensity * 155)}, ${Math.floor(200 + intensity * 55)}, 255, ${0.6 + intensity * 0.4})`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw volume indicator
    const volumeHeight = volume * height;
    ctx.fillStyle = `rgba(255, ${Math.floor(255 - volume * 255)}, 0, 0.5)`;
    ctx.fillRect(0, height - volumeHeight, width, 2);
  };

  const broadcastMicStatus = (isMicOn: boolean) => {
    const channelName = `voice-status:${gameId}`;
    const channel = supabase.channel(channelName);
    channel.send({
      type: 'broadcast',
      event: 'mic-status',
      payload: {
        playerId: currentPlayerId,
        isMicOn,
      },
    });
  };

  const allPlayers = players.filter((p) => !p.is_host);
  const playersWithMic = Array.from(voiceStatuses.values()).filter((status) => status.isMicOn);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="relative"
      >
        <Users className="h-4 w-4 mr-2" />
        Voice Status
        {playersWithMic.length > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full">
            {playersWithMic.length}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 fixed bottom-4 right-4 w-80 z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Voice Status</span>
            {playersWithMic.length > 0 && (
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                {playersWithMic.length} đang nói
              </span>
            )}
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {allPlayers.map((player) => {
              const status = voiceStatuses.get(player.id) || {
                playerId: player.id,
                playerName: player.name,
                isMicOn: false,
                volume: 0,
                frequency: new Array(32).fill(0),
              };
              const isCurrentPlayer = player.id === currentPlayerId;

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border ${
                    status.isMicOn
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {status.isMicOn ? (
                        <Mic className="h-4 w-4 text-green-400 animate-pulse" />
                      ) : (
                        <MicOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">
                        {status.playerName}
                        {isCurrentPlayer && ' (Bạn)'}
                      </span>
                    </div>
                    {status.isMicOn && (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                          style={{
                            opacity: status.volume,
                          }}
                        />
                        <span className="text-xs text-green-400">
                          {Math.round(status.volume * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {status.isMicOn && (
                    <div className="mt-2">
                      <canvas
                        ref={(el) => {
                          if (el) {
                            canvasRefs.current.set(player.id, el);
                            el.width = el.offsetWidth * 2;
                            el.height = 60;
                          }
                        }}
                        className="w-full h-[60px] rounded bg-black/20"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {allPlayers.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <MicOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có người chơi</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

