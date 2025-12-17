'use client';

import { useState, useEffect } from 'react';

interface DaySchedule {
  day: string;
  date: string;
  topics: { name: string; duration: string; edited: boolean; completed?: boolean; startHour?: number }[];
  notes: string;
  completed?: boolean;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [view, setView] = useState<'liste' | 'takvim'>('takvim');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    // Mock ders programı
    const mockSchedule: DaySchedule[] = [
      {
        day: 'Pazartesi',
        date: '2025-12-08',
        topics: [
          { name: 'Matematik - Fonksiyonlar', duration: '1.5 saat', edited: false, startHour: 9 },
          { name: 'Türkçe - Paragraf Analizi', duration: '1 saat', edited: false, startHour: 10.5 },
        ],
        notes: '',
        completed: false,
      },
      {
        day: 'Salı',
        date: '2025-12-09',
        topics: [
          { name: 'Fen - Kimya Reaksiyonları', duration: '1.5 saat', edited: false, startHour: 9 },
          { name: 'İngilizce - Grammar', duration: '1 saat', edited: false, startHour: 10.5 },
        ],
        notes: '',
        completed: false,
      },
      {
        day: 'Çarşamba',
        date: '2025-12-10',
        topics: [
          { name: 'Sosyal - Osmanlı Tarihi', duration: '1.5 saat', edited: false, startHour: 9 },
          { name: 'Matematik - İntegral', duration: '1.5 saat', edited: false, startHour: 11 },
        ],
        notes: '',
        completed: false,
      },
      {
        day: 'Perşembe',
        date: '2025-12-11',
        topics: [
          { name: 'Türkçe - Şiir Analizi', duration: '1 saat', edited: false, startHour: 14 },
          { name: 'Fen - Fizik Optik', duration: '1.5 saat', edited: false, startHour: 15 },
        ],
        notes: '',
        completed: false,
      },
      {
        day: 'Cuma',
        date: '2025-12-12',
        topics: [
          { name: 'İngilizce - Reading', duration: '1.5 saat', edited: false, startHour: 9 },
          { name: 'Matematik - Limit', duration: '1 saat', edited: false, startHour: 11 },
        ],
        notes: '',
        completed: false,
      },
      {
        day: 'Cumartesi',
        date: '2025-12-13',
        topics: [
          { name: 'Fen - Biyoloji DNA', duration: '2 saat', edited: false, startHour: 10 },
          { name: 'Sosyal - Coğrafya', duration: '1.5 saat', edited: false, startHour: 12 },
        ],
        notes: '',
        completed: false,
      },
      {
        day: 'Pazar',
        date: '2025-12-14',
        topics: [
          { name: 'Genel Tekrar', duration: '2 saat', edited: false, startHour: 16 },
        ],
        notes: '',
        completed: false,
      },
    ];

    // enrich with completed flag based on date
    const todayStr = new Date().toISOString().slice(0, 10);
    const enriched = mockSchedule.map((d) => ({
      ...d,
      completed: new Date(d.date) < new Date(todayStr) ? true : false,
    }));
    setSchedule(enriched);

