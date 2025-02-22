'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CouncilMember } from '@/utils/council/council-service';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  content: string;
  sender: string;
  senderName?: string;
  timestamp: Date;
}

interface Props {
  initialCouncilMembers: CouncilMember[];
}

export default function GroupChat({ initialCouncilMembers }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    setError(null);
    setIsLoading(true);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/council/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: input,
          councilMembers: initialCouncilMembers.map(m => m.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get council responses');
      }

      const { responses } = await response.json();

      const councilResponses = responses.map((resp: any): Message => ({
        id: `${resp.memberId}-${Date.now()}`,
        content: resp.content,
        sender: resp.memberId,
        senderName: resp.memberName,
        timestamp: new Date(),
      }));

      setMessages(prev => [...prev, ...councilResponses]);
    } catch (error) {
      console.error('Error getting council responses:', error);
      setError('Failed to get responses from the council');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Council Discussion</h2>
        <p className="text-sm text-muted-foreground">
          Ask a question to receive perspectives from all council members
        </p>
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
                {message.sender !== 'user' && (
                  <div className="font-semibold text-sm mb-1">
                    {message.senderName}
                  </div>
                )}
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

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
            placeholder="Ask the council a question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Consulting...' : 'Ask'}
          </Button>
        </form>
      </div>
    </div>
  );
} 