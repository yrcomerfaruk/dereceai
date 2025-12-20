
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
      {/* İstatistikler - Rapor Formatı */}
      <div className="bg-gray-50/50 rounded-2xl p-4 mb-4 mt-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Haftalık Performans Raporu</h3>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            Şu anki genel ilerlemen <span className="text-black font-bold">%{stats.totalCompletion}</span> seviyesinde.
            Toplam <span className="text-black font-bold">{stats.totalTopics}</span> konudan
            <span className="text-black font-bold"> {stats.completedTopics}</span> tanesini başarıyla tamamladın.
            {stats.totalCompletion > 50 ? (
              " Harika bir tempo yakalamışsın! Bu hızla devam edersen hedeflerine planladığından daha erken ulaşabilirsin. Özellikle son çalıştığın konulardaki verimliliğin oldukça yüksek görünüyor."
            ) : (
              " Henüz yolun başındasın ama istikrarlı bir çalışma ile netlerini hızla artırabiliriz. Eksik olduğun konulara odaklanmaya ne dersin? Unutma, her büyük başarı küçük bir adımla başlar."
            )}
          </p>

          <div className="grid grid-cols-2 gap-4 text-[11px] text-gray-500 pt-3 border-t border-gray-100">
            <div className="space-y-1">
              <p className="uppercase tracking-wider font-bold text-gray-400">Ders Durumu</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-black" />
                <span>{courses.length} Aktif Ders</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="uppercase tracking-wider font-bold text-gray-400">Konu Takibi</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{stats.totalTopics - stats.completedTopics} Kalan Konu</span>
              </div>
            </div>
          </div>
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
