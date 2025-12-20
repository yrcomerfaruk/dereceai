'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Bugünkü ders programım nedir?",
  "Matematik netlerimi nasıl artırabilirim?",
  "Haftalık ilerlememi özetle",
  "Sınav takvimi ne zaman?"
];

export default function AIChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Bu bir demo yanıtıdır. Gerçek AI entegrasyonu daha sonra yapılacaktır."
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="flex flex-col h-[calc(100dvh-100px)] md:h-[calc(100vh-100px)] relative md:-mx-3 md:-mb-6 sm:mx-0 sm:mb-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-8">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-black">
                Merhaba, Koçun Burada!
              </h2>
              <p className="text-gray-500 text-lg font-medium">Sana nasıl yardımcı olabilirim?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="p-2.5 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100 text-gray-700 text-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === 'user'
                    ? 'bg-gray-100 text-gray-900 rounded-br-sm'
                    : 'bg-transparent text-gray-800 px-0'
                    }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-bold">
                        AI
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Derece Koçu</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-bold">
                    AI
                  </div>
                  <div className="flex gap-1 bg-gray-50 px-3 py-2 rounded-2xl rounded-tl-sm border border-gray-100">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed Bottom */}
      <div className="absolute bottom-1 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2 px-4">
        <div className="max-w-5xl mx-auto relative">
          <div className="bg-gray-50 border border-gray-200 rounded-[2rem] flex items-center p-0.5 shadow-sm transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bir şeyler sor..."
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none max-h-32 py-1.5 px-3 text-sm text-gray-700 placeholder-gray-400 appearance-none"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-1.5 rounded-full transition-all ${input.trim() && !isLoading
                ? 'bg-black text-white hover:bg-gray-800 transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
