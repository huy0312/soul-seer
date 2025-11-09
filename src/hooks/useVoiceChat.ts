import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceChatConfig {
  gameId: string;
  currentPlayerId: string;
  otherPlayerIds: string[];
}

export const useVoiceChat = ({ gameId, currentPlayerId, otherPlayerIds }: VoiceChatConfig) => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Setup signaling channel
    const channelName = `voice:${gameId}`;
    channelRef.current = supabase.channel(channelName);

    // Listen for broadcast messages
    channelRef.current
      .on('broadcast', { event: 'signal' }, async (payload) => {
        const { from, to, type, data } = payload.payload;
        
        // Only process signals meant for us
        if (to !== currentPlayerId) return;

        console.log('Received signal:', type, 'from:', from);

        const peerId = from;
        let peerConnection = peerConnectionsRef.current.get(peerId);

        if (!peerConnection && type === 'offer') {
          peerConnection = createPeerConnection(peerId);
          peerConnectionsRef.current.set(peerId, peerConnection);
        } else if (!peerConnection) {
          return; // Can't handle answer/ice without existing connection
        }

        try {
          if (type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

              // Send answer back
              channelRef.current?.send({
                type: 'broadcast',
                event: 'signal',
                payload: {
                  from: currentPlayerId,
                  to: peerId,
                  type: 'answer',
                  data: answer,
                },
              });
          } else if (type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
          } else if (type === 'ice-candidate') {
            if (data) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
          }
        } catch (error) {
          console.error('Error handling signal:', error);
        }
      })
      .subscribe((status) => {
        console.log('Voice chat channel status:', status);
      });

    return () => {
      cleanup();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [gameId, currentPlayerId]);

  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      let audioElement = audioElementsRef.current.get(peerId);
      
      if (!audioElement) {
        audioElement = new Audio();
        audioElement.autoplay = true;
        audioElementsRef.current.set(peerId, audioElement);
      }
      
      audioElement.srcObject = remoteStream;
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            from: currentPlayerId,
            to: peerId,
            type: 'ice-candidate',
            data: event.candidate.toJSON(),
          },
        });
      } else if (!event.candidate) {
        console.log('ICE gathering complete for', peerId);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}:`, peerConnection.connectionState);
      setIsConnected(peerConnection.connectionState === 'connected');
    };

    return peerConnection;
  };

  const startVoiceChat = async () => {
    try {
      // Get user media with better audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });
      
      // Check if stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks in stream');
      }
      
      console.log('Audio stream obtained:', {
        trackCount: audioTracks.length,
        trackLabel: audioTracks[0].label,
        trackEnabled: audioTracks[0].enabled,
        trackReadyState: audioTracks[0].readyState,
      });
      
      localStreamRef.current = stream;
      setIsMicOn(true);

      // Create peer connections for all other players
      for (const peerId of otherPlayerIds) {
        if (peerId === currentPlayerId) continue;

        const peerConnection = createPeerConnection(peerId);
        peerConnectionsRef.current.set(peerId, peerConnection);

        // Create and send offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'signal',
            payload: {
              from: currentPlayerId,
              to: peerId,
              type: 'offer',
              data: offer.toJSON(),
            },
          });
        }
      }
    } catch (error) {
      console.error('Error starting voice chat:', error);
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
      setIsMicOn(false);
    }
  };

  const stopVoiceChat = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current.clear();

    // Remove all audio elements
    audioElementsRef.current.forEach((audio) => {
      audio.srcObject = null;
    });
    audioElementsRef.current.clear();

    setIsMicOn(false);
    setIsConnected(false);
  };

  const cleanup = () => {
    stopVoiceChat();
  };

  const toggleMic = async () => {
    if (isMicOn) {
      stopVoiceChat();
    } else {
      await startVoiceChat();
    }
  };

  // Update peer connections when other players change
  useEffect(() => {
    if (!isMicOn) return;

    // Remove connections for players who left
    const currentPeerIds = new Set(otherPlayerIds);
    peerConnectionsRef.current.forEach((pc, peerId) => {
      if (!currentPeerIds.has(peerId) && peerId !== currentPlayerId) {
        pc.close();
        peerConnectionsRef.current.delete(peerId);
        const audio = audioElementsRef.current.get(peerId);
        if (audio) {
          audio.srcObject = null;
          audioElementsRef.current.delete(peerId);
        }
      }
    });

    // Create connections for new players
    otherPlayerIds.forEach((peerId) => {
      if (peerId !== currentPlayerId && !peerConnectionsRef.current.has(peerId)) {
        if (localStreamRef.current) {
          const peerConnection = createPeerConnection(peerId);
          peerConnectionsRef.current.set(peerId, peerConnection);

          // Create and send offer
          peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
            if (channelRef.current) {
              channelRef.current.send({
                type: 'broadcast',
                event: 'signal',
                payload: {
                  from: currentPlayerId,
                  to: peerId,
                  type: 'offer',
                  data: offer.toJSON(),
                },
              });
            }
          });
        }
      }
    });
  }, [otherPlayerIds, isMicOn, currentPlayerId]);

  // Get remote streams from audio elements
  const getRemoteStreams = (): Map<string, MediaStream> => {
    const streams = new Map<string, MediaStream>();
    audioElementsRef.current.forEach((audio, playerId) => {
      if (audio.srcObject instanceof MediaStream) {
        streams.set(playerId, audio.srcObject);
      }
    });
    return streams;
  };

  return {
    isMicOn,
    isConnected,
    toggleMic,
    localStream: localStreamRef.current,
    remoteStreams: getRemoteStreams(),
  };
};

