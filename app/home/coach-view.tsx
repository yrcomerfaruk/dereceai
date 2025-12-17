
'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function CoachView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Merhaba! Ben Derece Koçu. YKS hazırlık sürecinde sana nasıl yardımcı olabilirim?',
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Placeholder for bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: 'Bu harika bir soru! Bunun hakkında biraz düşüneyim...',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white border border-gray-200 rounded-lg">
      {/* Message Display Area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                DK
              </div>
            )}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gray-800 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bir mesaj yaz..."
            className="flex-1 w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            type="submit"
            className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={!input.trim()}
            aria-label="Mesajı gönder"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 22-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
