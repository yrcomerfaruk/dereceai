
'use client';

interface Topic {
  name: string;
  completion: number;
}

interface Course {
  id: string;
  name: string;
  completion: number;
  topics: Topic[];
}

interface Stats {
  totalCompletion: number;
  completedTopics: number;
  totalTopics: number;
}

interface StatisticsViewProps {
  courses: Course[];
  stats: Stats;
}

export default function StatisticsView({ courses, stats }: StatisticsViewProps) {
  return (
    <>
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white border-2 border-black rounded-lg p-3">
          <p className="text-black text-[10px] font-bold uppercase tracking-wider mb-1">Genel İlerleme</p>
          <p className="text-2xl font-black text-black mb-2">{stats.totalCompletion}%</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 bg-black rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.totalCompletion}%` }}
            />
          </div>
        </div>

        <div className="bg-white border-2 border-gray-900 rounded-lg p-3">
          <p className="text-gray-900 text-[10px] font-bold uppercase tracking-wider mb-1">Tamamlanan Konular</p>
          <p className="text-2xl font-black text-black">
            {stats.completedTopics}/{stats.totalTopics}
          </p>
        </div>

        <div className="bg-white border-2 border-gray-800 rounded-lg p-3">
          <p className="text-gray-800 text-[10px] font-bold uppercase tracking-wider mb-1">Ders Sayısı</p>
          <p className="text-2xl font-black text-black">{courses.length}</p>
        </div>
      </div>

      {/* Ders Özeti Removed */}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}
