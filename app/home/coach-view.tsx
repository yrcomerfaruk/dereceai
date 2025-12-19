'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function CoachView(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Merhaba! Ben Derece Koçu.', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    // simple bot reply
    setTimeout(() => setMessages((p) => [...p, { id: Date.now() + 1, text: 'Anladım, yardımcı olayım...', sender: 'bot' }]), 700);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white border rounded-lg p-4 space-y-3 max-h-[60vh] overflow-auto">
        {messages.map((m) => (
          <div key={m.id} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
            <div className={`${m.sender === 'user' ? 'inline-block bg-black text-white' : 'inline-block bg-gray-100 text-black'} px-4 py-2 rounded-2xl`}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2"
          placeholder="Bir mesaj yaz..."
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-full" type="submit">
          Gönder
        </button>
      </form>
    </div>
  );
}
