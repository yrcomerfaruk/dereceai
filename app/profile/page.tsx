'use client';

import { useState } from 'react';

interface StudentProfile {
  name: string;
  targetScore: number;
  examDate: string;
  weeklyHours: number;
  teachers: { subject: string; name: string }[];
  books: { name: string; subject: string }[];
  completedTopics: number;
  totalTopics: number;
}

export default function ProfilePage() {
  const [profile] = useState<StudentProfile>({
    name: 'Öğrenci',
    targetScore: 500,
    examDate: '2025-06-15',
    weeklyHours: 30,
    teachers: [
      { subject: 'Matematik', name: 'Prof. Ahmet Yılmaz' },
      { subject: 'Türkçe', name: 'Yrd. Doç. Ayşe Kaya' },
      { subject: 'Fen', name: 'Dr. Mehmet Öz' },
    ],
    books: [
      { name: 'Matematik Ön Bilgiler', subject: 'Matematik' },
      { name: 'Türkçe Okuma Parçaları', subject: 'Türkçe' },
      { name: 'Kimya Reaksiyonları', subject: 'Fen' },
    ],
    completedTopics: 12,
    totalTopics: 25,
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Temel Bilgiler */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Temel Bilgiler</h3>
            <button className="text-gray-400 hover:text-gray-700 text-xs transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21v-3.75L14.06 6.19a2 2 0 0 1 2.83 0l1.92 1.92a2 2 0 0 1 0 2.83L7.75 22H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Adı</p>
              <p className="text-gray-900 text-sm">{profile.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Hedef Puan</p>
              <p className="text-gray-900 text-sm">{profile.targetScore}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Sınav Tarihi</p>
              <p className="text-gray-900 text-sm">{profile.examDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Haftalık Çalışma Saati</p>
              <p className="text-gray-900 text-sm">{profile.weeklyHours} saat</p>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <h3 className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">
            İlerleme
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-xs text-gray-500">Tamamlanan Konular</p>
                <p className="text-xs font-semibold text-gray-900">
                  {profile.completedTopics}/{profile.totalTopics}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-gray-700 rounded-full"
                  style={{
                    width: `${(profile.completedTopics / profile.totalTopics) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Sınavaya Kalan Gün</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.ceil(
                  (new Date(profile.examDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Öğretmenler */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Öğretmenler</h3>
            <button className="text-gray-400 hover:text-gray-700 text-xs transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21v-3.75L14.06 6.19a2 2 0 0 1 2.83 0l1.92 1.92a2 2 0 0 1 0 2.83L7.75 22H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {profile.teachers.map((teacher, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded">
                <p className="font-semibold text-gray-900 text-xs">{teacher.subject}</p>
                <p className="text-gray-600 text-xs">{teacher.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kitaplar */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Kitaplar</h3>
            <button className="text-gray-400 hover:text-gray-700 text-xs transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21v-3.75L14.06 6.19a2 2 0 0 1 2.83 0l1.92 1.92a2 2 0 0 1 0 2.83L7.75 22H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {profile.books.map((book, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded">
                <p className="font-semibold text-gray-900 text-xs">{book.name}</p>
                <p className="text-gray-600 text-xs">{book.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Button for Testing/Re-onboarding */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            if (confirm('Tüm verileriniz sıfırlanacak ve onboarding tekrar başlayacak. Emin misiniz?')) {
              localStorage.removeItem('onboardingData');
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-all border border-gray-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12a9 9 0 1 1-3.5-7l-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Onboarding'i Sıfırla ve Yeniden Başlat
        </button>
      </div>
    </div>
  );
}
