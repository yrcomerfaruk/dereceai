
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
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-3 transform transition-all hover:scale-[1.02] hover:shadow-md">
          <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-1">Genel İlerleme</p>
          <p className="text-2xl font-black text-gray-900 mb-2">{stats.totalCompletion}%</p>
          <div className="w-full bg-indigo-50 rounded-full h-1.5">
            <div
              className="h-1.5 bg-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.totalCompletion}%` }}
            />
          </div>
        </div>

        <div className="bg-white border-2 border-purple-500 rounded-lg p-3 transform transition-all hover:scale-[1.02] hover:shadow-md">
          <p className="text-purple-600 text-[10px] font-bold uppercase tracking-wider mb-1">Tamamlanan Konular</p>
          <p className="text-2xl font-black text-gray-900">
            {stats.completedTopics}/{stats.totalTopics}
          </p>
        </div>

        <div className="bg-white border-2 border-indigo-600 rounded-lg p-3 transform transition-all hover:scale-[1.02] hover:shadow-md">
          <p className="text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">Ders Sayısı</p>
          <p className="text-2xl font-black text-gray-900">{courses.length}</p>
        </div>
      </div>

      {/* Ders Özeti */}
      <div className="bg-white border border-gray-300 rounded-lg p-3">
        <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">Dersler Özeti</h3>
        <div className="space-y-2">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="pb-2 border-b border-gray-100 last:border-b-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-sm text-gray-900 font-medium flex-1">{course.name}</span>
                <span className="text-xs font-semibold text-gray-900 shrink-0">
                  %{course.completion}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${course.completion}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

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
