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
    // Enriched Mock History with schedules for all items
    const generateTopics = (count: number) =>
      Array.from({ length: count }).map((_, i) => ({
        name: `Konu ${i + 1}`,
        duration: `${Math.floor(Math.random() * 2) + 1} saat`,
        completed: Math.random() > 0.3
      }));

    const generateSchedule = () => [
      { day: 'Pazartesi', date: '2025-11-10', topics: generateTopics(3) },
      { day: 'Salı', date: '2025-11-11', topics: generateTopics(2) },
      { day: 'Çarşamba', date: '2025-11-12', topics: generateTopics(4) },
      { day: 'Perşembe', date: '2025-11-13', topics: generateTopics(3) },
      { day: 'Cuma', date: '2025-11-14', topics: generateTopics(2) },
    ];

    const mockHistory: ScheduleHistory[] = [
      { id: '1', week: 45, createdAt: '2025-11-10', completion: 75, daysScheduled: 7, schedule: generateSchedule() },
      { id: '2', week: 44, createdAt: '2025-11-03', completion: 65, daysScheduled: 7, schedule: generateSchedule() },
      { id: '3', week: 43, createdAt: '2025-10-27', completion: 45, daysScheduled: 7, schedule: generateSchedule() },
      { id: '4', week: 42, createdAt: '2025-10-20', completion: 50, daysScheduled: 7, schedule: generateSchedule() },
      { id: '5', week: 41, createdAt: '2025-10-13', completion: 35, daysScheduled: 7, schedule: generateSchedule() },
    ];
    setHistory(mockHistory);
  }, []);

  if (selectedItem) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Detail Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1.5 -ml-1.5 rounded-full text-gray-400 hover:text-black transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900">Hafta {selectedItem.week}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">İlerleme</p>
              <p className="text-lg font-black text-black">%{selectedItem.completion}</p>
            </div>
            <div className="text-right border-l border-gray-100 pl-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gün</p>
              <p className="text-lg font-black text-black">{selectedItem.daysScheduled}</p>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        {selectedItem.schedule && selectedItem.schedule.length > 0 ? (
          <div className="space-y-6">
            {selectedItem.schedule.map((day, idx) => (
              <div key={idx} className="transition-all">
                <div className="flex items-center justify-between mb-3 border-b-[0.5px] border-gray-50 pb-1">
                  <p className="text-xs font-bold text-black uppercase tracking-wider">{day.day}</p>
                  <p className="text-[9px] font-medium text-gray-300">{day.date}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {day.topics.map((topic, tIdx) => (
                    <div
                      key={tIdx}
                      className={`px-3 py-2.5 rounded-xl text-xs transition-all border-[0.5px] ${topic.completed
                        ? 'bg-white border-gray-50 text-gray-400'
                        : 'bg-white border-gray-100 border-l-2 border-l-black text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">
                          {topic.name}
                        </p>
                        <span className="text-[9px] font-bold text-gray-300">
                          {topic.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50/20 rounded-3xl border-[0.5px] border-dashed border-gray-200">
            <p className="text-gray-400 text-xs font-medium">Veri bulunmamaktadır.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white border-[0.5px] border-gray-200 rounded-2xl p-5 hover:border-black transition-all cursor-pointer overflow-hidden"
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hafta {item.week}</p>
                  <p className="text-lg font-bold text-black">{item.createdAt.split('-').reverse().join('.')}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Tamamlanma Oranı</p>
                  <span className="text-xs font-black text-black">%{item.completion}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-700 ease-out"
                    style={{ width: `${item.completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
