'use client';

import { useState, useEffect } from 'react';
import { useHeaderActions } from '../header-context';

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
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'info' } | null>(null);

  // Utility to show toast
  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    // Mock ders programı
    const mockSchedule: DaySchedule[] = [
      {
        day: 'Pazartesi',
        date: '2025-12-08',
        topics: [
          { name: 'Erken Kalkış & Spor', duration: '45 dk', edited: false, startHour: 6 },
          { name: 'Matematik - Fonksiyonlar', duration: '1.5 saat', edited: false, startHour: 9 },
          { name: 'Türkçe - Paragraf Analizi', duration: '1 saat', edited: false, startHour: 10.75 }, // 10:45
          { name: 'Öğle Arası', duration: '1 saat', edited: false, startHour: 12.5 }, // 12:30
          { name: 'Fizik - Kuvvet ve Hareket', duration: '2 saat', edited: false, startHour: 14 },
          { name: 'Akşam Etüdü', duration: '3.5 saat', edited: false, startHour: 19.5 }, // 19:30
          { name: 'Günü Değerlendirme', duration: '30 dk', edited: false, startHour: 23.5 }, // 23:30
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

    // initialize everything as incomplete for testing and manual flow
    const enriched = mockSchedule.map((d) => ({
      ...d,
      completed: d.completed ?? false,
      topics: d.topics.map(t => ({ ...t, completed: false }))
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
    const dayIdx = schedule.findIndex(d => d.day === day);

    // Sequential Check: Cannot complete day i if day i-1 is not completed
    if (dayIdx > 0 && !schedule[dayIdx - 1].completed) {
      showToast("Önceki günü tamamlamadan bu günü işaretleyemezsin!");
      return;
    }

    setSchedule((prev) => {
      return prev.map((d) => {
        if (d.day === day) {
          const allAlreadyCompleted = d.topics.every(t => t.completed);
          const newStatus = !allAlreadyCompleted;

          return {
            ...d,
            completed: newStatus,
            topics: d.topics.map((t) => ({ ...t, completed: newStatus })),
          };
        }
        return d;
      });
    });
  };

  const toggleTopic = (dayIndex: number, topicIndex: number) => {
    // Sequential Check: Cannot complete topic in day i if day i-1 is not completed
    if (dayIndex > 0 && !schedule[dayIndex - 1].completed) {
      showToast("Önceki günü tamamen bitirmeden derslerini işaretleyemezsin!");
      return;
    }

    setSchedule((prev) => {
      return prev.map((d, di) => {
        if (di === dayIndex) {
          const newTopics = d.topics.map((t, ti) => (ti === topicIndex ? { ...t, completed: !t.completed } : t));
          const allCompleted = newTopics.every((t) => t.completed);
          return {
            ...d,
            topics: newTopics,
            completed: allCompleted,
          };
        }
        return d;
      });
    });
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

  const formatTimeRange = (startHour: number, duration: string) => {
    const start = startHour;
    const durationHours = parseDurationHours(duration);
    const end = start + durationHours;

    const toHHMM = (h: number) => {
      const hours = Math.floor(h) % 24; // Ensure 24:00 becomes 00:00
      const minutes = Math.round((h - Math.floor(h)) * 60);
      return `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;
    };

    return `${toHHMM(start)}-${toHHMM(end)}`;
  };

  useHeaderActions(
    <div className="md:hidden flex items-center bg-gray-100 rounded-full p-0.5 space-x-0.5">
      <button
        onClick={() => setView('takvim')}
        className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium text-[12px] transition-all ${view === 'takvim'
          ? 'bg-white text-gray-800 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        Takvim
      </button>
      <button
        onClick={() => setView('liste')}
        className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium text-[12px] transition-all ${view === 'liste'
          ? 'bg-white text-gray-800 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        Liste
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="hidden md:flex mb-3 justify-end items-center">
        <div className="bg-gray-100 rounded-full p-0.5 flex items-center space-x-0.5">
          <button
            onClick={() => setView('takvim')}
            className={`whitespace-nowrap px-3 py-0.5 rounded-full font-medium text-sm transition-all min-w-[30px] ${view === 'takvim'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Takvim
          </button>
          <button
            onClick={() => setView('liste')}
            className={`whitespace-nowrap px-3 py-0.5 rounded-full font-medium text-sm transition-all min-w-[30px] ${view === 'liste'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Liste
          </button>
        </div>
      </div>

      {/* Liste Görünümü */}
      {view === 'liste' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {schedule.map((daySchedule, idx) => {
            const allTopicsCompleted = daySchedule.topics.length > 0 && daySchedule.topics.every(t => t.completed);

            return (
              <div
                key={daySchedule.day}
                className={`border border-gray-300 rounded-lg p-3 bg-white transition-all flex flex-col ${daySchedule.date === todayStr ? 'ring-2 ring-black border-black' : ''}`}
              >
                {/* Gün Başlığı */}
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-gray-900">{daySchedule.day}</p>
                    <p className="text-[10px] text-gray-500">{daySchedule.date}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditDay(daySchedule.day)}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                      title="Düzelt"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21v-3.75L14.06 6.19a2 2 0 0 1 2.83 0l1.92 1.92a2 2 0 0 1 0 2.83L7.75 22H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleComplete(daySchedule.day)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${allTopicsCompleted ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black'}`}
                    >
                      {allTopicsCompleted ? 'Geri Al' : 'Tamamla'}
                    </button>
                  </div>
                </div>

                {/* Konular */}
                <div className="space-y-2 flex-grow">
                  {daySchedule.topics.map((topic, tIdx) => (
                    <div
                      key={tIdx}
                      onClick={() => toggleTopic(idx, tIdx)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition-all border ${topic.completed
                        ? 'bg-gray-50 text-gray-400 border-transparent'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-black active:scale-[0.98]'
                        }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`font-semibold flex-1 leading-tight ${topic.completed ? 'line-through' : ''}`}>
                          {topic.name}
                        </p>
                        <span className="text-[10px] font-bold text-gray-400 shrink-0">
                          {formatTimeRange(topic.startHour || 9, topic.duration)}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{topic.duration}</p>
                    </div>
                  ))}
                </div>

                {/* Notlar */}
                {daySchedule.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Not</p>
                    <p className="text-[10px] text-gray-500 line-clamp-2 italic">"{daySchedule.notes}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Takvim (gün odaklı) Görünümü */}
      {view === 'takvim' && schedule[selectedIndex] && (
        <div className="bg-white border-[0.5px] border-gray-200 rounded-2xl p-3 md:p-5 mt-2 flex flex-col h-[calc(100dvh-150px)] md:h-[calc(100vh-130px)] overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <button
              onClick={prevDay}
              className="w-7 h-7 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
              aria-label="Önceki Gün"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-baseline gap-2 flex-1 justify-center">
              <p className="font-bold text-gray-900 text-base">{schedule[selectedIndex].day}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleEditDay(schedule[selectedIndex].day)} className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Düzelt">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21v-3.75L14.06 6.19a2 2 0 0 1 2.83 0l1.92 1.92a2 2 0 0 1 0 2.83L7.75 22H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                onClick={nextDay}
                className="w-8 h-8 flex items-center justify-center border-[0.5px] border-gray-200 rounded-full text-gray-400 hover:text-black hover:border-black transition-all"
                aria-label="Sonraki Gün"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 relative border-[0.5px] border-gray-100 rounded-xl bg-white overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="relative min-h-[1200px] w-full">
              {/* Continuous vertical line container */}
              <div className="absolute left-0 top-0 bottom-0 w-12 border-r-[0.5px] border-gray-100 bg-white z-10">
                {/* Timeline labels */}
                {Array.from({ length: 19 }).map((_, i) => {
                  const hour = 6 + i; // 06:00 - 24:00
                  return (
                    <div
                      key={i}
                      className="absolute w-full text-right pr-2 text-[10px] text-gray-300 font-medium"
                      style={{ top: `${40 + i * 60}px`, transform: 'translateY(-50%)' }}
                    >
                      {hour}:00
                    </div>
                  );
                })}
              </div>

              {/* Grid lines */}
              <div className="absolute left-12 right-0 top-0 bottom-0">
                {Array.from({ length: 19 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t-[0.5px] border-gray-50"
                    style={{ top: `${40 + i * 60}px` }}
                  />
                ))}
              </div>

              {/* Events */}
              <div className="absolute left-12 right-0 top-0 bottom-0">
                {schedule[selectedIndex].topics.map((topic, idx) => {
                  const startHour = topic.startHour || 9; // Default to 9 if missing
                  const durationHours = parseDurationHours(topic.duration);
                  const top = 40 + (startHour - 6) * 60; // 40px offset + 60px per hour
                  const height = durationHours * 60;

                  return (
                    <div
                      key={idx}
                      className={`absolute left-1.5 right-1.5 rounded-lg border-[0.5px] px-3 py-2 text-xs transition-all hover:z-30 ${topic.completed
                        ? 'bg-gray-50 border-gray-100 text-gray-400'
                        : 'bg-white border-gray-100 text-gray-800 border-l-2 border-l-black shadow-none'
                        }`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        minHeight: '36px'
                      }}
                    >
                      <div className="flex justify-between items-start h-full">
                        <div className="overflow-hidden leading-tight">
                          <p className={`font-semibold truncate ${topic.completed ? 'line-through opacity-70' : ''}`}>
                            {topic.name} <span className="font-normal text-gray-500 ml-1">({topic.duration})</span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTopic(selectedIndex, idx);
                          }}
                          className={`shrink-0 ml-1 p-1 rounded-full ${topic.completed ? 'text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            }`}
                        >
                          {topic.completed ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl">
          <div className="flex items-center gap-3">
            {notification.type === 'error' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#FF4D4D" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}
