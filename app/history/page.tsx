'use client';

import { useState, useEffect } from 'react';

interface ScheduleHistory {
  id: string;
  week: number;
  createdAt: string;
  completion: number;
  daysScheduled: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ScheduleHistory[]>([]);

  useEffect(() => {
    // Mock geçmiş programlar
    const mockHistory: ScheduleHistory[] = [
      {
        id: '1',
        week: 45,
        createdAt: '2025-11-10',
        completion: 75,
        daysScheduled: 7,
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
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Geçmiş Programlar
        </h2>
        <p className="text-gray-900">Önceki haftalarda oluşturulan ders programlarını gör</p>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="border border-gray-300 rounded-lg p-4 sm:p-6 hover:shadow-md transition cursor-pointer bg-white"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div>
                <p className="text-gray-900 text-sm font-semibold mb-1">Hafta</p>
                <p className="text-2xl font-bold text-gray-900">{item.week}</p>
              </div>

              <div>
                <p className="text-gray-900 text-sm font-semibold mb-1">Oluşturulma Tarihi</p>
                <p className="text-gray-900">{item.createdAt}</p>
              </div>

              <div>
                <p className="text-gray-900 text-sm font-semibold mb-1">İlerleme</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-300 rounded-full h-2">
                    <div
                      className="h-2 bg-gray-700 rounded-full"
                      style={{ width: `${item.completion}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">%{item.completion}</span>
                </div>
              </div>

              <div className="text-right">
                <button className="bg-gray-900 text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition text-sm">
                  Detay Gör
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
