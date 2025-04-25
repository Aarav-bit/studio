'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Send} from 'lucide-react';
import {respondToUserQuery} from '@/ai/flows/respond-to-user-query';

const AIChat = () => {
  const [messages, setMessages] = useState<
    {sender: 'user' | 'ai'; text: string}[]
  >([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Scroll to bottom on message change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = {sender: 'user' as const, text: input};
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');

    setIsTyping(true); // Start typing indicator

    try {
      const aiResponse = await respondToUserQuery({message: input});
      const aiMessage = {sender: 'ai' as const, text: aiResponse.response};
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('AI Response Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          sender: 'ai' as const,
          text: 'Sorry, I encountered an error processing your request.',
        },
      ]);
    } finally {
      setIsTyping(false); // Stop typing indicator
    }
  };

  const TypingIndicator = () => (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-secondary p-4 text-secondary-foreground shadow-md">
        <h1 className="text-lg font-semibold">Zephyr Chat</h1>
      </header>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex w-full ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-2xl ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="rounded-xl px-4 py-2 max-w-2xl bg-muted text-muted-foreground">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-secondary border-t">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 rounded-md"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} aria-label="Send">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

