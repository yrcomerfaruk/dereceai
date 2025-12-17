'use client';

import { useState, useEffect } from 'react';

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
  const [profile, setProfile] = useState<StudentProfile>({
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

  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleSave = () => {
    setProfile(tempProfile);
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  const handleAddTeacher = () => {
    setTempProfile({
      ...tempProfile,
      teachers: [...tempProfile.teachers, { subject: '', name: '' }],
    });
  };

  const handleAddBook = () => {
    setTempProfile({
      ...tempProfile,
      books: [...tempProfile.books, { name: '', subject: '' }],
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Profilim
        </h1>
        <button
          onClick={() => (editMode ? handleSave() : setEditMode(true))}
          className="bg-gray-900 text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition text-sm"
        >
          {editMode ? '✓ Kaydet' : '✏ Düzenle'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temel Bilgiler */}
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-300">
            Temel Bilgiler
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Adı
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              ) : (
                <p className="text-gray-900">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Hedef Puan
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={tempProfile.targetScore}
                  onChange={(e) => handleInputChange('targetScore', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              ) : (
                <p className="text-gray-900">{profile.targetScore}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Sınav Tarihi
              </label>
              {editMode ? (
                <input
                  type="date"
                  value={tempProfile.examDate}
                  onChange={(e) => handleInputChange('examDate', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              ) : (
                <p className="text-gray-900">{profile.examDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Haftalık Çalışma Saati
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={tempProfile.weeklyHours}
                  onChange={(e) => handleInputChange('weeklyHours', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              ) : (
                <p className="text-gray-900">{profile.weeklyHours} saat</p>
              )}
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-300">
            İlerleme
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">Tamamlanan Konular</p>
                <p className="text-sm font-bold text-gray-900">
                  {profile.completedTopics}/{profile.totalTopics}
                </p>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className="h-3 bg-gray-700 rounded-full"
                  style={{
                    width: `${(profile.completedTopics / profile.totalTopics) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Sınavaya Kalan Gün</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.ceil(
                  (new Date(profile.examDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Öğretmenler */}
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-300">
            <h3 className="text-lg font-bold text-gray-900">Öğretmenler</h3>
            {editMode && (
              <button
                onClick={handleAddTeacher}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 px-2 py-1 rounded transition"
              >
                + Ekle
              </button>
            )}
          </div>
          <div className="space-y-3">
            {(editMode ? tempProfile : profile).teachers.map((teacher, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded">
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={teacher.subject}
                      placeholder="Ders"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 mb-2"
                    />
                    <input
                      type="text"
                      value={teacher.name}
                      placeholder="Hoca Adı"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                    />
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 text-sm">{teacher.subject}</p>
                    <p className="text-gray-900 text-sm">{teacher.name}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kitaplar */}
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-300">
            <h3 className="text-lg font-bold text-gray-900">Kitaplar</h3>
            {editMode && (
              <button
                onClick={handleAddBook}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 px-2 py-1 rounded transition"
              >
                + Ekle
              </button>
            )}
          </div>
          <div className="space-y-3">
            {(editMode ? tempProfile : profile).books.map((book, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded">
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={book.name}
                      placeholder="Kitap Adı"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 mb-2"
                    />
                    <input
                      type="text"
                      value={book.subject}
                      placeholder="Ders"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                    />
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 text-sm">{book.name}</p>
                    <p className="text-gray-900 text-sm">{book.subject}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {editMode && (
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setEditMode(false)}
            className="flex-1 border border-gray-300 text-gray-900 py-2 rounded font-semibold hover:bg-gray-50 transition"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gray-900 text-white py-2 rounded font-semibold hover:bg-gray-800 transition"
          >
            Kaydet
          </button>
        </div>
      )}
    </div>
  );
}
