import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { VoiceStatus } from '@/components/game/VoiceStatus';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

interface ChatMessage {
  id: string;
  player_id: string;
  player_name: string;
  message: string;
  created_at: string;
}

interface ChatRoomProps {
  gameId: string;
  currentPlayerId: string;
  players: Player[];
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ gameId, currentPlayerId, players }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const otherPlayerIds = players.map((p) => p.id).filter((id) => id !== currentPlayerId);

  // Use voice chat hook
  const { isMicOn, isConnected, toggleMic, localStream, remoteStreams } = useVoiceChat({
    gameId,
    currentPlayerId,
    otherPlayerIds,
  });

  // Broadcast mic status when it changes
  useEffect(() => {
    const channelName = `voice-status:${gameId}`;
    const channel = supabase.channel(channelName);
    channel
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'mic-status',
            payload: {
              playerId: currentPlayerId,
              isMicOn,
            },
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMicOn, gameId, currentPlayerId]);

  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Subscribe to new messages
    const channelName = `chat:${gameId}:${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          // Fetch player name if not in current players list
          let playerName = players.find((p) => p.id === newMsg.player_id)?.name;
          if (!playerName) {
            const { data: playerData } = await supabase
              .from('players')
              .select('name')
              .eq('id', newMsg.player_id)
              .single();
            playerName = playerData?.name || 'Unknown';
          }
          
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              player_id: newMsg.player_id,
              player_name: playerName,
              message: newMsg.message,
              created_at: newMsg.created_at,
            },
          ]);
        }
      )
      .subscribe((status) => {
        console.log('Chat subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, players]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data) {
        // Fetch player names for all messages
        const playerIds = [...new Set(data.map((msg: any) => msg.player_id))];
        const { data: playersData } = await supabase
          .from('players')
          .select('id, name')
          .in('id', playerIds);

        const playerMap = new Map(playersData?.map((p) => [p.id, p.name]) || []);

        const formattedMessages: ChatMessage[] = data.map((msg: any) => ({
          id: msg.id,
          player_id: msg.player_id,
          player_name: playerMap.get(msg.player_id) || 'Unknown',
          message: msg.message,
          created_at: msg.created_at,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentPlayerId) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        game_id: gameId,
        player_id: currentPlayerId,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  return (
    <>
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full flex flex-col">
        <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Chat</span>
          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <Volume2 className="h-3 w-3" />
                <span>Đã kết nối</span>
              </div>
            )}
            <Button
              onClick={toggleMic}
              variant={isMicOn ? 'default' : 'outline'}
              size="sm"
              className={isMicOn ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isMicOn ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Tắt mic
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Bật mic
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {messages.map((msg) => {
              const isOwnMessage = msg.player_id === currentPlayerId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isOwnMessage ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {msg.player_name}
                      </p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isMicOn && (
            <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Microphone đang bật - Mọi người có thể nghe bạn</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    <VoiceStatus
      gameId={gameId}
      currentPlayerId={currentPlayerId}
      players={players}
      localStream={localStream}
      remoteStreams={remoteStreams}
    />
    </>
  );
};

