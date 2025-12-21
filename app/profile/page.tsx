'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../auth-provider';
import ClientOnlyDate from './client-date';

interface StudentProfile {
  name: string;
  targetScore: number;
  currentNet: number;
  examDate: string;
  weeklyHours: number;
  grade: string;
  department: string;
  teachers: { subject: string; name: string }[];
  books: { name: string; subject: string }[];
  completedTopics: number;
  totalTopics: number;
  studyStart: string;
  highschool: string;
  sessionLength: string;
  resources: string[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile>({
    name: 'Yükleniyor...',
    targetScore: 0,
    currentNet: 0,
    examDate: '2026-06-15',
    weeklyHours: 0,
    grade: '',
    department: '',
    teachers: [],
    books: [],
    completedTopics: 0,
    totalTopics: 100,
    studyStart: '',
    highschool: '',
    sessionLength: '',
    resources: [],
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const teacherNames: string[] = Array.isArray(data.teachers) ? data.teachers : [];
          const teacherObjects = teacherNames.map(t => ({ subject: 'Genel', name: t }));

          const bookNames: string[] = Array.isArray(data.books) ? data.books : [];
          const bookObjects = bookNames.map(b => ({ name: b, subject: 'TYT/AYT' }));

          const meta = data.metadata || {};

          setProfile({
            name: user.user_metadata?.full_name || data.email?.split('@')[0] || 'Öğrenci',
            targetScore: data.target_score || 0,
            currentNet: meta.nets?.current ? parseInt(meta.nets.current) : 0,
            examDate: data.exam_date || '2026-06-15',
            weeklyHours: data.weekly_hours || 0,
            grade: data.grade || '',
            department: data.department || '',
            teachers: teacherObjects,
            books: bookObjects,
            completedTopics: 12, // Placeholder
            totalTopics: 25, // Placeholder
            studyStart: meta.studyStart || '',
            highschool: meta.highschool || '',
            sessionLength: meta.sessionLength || '',
            resources: Array.isArray(meta.resources) ? meta.resources : [],
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleResetOnboarding = async () => {
    if (!user) return;
    if (confirm('Tüm ilerlemeniz sıfırlanacak ve onboarding ekranına döneceksiniz. Emin misiniz? ("profiles" tablosu güncellenecek)')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: false })
          .eq('id', user.id);

        if (error) throw error;

        localStorage.removeItem('onboardingData');
        window.location.reload();
      } catch (e) {
        console.error(e);
        alert("Sıfırlama başarısız oldu.");
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-black font-medium">Yükleniyor...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-3">
      {/* Üst Kısım Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Temel Bilgiler */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Kimlik Kartı</h3>
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">Genel</span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Adı</p>
              <p className="text-gray-900 text-sm font-semibold">{profile.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Sınıf</p>
                <p className="text-gray-900 text-sm">{profile.grade || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Alan</p>
                <p className="text-gray-900 text-sm">{profile.department || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hedef ve Performans */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Hedefler</h3>
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">Puan</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Hedef Puan</p>
              <p className="text-gray-900 text-2xl font-black">{profile.targetScore}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Şu Anki Net</p>
              <p className="text-gray-900 text-2xl font-black">{profile.currentNet}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Sınav Tarihi: <span className="text-gray-900 font-medium">{profile.examDate}</span>
          </div>
        </div>
      </div>

      {/* Orta Kısım Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Çalışma Düzeni */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <h3 className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">Çalışma Düzeni</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Haftalık Süre</p>
              <p className="text-gray-900 text-sm font-medium">{profile.weeklyHours} Saat</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Etüt Süresi</p>
              <p className="text-gray-900 text-sm font-medium">{profile.sessionLength || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Başlangıç Zamanı</p>
              <p className="text-gray-900 text-sm font-medium">{profile.studyStart || '-'}</p>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <h3 className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">İstatistikler</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-xs text-gray-500">Konu İlerlemesi</p>
                <p className="text-xs font-semibold text-gray-900">{profile.completedTopics}/{profile.totalTopics}</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 bg-black rounded-full" style={{ width: `${(profile.completedTopics / profile.totalTopics) * 100}%` }} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Kalan Gün</p>
              <ClientOnlyDate targetDate={profile.examDate} />
            </div>
          </div>
        </div>

        {/* Kaynaklar & Geçmiş */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <h3 className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">Detaylar</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Lise Durumu</p>
              <p className="text-gray-900 text-xs font-medium">{profile.highschool || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Kaynak Türleri</p>
              <div className="flex flex-wrap gap-1">
                {profile.resources.length > 0 ? profile.resources.map(r => (
                  <span key={r} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{r}</span>
                )) : <span className="text-gray-400 text-xs">-</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Kısım Grid - Öğretmenler ve Kitaplar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Öğretmenler */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Öğretmenler</h3>
            <span className="text-xs text-gray-500">{profile.teachers.length} Kişi</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {profile.teachers.map((teacher, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-100">
                <p className="font-semibold text-gray-900 text-xs truncate">{teacher.name}</p>
                <p className="text-gray-500 text-[10px]">{teacher.subject}</p>
              </div>
            ))}
            {profile.teachers.length === 0 && <p className="text-xs text-gray-400 col-span-2">Henüz öğretmen eklenmedi.</p>}
          </div>
        </div>

        {/* Kitaplar */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Kitaplar</h3>
            <span className="text-xs text-gray-500">{profile.books.length} Kitap</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {profile.books.map((book, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-100">
                <p className="font-semibold text-gray-900 text-xs truncate">{book.name}</p>
                <p className="text-gray-500 text-[10px]">{book.subject}</p>
              </div>
            ))}
            {profile.books.length === 0 && <p className="text-xs text-gray-400 col-span-2">Henüz kitap eklenmedi.</p>}
          </div>
        </div>
      </div>

      {/* Reset Button for Testing/Re-onboarding */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleResetOnboarding}
          className="text-gray-400 hover:text-red-600 text-[10px] transition-colors flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-3.5-7l-1 1" />
            <path d="M12 7v6l4 2" />
          </svg>
          Sıfırla
        </button>
      </div>
    </div>
  );
}
