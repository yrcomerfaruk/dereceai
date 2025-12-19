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
    // Mock geçmiş programlar
    const mockHistory: ScheduleHistory[] = [
      {
        id: '1',
        week: 45,
        createdAt: '2025-11-10',
        completion: 75,
        daysScheduled: 7,
        schedule: [
          {
            day: 'Pazartesi',
            date: '2025-11-10',
            topics: [
              { name: 'Matematik - Türev', duration: '2 saat', completed: true },
              { name: 'Fizik - Kuvvet', duration: '1.5 saat', completed: true },
              { name: 'Kimya - Mol Kavramı', duration: '1 saat', completed: false },
            ],
          },
          {
            day: 'Salı',
            date: '2025-11-11',
            topics: [
              { name: 'Türkçe - Anlatım', duration: '1 saat', completed: true },
              { name: 'Tarih - Osmanlı', duration: '2 saat', completed: true },
            ],
          },
          {
            day: 'Çarşamba',
            date: '2025-11-12',
            topics: [
              { name: 'Geometri - Üçgenler', duration: '2 saat', completed: false },
              { name: 'Biyoloji - Hücre', duration: '1.5 saat', completed: true },
            ],
          },
        ],
      },
      {
        id: '2',
        week: 44,
        createdAt: '2025-11-03',
        completion: 65,
        daysScheduled: 7,
      },
      {
        id: '3',
        week: 43,
        createdAt: '2025-10-27',
        completion: 45,
        daysScheduled: 7,
      },
      {
        id: '4',
        week: 42,
        createdAt: '2025-10-20',
        completion: 50,
        daysScheduled: 7,
      },
      {
        id: '5',
        week: 41,
        createdAt: '2025-10-13',
        completion: 35,
        daysScheduled: 7,
      },
    ];
    setHistory(mockHistory);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="border border-gray-300 rounded-lg p-3 hover:shadow-md transition cursor-pointer bg-white"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Hafta {item.week}</p>
                  <p className="text-xs text-gray-600">{item.createdAt}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-800 transition"
                >
                  Detay
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">İlerleme</p>
                  <span className="text-xs font-semibold text-gray-900">%{item.completion}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 bg-gray-700 rounded-full"
                    style={{ width: `${item.completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
              <div>
                <h2 className="text-base font-bold text-gray-900">Hafta {selectedItem.week}</h2>
                <p className="text-xs text-gray-500">{selectedItem.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">İlerleme</p>
                  <p className="text-xl font-bold text-gray-900">%{selectedItem.completion}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Planlanan Gün</p>
                  <p className="text-xl font-bold text-gray-900">{selectedItem.daysScheduled}</p>
                </div>
              </div>

              {/* Schedule */}
              {selectedItem.schedule && selectedItem.schedule.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Haftalık Program</h3>
                  {selectedItem.schedule.map((day, idx) => (
                    <div key={idx} className="border border-gray-300 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{day.day}</p>
                          <p className="text-xs text-gray-500">{day.date}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {day.topics.map((topic, tIdx) => (
                          <div
                            key={tIdx}
                            className={`p-2 rounded-lg text-xs transition-all ${topic.completed
                                ? 'bg-gray-50 text-gray-400'
                                : 'bg-white text-gray-700 border border-gray-200'
                              }`}
                          >
                            <p className={`font-medium ${topic.completed ? 'line-through' : ''}`}>
                              {topic.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{topic.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Bu hafta için detaylı program bilgisi bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
