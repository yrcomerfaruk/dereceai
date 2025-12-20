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

  if (selectedItem) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Detail Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-900 hover:border-gray-900 transition-all shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hafta {selectedItem.week}</h2>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{selectedItem.createdAt.split('-').reverse().join('.')}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Başarı</p>
              <p className="text-xl font-bold text-gray-900">%{selectedItem.completion}</p>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-8">
          {selectedItem.schedule?.map((day, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] flex-1 bg-gray-100" />
                <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">{day.day}</p>
                <div className="h-[1px] flex-1 bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {day.topics.map((topic, tIdx) => (
                  <div
                    key={tIdx}
                    className={`group px-4 py-3.5 rounded-2xl transition-all border ${topic.completed
                      ? 'bg-white border-gray-100'
                      : 'bg-white border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${topic.completed ? 'bg-gray-200' : 'bg-gray-900 animate-pulse'}`} />
                        <p className={`text-sm font-semibold ${topic.completed ? 'text-gray-400' : 'text-gray-900'}`}>
                          {topic.name}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ${topic.completed ? 'text-gray-300' : 'text-gray-400'}`}>
                        {topic.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
            className="group relative bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-gray-900 transition-all"
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Hafta {item.week}</p>
                <p className="text-xs font-medium text-gray-400">{item.createdAt.split('-').reverse().join('.')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">%{item.completion}</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-lg shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

