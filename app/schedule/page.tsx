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
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'info' } | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function loadSchedule() {
      const { supabase } = await import('@/lib/supabase');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (scheduleData && scheduleData.length > 0) {
        const dayMap = new Map<string, any>();
        scheduleData.forEach((item: any) => {
          const dayName = item.title.split(' - ')[0];
          if (!dayMap.has(dayName)) {
            dayMap.set(dayName, {
              day: dayName,
              date: item.date.split('T')[0],
              topics: [],
              notes: '',
              completed: false
            });
          }
          const sessions = item.description.split(', ');
          sessions.forEach((session: string, idx: number) => {
            dayMap.get(dayName).topics.push({
              name: session,
              duration: '1 saat',
              edited: false,
              completed: false,
              startHour: 8 + idx * 1.5
            });
          });
        });

        const enriched = Array.from(dayMap.values());
        setSchedule(enriched);

        const todayIdx = enriched.findIndex((d) => d.date === todayStr);
        setSelectedIndex(todayIdx >= 0 ? todayIdx : 0);

        if (todayIdx >= 0) {
          setExpandedDays(new Set([enriched[todayIdx].day]));
        } else if (enriched.length > 0) {
          setExpandedDays(new Set([enriched[0].day]));
        }
      } else {
        const mockSchedule: DaySchedule[] = [
          {
            day: 'Pazartesi',
            date: '2025-12-22',
            topics: [
              { name: 'TYT Türkçe - Paragraf', duration: '1 saat', edited: false, startHour: 8 },
              { name: 'TYT Matematik - Sayılar', duration: '1 saat', edited: false, startHour: 9.25 },
            ],
            notes: 'Haftaya enerjik başla!',
            completed: false,
          },
        ];

        const enriched = mockSchedule.map((d) => ({
          ...d,
          completed: d.completed ?? false,
          topics: d.topics.map(t => ({ ...t, completed: false }))
        }));
        setSchedule(enriched);
        setSelectedIndex(0);
        setExpandedDays(new Set([enriched[0].day]));
      }
    }

    loadSchedule();
  }, []);

  const toggleDayExpansion = (day: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

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

  const toggleComplete = (day: string) => {
    const dayIdx = schedule.findIndex(d => d.day === day);
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
    const hMatch = duration.match(/([0-9]*\.?[0-9]+)\s*saat/);
    if (hMatch) return parseFloat(hMatch[1]);
    const mMatch = duration.match(/([0-9]+)\s*dk/);
    if (mMatch) return parseInt(mMatch[1], 10) / 60;
    return 1;
  };

  const formatTimeRange = (startHour: number, duration: string) => {
    const start = startHour;
    const durationHours = parseDurationHours(duration);
    const end = start + durationHours;
    const toHHMM = (h: number) => {
      const hours = Math.floor(h) % 24;
      const minutes = Math.round((h - Math.floor(h)) * 60);
      return `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;
    };
    return `${toHHMM(start)}-${toHHMM(end)}`;
  };

  useHeaderActions(
    <div className="md:hidden flex items-center bg-gray-100 rounded-full p-0.5 space-x-0.5">
      <button
        onClick={() => setView('takvim')}
        className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium text-[12px] transition-all ${view === 'takvim' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        Takvim
      </button>
      <button
        onClick={() => setView('liste')}
        className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium text-[12px] transition-all ${view === 'liste' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
            className={`whitespace-nowrap px-3 py-0.5 rounded-full font-medium text-sm transition-all min-w-[30px] ${view === 'takvim' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Takvim
          </button>
          <button
            onClick={() => setView('liste')}
            className={`whitespace-nowrap px-3 py-0.5 rounded-full font-medium text-sm transition-all min-w-[30px] ${view === 'liste' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Liste
          </button>
        </div>
      </div>

      {view === 'liste' && (
        <div className="space-y-3">
          {schedule.map((daySchedule, idx) => {
            const allTopicsCompleted = daySchedule.topics.length > 0 && daySchedule.topics.every(t => t.completed);
            const isExpanded = expandedDays.has(daySchedule.day);
            return (
              <div key={daySchedule.day} className={`border border-gray-300 rounded-lg bg-white transition-all overflow-hidden ${daySchedule.date === todayStr ? 'ring-1 ring-black border-black' : ''}`}>
                <div
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"
                  onClick={() => toggleDayExpansion(daySchedule.day)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${daySchedule.date === todayStr ? 'bg-black animate-pulse' : 'bg-gray-300'}`} />
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900">{daySchedule.day}</p>
                      <p className="text-xs font-medium text-gray-500">{daySchedule.date.split('-').reverse().slice(0, 2).join('.')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(daySchedule.day);
                      }}
                      className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${allTopicsCompleted ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'}`}
                    >
                      {allTopicsCompleted ? 'Tamamlandı' : 'Bitir'}
                    </button>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-400 transition-transform duration-300"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Konular (Accordion Content) */}
                {isExpanded && (
                  <div className="p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {daySchedule.topics.map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        onClick={() => toggleTopic(idx, tIdx)}
                        className={`p-2 rounded cursor-pointer transition-all border ${topic.completed
                          ? 'bg-gray-50 text-gray-400 border-transparent'
                          : 'bg-gray-50 text-gray-900 border-transparent hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className={`font-semibold text-xs flex-1 leading-tight ${topic.completed ? 'line-through opacity-50' : ''}`}>
                            {topic.name}
                          </p>
                          <span className="text-xs font-medium text-gray-500 shrink-0">
                            {formatTimeRange(topic.startHour || 9, topic.duration)}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 mt-1">{topic.duration}</p>
                      </div>
                    ))}

                    {/* Notlar */}
                    {daySchedule.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-xs font-semibold text-gray-500">Günün Notu</p>
                        </div>
                        <p className="text-xs text-gray-600 italic leading-relaxed pl-5">"{daySchedule.notes}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {view === 'takvim' && schedule[selectedIndex] && (
        <div className="bg-white border-[0.5px] border-gray-200 rounded-2xl p-3 md:p-5 mt-2 flex flex-col h-[calc(100dvh-100px)] md:h-[calc(100vh-130px)] overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <button onClick={prevDay} className="p-1 flex items-center justify-center text-gray-600 hover:text-black transition-colors shrink-0" aria-label="Önceki Gün">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-baseline gap-2 flex-1 justify-center">
              <p className="font-bold text-gray-900 text-base">{schedule[selectedIndex].day}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleEditDay(schedule[selectedIndex].day)} className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Düzelt">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21v-3.75L14.06 6.19a2 2 0 0 1 2.83 0l1.92 1.92a2 2 0 0 1 0 2.83L7.75 22H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button onClick={nextDay} className="p-1 flex items-center justify-center text-gray-600 hover:text-black transition-colors shrink-0" aria-label="Sonraki Gün">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
          <div className="flex-1 relative border-[0.5px] border-gray-100 rounded-xl bg-white overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="relative min-h-[1040px] w-full">
              <div className="absolute left-0 top-0 bottom-0 w-10 border-r-[0.5px] border-gray-100 bg-gray-50/50 z-10">
                {Array.from({ length: 17 }).map((_, i) => (
                  <div key={i} className="absolute w-full text-right pr-2 text-[10px] text-gray-300 font-medium" style={{ top: `${40 + i * 60}px`, transform: 'translateY(-50%)' }}>{7 + i}:00</div>
                ))}
              </div>
              <div className="absolute left-10 right-0 top-0 bottom-0">
                {Array.from({ length: 17 }).map((_, i) => (
                  <div key={i} className="absolute w-full border-t-[0.5px] border-gray-50" style={{ top: `${40 + i * 60}px` }} />
                ))}
              </div>
              <div className="absolute left-10 right-0 top-0 bottom-0">
                {schedule[selectedIndex].topics.map((topic, idx) => {
                  const startHour = topic.startHour || 9;
                  const durationHours = parseDurationHours(topic.duration);
                  const top = 40 + (startHour - 7) * 60;
                  const height = durationHours * 60;
                  return (
                    <div key={idx} className={`absolute left-1.5 right-1.5 rounded-lg border-[0.5px] px-3 py-2 text-xs transition-all hover:z-30 ${topic.completed ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-white border-gray-100 text-gray-800 border-l-2 border-l-black shadow-none'}`} style={{ top: `${top}px`, height: `${height}px`, minHeight: '36px' }}>
                      <div className="flex justify-between items-start h-full">
                        <div className="overflow-hidden leading-tight">
                          <p className={`font-semibold truncate ${topic.completed ? 'line-through opacity-70' : ''}`}>{topic.name} <span className="font-normal text-gray-500 ml-1">({topic.duration})</span></p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleTopic(selectedIndex, idx); }} className={`shrink-0 ml-1 p-1 rounded-full ${topic.completed ? 'text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                          {topic.completed ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>}
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

      {editingDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingDay} Düzeltme</h3>
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} placeholder="Notlarını yazın..." className="w-full h-32 border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditingDay(null)} className="flex-1 border border-gray-300 text-gray-900 py-2 rounded font-semibold hover:bg-gray-50 transition">İptal</button>
              <button onClick={() => handleSaveEdit(editingDay)} className="flex-1 bg-gray-900 text-white py-2 rounded font-semibold hover:bg-gray-800 transition">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 bg-black text-white text-[11px] font-semibold rounded-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl max-w-[90vw] text-center">
          <div className="flex items-center gap-3">
            {notification.type === 'error' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#FF4D4D" strokeWidth="2" /><path d="M12 8v4M12 16h.01" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}
