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
    <div className="w-full max-w-4xl mx-auto flex flex-col bg-white md:bg-transparent border-0 shadow-none pb-0 md:pb-0">
      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 space-y-3" style={{ paddingBottom: 140, maxHeight: 'calc(100vh - 140px)' }}>

        <div className="min-h-full flex flex-col justify-end space-y-2">
          {messages.map((message) => (
            <div key={message.id} className={`w-full flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`break-words px-4 py-3 rounded-lg shadow-sm ${
                  message.sender === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-gray-50 text-black rounded-bl-none'
                }`}
                style={{ maxWidth: '85%' }}
              >
                <div className="text-sm whitespace-pre-wrap">{message.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Area */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[70%] max-w-4xl px-4 bg-white border-t z-60 rounded-t-xl">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bir mesaj yaz..."
            rows={1}
            className="flex-1 px-3 py-1 md:px-4 md:py-3 bg-gray-100 text-black border border-gray-200 rounded-full md:rounded-xl resize-none max-h-40 md:max-h-48 overflow-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={!input.trim()}
            aria-label="Mesajı gönder"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
