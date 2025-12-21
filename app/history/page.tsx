'use client';

import { useState, useEffect } from 'react';

interface Topic {
  name: string;
  duration: string;
  completed: boolean;
}

interface DaySchedule {
  day: string;
  date: string;
  topics: Topic[];
}

interface ScheduleHistory {
  id: string;
  week: number;
  createdAt: string;
  completion: number;
  daysScheduled: number;
  schedule?: DaySchedule[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ScheduleHistory[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScheduleHistory | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    const mockHistory: ScheduleHistory[] = [
      {
        id: '1',
        week: 51,
        createdAt: '2025-12-15',
        completion: 88,
        daysScheduled: 7,
        schedule: [
          { day: 'Pazartesi', date: '15.12', topics: [{ name: 'TYT Türkçe - Paragraf', duration: '1 saat', completed: true }, { name: 'TYT Mat - Sayılar', duration: '1 saat', completed: true }] },
          { day: 'Salı', date: '16.12', topics: [{ name: 'AYT Mat - Polinomlar', duration: '1 saat', completed: true }, { name: 'TYT Fizik - Hareket', duration: '1 saat', completed: false }] },
          { day: 'Çarşamba', date: '17.12', topics: [{ name: 'TYT Kimya - Atom', duration: '1 saat', completed: true }, { name: 'TYT Biyo - Hücre', duration: '1 saat', completed: true }] },
        ]
      },
      {
        id: '2',
        week: 50,
        createdAt: '2025-12-08',
        completion: 72,
        daysScheduled: 7,
        schedule: [
          { day: 'Pazartesi', date: '08.12', topics: [{ name: 'TYT Mat - Rasyonel', duration: '1 saat', completed: true }, { name: 'TYT Türkçe - Yazım', duration: '1 saat', completed: true }] },
          { day: 'Salı', date: '09.12', topics: [{ name: 'TYT Fizik - Madde', duration: '1 saat', completed: true }, { name: 'TYT Tarih', duration: '1 saat', completed: false }] },
        ]
      },
      {
        id: '3',
        week: 49,
        createdAt: '2025-12-01',
        completion: 95,
        daysScheduled: 7,
        schedule: [
          { day: 'Pazartesi', date: '01.12', topics: [{ name: 'TYT Türkçe - Noktalama', duration: '1 saat', completed: true }, { name: 'TYT Mat - Bölme', duration: '1 saat', completed: true }] },
        ]
      }
    ];
    setHistory(mockHistory);
  }, []);

  const toggleDay = (idx: number) => {
    setExpandedDay(expandedDay === idx ? null : idx);
  };

  if (selectedItem) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
        {/* Detail Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedItem(null)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Hafta {selectedItem.week}</h2>
              <p className="text-xs text-gray-500">{selectedItem.createdAt.split('-').reverse().join('.')}</p>
            </div>
          </div>

          <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Başarı</span>
            <span className="text-sm font-bold">%{selectedItem.completion}</span>
          </div>
        </div>

        {/* Schedule List (Accordion) */}
        <div className="space-y-3">
          {selectedItem.schedule?.map((day, idx) => {
            const isOpen = expandedDay === idx;
            return (
              <div key={idx} className={`border rounded-lg transition-all ${isOpen ? 'border-gray-300 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <button
                  onClick={() => toggleDay(idx)}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-black' : 'bg-gray-300'}`} />
                    <p className="text-sm font-bold text-gray-900">{day.day}</p>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {day.topics.map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        className="bg-gray-50 p-2.5 rounded-lg flex items-center gap-3"
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${topic.completed ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                          {topic.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                        </div>
                        <p className={`text-xs font-semibold ${topic.completed ? 'text-gray-900' : 'text-gray-900'}`}>
                          {topic.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-gray-900 transition-all"
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
              <div>
                <p className="text-sm font-bold text-gray-900">Hafta {item.week}</p>
                <p className="text-xs text-gray-500">{item.createdAt.split('-').reverse().join('.')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">%{item.completion}</p>
              </div>
              <div className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded hover:bg-gray-900 hover:text-white transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

