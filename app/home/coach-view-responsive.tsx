'use client';

import { useState, useRef, useEffect } from 'react';
import './coach-view.css';

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
    <>
      {/* MOBILE */}
      <div className="md:hidden fixed inset-0 z-60 flex flex-col justify-end bg-transparent coach-mobile">
        <div className="overflow-y-auto hide-scrollbar px-4 pt-4 coach-messages" style={{ maxHeight: 'calc(100vh - 96px)', paddingBottom: 96 }}>
          <div className="flex flex-col justify-end space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`w-full flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`break-words px-4 py-2 rounded-lg shadow-sm ${
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

        <div className="fixed left-0 right-0 bottom-0 px-4 pb-safe bg-white border-t z-70 coach-input">
          <form onSubmit={handleSend} className="flex items-center gap-3 bg-white rounded-full px-3 py-2 shadow-sm max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir mesaj yaz..."
              rows={1}
              className="flex-1 px-3 py-2 bg-gray-100 text-black border border-gray-200 rounded-full resize-none max-h-40 overflow-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* DESKTOP */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 coach-desktop">
        <div className="mx-auto max-w-4xl coach-messages-desktop" style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          <div className="flex flex-col justify-end space-y-4 py-6">
            {messages.map((message) => (
              <div key={message.id} className={`w-full flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`break-words px-5 py-4 rounded-lg shadow-sm ${
                    message.sender === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-gray-50 text-black rounded-bl-none'
                  }`}
                  style={{ maxWidth: '75%' }}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[70%] max-w-4xl bg-white border-t z-60 rounded-t-xl px-6 py-4 shadow-lg coach-input-desktop">
          <form onSubmit={handleSend} className="flex items-center gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir mesaj yaz..."
              rows={1}
              className="flex-1 px-4 py-3 bg-gray-100 text-black border border-gray-200 rounded-xl resize-none max-h-48 overflow-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
    </>
  );
}
