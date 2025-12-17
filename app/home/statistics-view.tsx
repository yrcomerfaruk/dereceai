
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
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Hoşgeldin
        </h2>
        <p className="text-sm sm:text-base text-gray-900">
          Bugünkü ders programını gör ve ilerleme takip et
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-2">Genel İlerleme</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stats.totalCompletion}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-gray-800 rounded-full"
              style={{ width: `${stats.totalCompletion}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-2">Tamamlanan Konular</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900">
            {stats.completedTopics}/{stats.totalTopics}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-2">Ders Sayısı</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900">{courses.length}</p>
        </div>
      </div>

      {/* Ders Özeti */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Dersler Özeti</h3>
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-200 last:border-b-0 gap-2">
              <span className="text-sm sm:text-base text-gray-800 font-medium">{course.name}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gray-800 rounded-full"
                    style={{ width: `${course.completion}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-800 w-10">
                  %{course.completion}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