    // Set selectedIndex to today's date index if exists
    const todayIdx = enriched.findIndex((d) => d.date === todayStr);
    setSelectedIndex(todayIdx >= 0 ? todayIdx : 0);
  }, []);

  const handleEditDay = (day: string) => {
    setEditingDay(day);
    const dayData = schedule.find((d) => d.day === day);
    setEditText(dayData?.notes || '');
  };

  const handleSaveEdit = (day: string) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day === day ? { ...d, notes: editText } : d))
    );
    setEditingDay(null);
  };

  const handleExportJSON = () => {
    // kept for debug (no UI button) - still available in code if needed
    const json = JSON.stringify(schedule, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.json';
    a.click();
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const toggleComplete = (day: string) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          const newCompletedStatus = !d.completed;
          return {
            ...d,
            completed: newCompletedStatus,
            topics: d.topics.map((t) => ({ ...t, completed: newCompletedStatus })),
          };
        }
        return d;
      })
    );
  };

  const toggleTopic = (dayIndex: number, topicIndex: number) => {
    setSchedule((prev) =>
      prev.map((d, di) =>
        di === dayIndex
          ? {
              ...d,
              topics: d.topics.map((t, ti) => (ti === topicIndex ? { ...t, completed: !t.completed } : t)),
            }
          : d
      )
    );
  };

  const prevDay = () => {
    setSelectedIndex((s) => Math.max(0, s - 1));
    setView('takvim');
  };

  const nextDay = () => {
    setSelectedIndex((s) => Math.min(schedule.length - 1, s + 1));
    setView('takvim');
  };

  const parseDurationHours = (duration: string) => {
    // expects formats like '1.5 saat' or '2 saat' or '45 dk'
    const hMatch = duration.match(/([0-9]*\.?[0-9]+)\s*saat/);
    if (hMatch) return parseFloat(hMatch[1]);
    const mMatch = duration.match(/([0-9]+)\s*dk/);
    if (mMatch) return parseInt(mMatch[1], 10) / 60;
    return 1; // fallback 1 hour
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Haftalık Ders Programı
        </h1>

        <div className="bg-gray-100 rounded-full p-1 flex items-center space-x-1">
          <button
            onClick={() => setView('takvim')}
            className={`whitespace-nowrap px-3 py-1 rounded-full font-medium text-sm transition-all ${
              view === 'takvim'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Takvim
          </button>
          <button
            onClick={() => setView('liste')}
            className={`whitespace-nowrap px-3 py-1 rounded-full font-medium text-sm transition-all ${
              view === 'liste'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Liste
          </button>
        </div>
      </div>

      {/* Liste Görünümü (birleştirilmiş Takvim+Liste) */}
      {view === 'liste' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {schedule.map((daySchedule, idx) => (
            <div
              key={daySchedule.day}
              draggable
              onDragStart={(e) => { setDragIndex(idx); e.dataTransfer?.setData('text/plain', String(idx)); e.dataTransfer!.effectAllowed = 'move'; }}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragIndex !== null ? dragIndex : parseInt(e.dataTransfer?.getData('text/plain') || '0', 10);
                const to = idx;
                if (from !== to) {
                  setSchedule((prev) => {
                    const items = [...prev];
                    const [moved] = items.splice(from, 1);
                    items.splice(to, 0, moved);
                    return items;
                  });
                }
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              className={`border rounded-lg overflow-hidden bg-white transition flex flex-col ${daySchedule.date === todayStr ? 'ring-2 ring-blue-500' : ''} ${dragOverIndex === idx ? 'ring-2 ring-blue-300' : ''}`}
            >
              {/* Gün Başlığı */}
              <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                <div className="flex flex-col">
                  <p className="font-bold text-gray-900">{daySchedule.day}</p>
                  <div className="flex gap-2">
                    <p className="text-xs text-gray-500 hidden sm:block">{daySchedule.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditDay(daySchedule.day)}
                    className="text-gray-500 hover:text-gray-800 text-sm"
                    title="Düzelt"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21v-3.75L14.06 6.19a2 2 0 0 1 2.83 0l1.92 1.92a2 2 0 0 1 0 2.83L7.75 22H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button
                    onClick={() => toggleComplete(daySchedule.day)}
                    className={`px-2 py-1 rounded text-xs border ${daySchedule.completed ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300'}`}
                  >
                    {daySchedule.completed ? 'Geri Al' : 'Tamamla'}
                  </button>
                </div>
              </div>

              {/* Konular */}
              <div className="p-2 space-y-1 flex-grow">
                {daySchedule.topics.map((topic, tIdx) => (
                  <div 
                    key={tIdx} 
                    onClick={() => toggleTopic(idx, tIdx)} 
                    className={`p-2 rounded-md text-sm cursor-pointer transition-colors duration-150 hover:bg-gray-100 ${topic.completed ? 'bg-green-50 text-gray-500' : 'bg-white text-gray-800'}`}
                  >
                    <p className={`font-medium ${topic.completed ? 'line-through' : ''}`}>{topic.name}</p>
                    <p className="text-xs text-gray-500">{topic.duration}</p>
                  </div>
                ))}
              </div>

              {/* Notlar */}
              {daySchedule.notes && (
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 mt-auto">
                  <p className="font-semibold mb-1 text-gray-700">Not:</p>
                  <p className="line-clamp-2">{daySchedule.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Takvim (gün odaklı) Görünümü */}
      {view === 'takvim' && schedule[selectedIndex] && (
        <div className="bg-white border rounded-lg p-3 mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button onClick={prevDay} className="px-2 py-1 border rounded text-xs text-gray-900">◀</button>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{schedule[selectedIndex].day}</p>
                <p className="text-xs text-gray-500">{schedule[selectedIndex].date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleEditDay(schedule[selectedIndex].day)} className="text-gray-500 text-sm" title="Düzelt">✎</button>
              <button onClick={nextDay} className="px-2 py-1 border rounded text-xs text-gray-900">▶</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="relative border rounded-lg h-[520px] bg-gray-50 overflow-auto">
                {/* timeline labels */}
                <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-gray-200">
                  <div className="p-2 text-xs text-gray-500">Saat</div>
                  {Array.from({ length: 19 }).map((_, i) => {
                    const hour = 6 + i; // 6:00 .. 24:00
                    return (
                      <div key={i} className="h-12 border-t border-gray-200 text-xs text-gray-400 px-2 flex items-center">
                        {hour}:00
                      </div>
                    );
                  })}
                </div>

                {/* content area */}
                <div className="ml-16 p-3">
                  {schedule[selectedIndex].topics.map((topic, idx) => {
                    const hours = parseDurationHours(topic.duration);
                    const height = Math.max(36, Math.round(hours * 60));
                    return (
                      <div key={idx} className="mb-2">
                        <div className={`p-2 rounded-md shadow-sm flex justify-between items-center ${topic.completed ? 'bg-gray-200' : 'bg-white'}`} style={{ height }}>
                          <div>
                            <p className={`font-medium text-sm text-gray-900 ${topic.completed ? 'line-through' : ''}`}>{topic.name}</p>
                            <p className="text-xs text-gray-500">{topic.duration}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {topic.completed ? (
                              <button onClick={() => toggleTopic(selectedIndex, idx)} className="text-sm text-gray-800 hover:text-gray-900">✖</button>
                            ) : (
                              <button onClick={() => toggleTopic(selectedIndex, idx)} className="text-sm text-green-600 hover:text-green-700">Bitir</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* (liste view merged above) */}

      {/* Edit Dialog */}
      {editingDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingDay} Düzeltme
            </h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Notlarını yazın..."
              className="w-full h-32 border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditingDay(null)}
                className="flex-1 border border-gray-300 text-gray-900 py-2 rounded font-semibold hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={() => handleSaveEdit(editingDay)}
                className="flex-1 bg-gray-900 text-white py-2 rounded font-semibold hover:bg-gray-800 transition"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
