'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Haftalık Program Oluştur",
  "Matematik netlerimi nasıl artırabilirim?",
  "Haftalık ilerlememi özetle",
  "Sınav takvimi ne zaman?",
  "TYT Türkçe için kaynak önerisi",
  "Günde kaç saat çalışmalıyım?",
  "Odaklanma sorunumu nasıl çözerim?",
  "AYT Matematik konuları neler?",
  "Deneme analizini nasıl yaparım?",
  "Biyoloji ezberleri için taktik ver",
  "Geometriye nasıl çalışılır?",
  "Motivasyonum düştü, ne yapmalıyım?"
];

export default function AIChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [programData, setProgramData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages from Supabase on mount
  useEffect(() => {
    async function loadMessages() {
      setIsLoadingMessages(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingMessages(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data && !error) {
        const loadedMessages: Message[] = [];
        data.forEach((msg: any) => {
          loadedMessages.push({
            id: `${msg.id}-user`,
            role: 'user',
            content: msg.message
          });
          loadedMessages.push({
            id: `${msg.id}-ai`,
            role: 'assistant',
            content: msg.response
          });
        });
        setMessages(loadedMessages);
      }
      setIsLoadingMessages(false);
    }
    loadMessages();
  }, []);

  // Remove localStorage save
  // useEffect(() => {
  //   if (messages.length > 0) {
  //     localStorage.setItem('chat_messages', JSON.stringify(messages));
  //   }
  // }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    setProgramData(null); // Clear previous program data context if any

    try {
      // Get session for basic security (though API route handles it mostly)
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({
          message: text,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');

      let aiContent = data.response;

      // Check if weekly program was generated (backend sends it separately)
      if (data.weeklyProgram) {
        console.log('Weekly program received:', data.weeklyProgram);

        // Automatically save the program to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            console.log('Starting to save program for user:', user.id);

            // Save each day's sessions to database with detailed information
            for (const day of data.weeklyProgram) {
              console.log('Processing day:', day.day, 'Date:', day.date);

              // Convert sessions array to JSON string with all details
              const sessionsData = Array.isArray(day.sessions)
                ? day.sessions.map((session: any) => {
                  if (typeof session === 'string') {
                    return { subject: session };
                  }
                  return session;
                })
                : day.sessions;

              console.log('Sessions data:', sessionsData);

              const { data: insertData, error: insertError } = await supabase.from('schedules').insert({
                user_id: user.id,
                title: `${day.day} - Çalışma`,
                description: JSON.stringify(sessionsData), // Store as JSON string
                date: day.date || new Date().toISOString(), // Use real date from AI
                type: 'study'
              });

              if (insertError) {
                console.error('Insert error for day', day.day, ':', insertError);
                throw insertError;
              }

              console.log('Successfully saved day:', day.day);
            }

            console.log('All days saved successfully!');
            aiContent += "\n\n✅ **Haftalık programın otomatik olarak takvime eklendi!** [Takvimi görüntüle](/schedule)";
          } catch (saveError) {
            console.error("Auto-save error:", saveError);
            // If auto-save fails, show manual save button
            setProgramData(data.weeklyProgram);
            aiContent += "\n\n⚠️ **Program oluşturuldu ama kaydedilemedi.** Aşağıdaki butona tıklayarak tekrar deneyebilirsin.";
          }
        } else {
          console.log('User not logged in');
          // User not logged in, show manual save button
          setProgramData(data.weeklyProgram);
          aiContent += "\n\n**Haftalık programın hazır!** Aşağıdaki butona tıklayarak takvimine ekleyebilirsin.";
        }
      } else {
        console.log('No weekly program in response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar dene."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!programData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Lütfen giriş yapın');
        return;
      }

      // Save each day's sessions to database with detailed information
      for (const day of programData) {
        const sessionsData = Array.isArray(day.sessions)
          ? day.sessions.map((session: any) => {
            if (typeof session === 'string') {
              return { subject: session };
            }
            return session;
          })
          : day.sessions;

        await supabase.from('schedules').insert({
          user_id: user.id,
          title: `${day.day} - Çalışma`,
          description: JSON.stringify(sessionsData),
          date: day.date || new Date().toISOString(),
          type: 'study'
        });
      }

      // Clear program data
      setProgramData(null);

      alert('Program takvime başarıyla eklendi!');
      router.push('/schedule');
    } catch (error) {
      console.error('Save error:', error);
      alert('Program kaydedilirken hata oluştu');
    }
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

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-8">
        {isLoadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-black">
                Merhaba, Koçun Burada!
              </h2>
              <p className="text-gray-500 text-sm font-medium">Sana nasıl yardımcı olabilirim?</p>
            </div>

            <div className="w-full max-w-4xl space-y-3 overflow-hidden">
              {/* İlk Sıra */}
              <div
                className="flex overflow-x-auto no-scrollbar gap-2 px-4 pb-1"
                onWheel={handleWheel}
              >
                {SUGGESTED_QUESTIONS.slice(0, Math.ceil(SUGGESTED_QUESTIONS.length / 2)).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="whitespace-nowrap px-3 py-1.5 bg-white rounded-xl transition-all border border-gray-200 text-gray-700 text-[11px] font-medium shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
              {/* İkinci Sıra */}
              <div
                className="flex overflow-x-auto no-scrollbar gap-2 px-4"
                onWheel={handleWheel}
              >
                {SUGGESTED_QUESTIONS.slice(Math.ceil(SUGGESTED_QUESTIONS.length / 2)).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="whitespace-nowrap px-3 py-1.5 bg-white rounded-xl transition-all border border-gray-200 text-gray-700 text-[11px] font-medium shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
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
                  <div className="leading-relaxed text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:font-bold prose-a:text-blue-600">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
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

            {/* Program Action Button */}
            {!isLoading && programData && (
              <div className="flex justify-start animate-fade-in">
                <div className="ml-8">
                  <button
                    onClick={handleSaveProgram}
                    className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
                    Programı Takvime Ekle
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] px-4 border-t border-gray-50">
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

