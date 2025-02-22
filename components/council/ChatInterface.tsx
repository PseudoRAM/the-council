'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CouncilMember } from '@/utils/council/council-service';
import { generateVoiceWithId } from '@/utils/voice/elevenlabs';
import { Volume2, VolumeX } from 'lucide-react'; // Import icons

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'council';
  timestamp: Date;
  audioUrl?: string;
}

interface Props {
  councilMember: CouncilMember;
}

export default function ChatInterface({ councilMember }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep track of blob URLs to clean up
  const blobUrls = useRef<string[]>([]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      blobUrls.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const playAudio = (messageId: string, audioUrl: string) => {
    if (audioRef.current) {
      if (currentlyPlaying === messageId) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setCurrentlyPlaying(messageId);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      console.log('Sending request to chat API:', {
        memberId: councilMember.id,
        questionLength: input.length,
      });

      const response = await fetch('/api/council/chat/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          memberId: councilMember.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received chat response:', {
        hasResponse: !!data.response,
        hasAudio: !!data.audio,
        responseLength: data.response?.length,
      });

      let audioUrl = undefined;
      if (data.audio) {
        // Convert Base64 to Blob
        const audioBlob = new Blob(
          [Buffer.from(data.audio.data, 'base64')],
          { type: data.audio.type }
        );
        audioUrl = URL.createObjectURL(audioBlob);
        blobUrls.current.push(audioUrl);
      }

      const councilMessage: Message = {
        id: `council-${Date.now()}`,
        content: data.response,
        sender: 'council',
        timestamp: new Date(),
        audioUrl,
      };

      setMessages(prev => [...prev, councilMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while processing your message'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
      
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with {councilMember.name}</h2>
        <p className="text-sm text-muted-foreground">{councilMember.specialty}</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">{message.content}</div>
                  {message.audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() => playAudio(message.id, message.audioUrl!)}
                    >
                      {currentlyPlaying === message.id ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {error && (
        <div className="p-2 mb-4 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${councilMember.name} a question...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}