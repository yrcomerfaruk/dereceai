'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../auth-provider';
import ClientOnlyDate from './client-date';
import subjectsData from '../onboarding/subjects.json';

interface StudentProfile {
  name: string;
  // Separate Nets
  targetNetTYT: number;
  targetNetAYT: number;
  currentNetTYT: number;
  currentNetAYT: number;

  examDate: string;
  weeklyHours: number;
  grade: string;
  department: string;
  teachers: { subject: string; name: string }[];
  books: { name: string; subject: string }[];
  completedTopics: number;
  totalTopics: number;
  studyStart: string;
  studyEnd?: string; // Edit support
  highschool: string;
  sessionLength: string;
  sessionDetails?: {
    session: number;
    break: number;
    lunch: number;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Base profile state
  const [profile, setProfile] = useState<StudentProfile>({
    name: 'Yükleniyor...',
    targetNetTYT: 0,
    targetNetAYT: 0,
    currentNetTYT: 0,
    currentNetAYT: 0,
    examDate: '2026-06-21',
    weeklyHours: 0,
    grade: '',
    department: '',
    teachers: [],
    books: [],
    completedTopics: 0,
    totalTopics: 100,
    studyStart: '',
    studyEnd: '',
    highschool: '',
    sessionLength: '',
  });

  // Edit buffer
  const [editForm, setEditForm] = useState<StudentProfile>({ ...profile });

  // Resource Edit Logic
  const [newResource, setNewResource] = useState<{ type: 'teacher' | 'book', subject: string, name: string }>({ type: 'teacher', subject: '', name: '' });

  // Filter subjects for dropdown
  const allSubjects = subjectsData;

  // Helpers
  const getSubjectName = (id: string) => {
    const sub = subjectsData.find(s => s.id === id);
    return sub ? sub.name : id;
  };

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
          const meta = data.metadata || {};

          // Calculate Nets
          const calculateNet = (netRecord: Record<string, number> = {}, prefix: 'tyt' | 'ayt') => {
            return Object.entries(netRecord)
              .filter(([key]) => key.startsWith(prefix))
              .reduce((sum, [, val]) => sum + (Number(val) || 0), 0);
          };

          const currentNets = meta.nets?.current || {};
          const targetNets = meta.nets?.target || {};

          // Resources
          const teachers: { subject: string, name: string }[] = [];
          const books: { name: string, subject: string }[] = [];

          if (meta.subjectResources) {
            Object.entries(meta.subjectResources).forEach(([subjectId, res]: [string, any]) => {
              const subjectName = getSubjectName(subjectId);
              if (res.teachers && Array.isArray(res.teachers)) res.teachers.forEach((t: string) => teachers.push({ subject: subjectName, name: t }));
              if (res.books && Array.isArray(res.books)) res.books.forEach((b: string) => books.push({ subject: subjectName, name: b }));
            });
          }

          // Topic Stats
          const relevantSubjects = subjectsData.filter(s => {
            if (s.category === 'TYT') return true;
            if (s.category === 'AYT') {
              if (data.department === 'Sayısal') return ['ayt-matematik', 'ayt-geometri', 'ayt-fizik', 'ayt-kimya', 'ayt-biyoloji'].includes(s.id);
              if (data.department === 'EA') return ['ayt-matematik', 'ayt-geometri', 'ayt-edebiyat', 'ayt-tarih', 'ayt-cografya', 'ayt-din'].includes(s.id);
            }
            return false;
          });

          const totalTopicsCount = relevantSubjects.flatMap(s => s.topics).length;
          let completedWeighted = 0;
          if (meta.proficiency) {
            Object.values(meta.proficiency).forEach((subjectStatus: any) => {
              Object.values(subjectStatus).forEach((status: any) => {
                if (status === 2) completedWeighted += 1;
                if (status === 1) completedWeighted += 0.5;
              });
            });
          }

          const state = {
            name: user.user_metadata?.full_name || data.email?.split('@')[0] || 'Öğrenci',
            targetNetTYT: calculateNet(targetNets, 'tyt'),
            targetNetAYT: calculateNet(targetNets, 'ayt'),
            currentNetTYT: calculateNet(currentNets, 'tyt'),
            currentNetAYT: calculateNet(currentNets, 'ayt'),
            examDate: '2026-06-21',
            weeklyHours: data.weekly_hours || 0,
            grade: data.grade || '',
            department: data.department || '',
            teachers: teachers,
            books: books,
            completedTopics: Math.round(completedWeighted),
            totalTopics: totalTopicsCount || 100,
            studyStart: meta.studyDetails?.startTime || '',
            studyEnd: meta.studyDetails?.endTime || '',
            highschool: meta.highschool || '',
            sessionLength: meta.sessionDetails?.sessionLength ? `${meta.sessionDetails.sessionLength} dk` : '',
            sessionDetails: {
              session: meta.sessionDetails?.sessionLength || 50,
              break: meta.sessionDetails?.breakLength || 10,
              lunch: meta.sessionDetails?.lunchBreak || 60
            }
          };
          setProfile(state);
          setEditForm(state);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleAddResource = (type: 'teacher' | 'book') => {
    if (!newResource.name || !newResource.subject) return;

    const subjectName = getSubjectName(newResource.subject);

    if (type === 'teacher') {
      setEditForm(prev => ({
        ...prev,
        teachers: [...prev.teachers, { subject: subjectName, name: newResource.name }]
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        books: [...prev.books, { subject: subjectName, name: newResource.name }]
      }));
    }
    setNewResource({ type, subject: '', name: '' });
  };

  const handleRemoveResource = (type: 'teacher' | 'book', index: number) => {
    if (type === 'teacher') {
      setEditForm(prev => ({
        ...prev,
        teachers: prev.teachers.filter((_, i) => i !== index)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        books: prev.books.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { data: currentData } = await supabase.from('profiles').select('metadata').eq('id', user.id).single();
      const currentMeta = currentData?.metadata || {};

      const newSubjectResources: Record<string, { teachers: string[], books: string[] }> = {};

      const findSubjectIdByName = (name: string) => {
        const sub = subjectsData.find(s => s.name === name);
        return sub ? sub.id : 'other';
      };

      editForm.teachers.forEach(t => {
        const subId = findSubjectIdByName(t.subject);
        if (!newSubjectResources[subId]) newSubjectResources[subId] = { teachers: [], books: [] };
        newSubjectResources[subId].teachers.push(t.name);
      });

      editForm.books.forEach(b => {
        const subId = findSubjectIdByName(b.subject);
        if (!newSubjectResources[subId]) newSubjectResources[subId] = { teachers: [], books: [] };
        newSubjectResources[subId].books.push(b.name);
      });

      const updatedMeta = {
        ...currentMeta,
        grade: editForm.grade,
        department: editForm.department,
        highschool: editForm.highschool,
        studyDetails: {
          ...currentMeta.studyDetails,
          startTime: editForm.studyStart,
          endTime: editForm.studyEnd
        },
        sessionDetails: {
          sessionLength: editForm.sessionDetails?.session,
          breakLength: editForm.sessionDetails?.break,
          lunchBreak: editForm.sessionDetails?.lunch
        },
        subjectResources: newSubjectResources
      };

      const { error } = await supabase.from('profiles').update({
        grade: editForm.grade,
        department: editForm.department,
        weekly_hours: editForm.weeklyHours,
        metadata: updatedMeta,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      if (error) throw error;

      setProfile(editForm);
      setIsEditing(false);
    } catch (e) {
      console.error("Update failed", e);
      alert("Güncelleme başarısız oldu.");
    }
  };

  const handleResetOnboarding = async () => {
    if (!user) return;
    if (confirm('Tüm ilerlemeniz sıfırlanacak ve onboarding ekranına döneceksiniz. Emin misiniz?')) {
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-3 pb-8">
      {/* Header & Edit Actions */}
      <div className="flex justify-between items-center px-1">
        <h1 className="text-xl font-black text-black tracking-tight">Profilim</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-bold text-black border border-gray-300 rounded-lg hover:bg-black hover:text-white transition-colors">Vazgeç</button>
              <button onClick={handleSave} className="px-3 py-1.5 text-xs font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors">Kaydet</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="p-2 text-black hover:bg-gray-100 transition-colors rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Temel Bilgiler */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-black">Kimlik Kartı</h3>
            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold">Genel</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-black font-bold mb-0.5">Adı</p>
              <p className="text-black text-sm font-bold">{profile.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-black font-bold mb-0.5">Sınıf</p>
                {isEditing ? (
                  <select
                    value={editForm.grade}
                    onChange={e => setEditForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full p-1.5 text-sm font-bold text-black border border-gray-300 rounded focus:border-black focus:outline-none"
                  >
                    <option value="12. Sınıf">12. Sınıf</option>
                    <option value="Mezun">Mezun</option>
                  </select>
                ) : (
                  <p className="text-black text-sm font-medium">{profile.grade || '-'}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-black font-bold mb-0.5">Alan</p>
                {isEditing ? (
                  <select
                    value={editForm.department}
                    onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-1.5 text-sm font-bold text-black border border-gray-300 rounded focus:border-black focus:outline-none"
                  >
                    <option value="Sayısal">Sayısal</option>
                    <option value="EA">EA</option>
                  </select>
                ) : (
                  <p className="text-black text-sm font-medium">{profile.department || '-'}</p>
                )}
              </div>
            </div>
            <div className="pt-1">
              <p className="text-xs text-black font-bold mb-0.5">Lise Durumu</p>
              {isEditing ? (
                <select
                  value={editForm.highschool}
                  onChange={e => setEditForm(prev => ({ ...prev, highschool: e.target.value }))}
                  className="w-full p-1.5 text-sm font-bold text-black border border-gray-300 rounded focus:border-black focus:outline-none"
                >
                  <option value="Verimsiz">Verimsiz</option>
                  <option value="Ortalama">Ortalama</option>
                  <option value="Verimli">Verimli</option>
                </select>
              ) : (
                <p className="text-black text-xs font-bold">{profile.highschool || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Hedef ve Performans */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white flex flex-col">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-black">Net Durumu</h3>
            <ClientOnlyDate targetDate={profile.examDate} />
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* TYT Column */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col justify-center h-full">
              <h4 className="text-xs font-black text-black mb-2 text-center uppercase tracking-widest">TYT</h4>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs text-black font-bold">Hedef</span>
                <span className="text-xl font-black text-black">{profile.targetNetTYT}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-black font-bold">Şu An</span>
                <span className="text-xl font-black text-black">{profile.currentNetTYT}</span>
              </div>
            </div>

            {/* AYT Column */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col justify-center h-full">
              <h4 className="text-xs font-black text-black mb-2 text-center uppercase tracking-widest">AYT</h4>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs text-black font-bold">Hedef</span>
                <span className="text-xl font-black text-black">{profile.targetNetAYT}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-black font-bold">Şu An</span>
                <span className="text-xl font-black text-black">{profile.currentNetAYT}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orta Kısım Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Çalışma Düzeni */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <h3 className="text-sm font-bold text-black mb-2 pb-2 border-b border-gray-200">Çalışma Düzeni</h3>
          <div className="grid grid-cols-3 gap-2 items-start">
            <div className="bg-gray-50 p-2 rounded h-full bg-white border border-gray-200">
              <p className="text-[10px] text-black font-bold mb-0.5">Haftalık</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.weeklyHours}
                  onChange={e => setEditForm(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
                  className="w-full text-sm font-black text-black bg-white border border-gray-300 rounded p-1 focus:border-black focus:outline-none"
                />
              ) : (
                <p className="text-black text-sm font-black">{profile.weeklyHours} Saat</p>
              )}
            </div>
            <div className="bg-gray-50 p-2 rounded col-span-2 h-full bg-white border border-gray-200">
              <p className="text-[10px] text-black font-bold mb-0.5">Günlük Aralık</p>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={editForm.studyStart}
                    onChange={e => setEditForm(prev => ({ ...prev, studyStart: e.target.value }))}
                    className="flex-1 text-sm bg-white font-bold text-black border border-gray-300 rounded p-1 focus:border-black focus:outline-none"
                  />
                  <span className="text-black font-bold">-</span>
                  <input
                    type="time"
                    value={editForm.studyEnd}
                    onChange={e => setEditForm(prev => ({ ...prev, studyEnd: e.target.value }))}
                    className="flex-1 text-sm bg-white font-bold text-black border border-gray-300 rounded p-1 focus:border-black focus:outline-none"
                  />
                </div>
              ) : (
                <p className="text-black text-sm font-black">{profile.studyStart} - {profile.studyEnd}</p>
              )}
            </div>
          </div>

          {profile.sessionDetails && (
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="border border-gray-200 rounded p-1">
                <span className="block text-[10px] text-black font-bold mb-1">Etüt</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.sessionDetails?.session}
                    onChange={e => setEditForm(prev => ({ ...prev, sessionDetails: { ...prev.sessionDetails!, session: parseInt(e.target.value) || 0 } }))}
                    className="w-full text-center text-sm font-black text-black border border-gray-300 rounded p-0.5 focus:border-black focus:outline-none"
                  />
                ) : (
                  <span className="font-black text-sm text-black">{profile.sessionDetails.session}dk</span>
                )}
              </div>
              <div className="border border-gray-200 rounded p-1">
                <span className="block text-[10px] text-black font-bold mb-1">Mola</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.sessionDetails?.break}
                    onChange={e => setEditForm(prev => ({ ...prev, sessionDetails: { ...prev.sessionDetails!, break: parseInt(e.target.value) || 0 } }))}
                    className="w-full text-center text-sm font-black text-black border border-gray-300 rounded p-0.5 focus:border-black focus:outline-none"
                  />
                ) : (
                  <span className="font-black text-sm text-black">{profile.sessionDetails.break}dk</span>
                )}
              </div>
              <div className="border border-gray-200 rounded p-1">
                <span className="block text-[10px] text-black font-bold mb-1">Öğle</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.sessionDetails?.lunch}
                    onChange={e => setEditForm(prev => ({ ...prev, sessionDetails: { ...prev.sessionDetails!, lunch: parseInt(e.target.value) || 0 } }))}
                    className="w-full text-center text-sm font-black text-black border border-gray-300 rounded p-0.5 focus:border-black focus:outline-none"
                  />
                ) : (
                  <span className="font-black text-sm text-black">{profile.sessionDetails.lunch}dk</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Konu İlerlemesi (Basitleştirilmiş) */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-black">Konu İlerlemesi</h3>
            <span className="text-xs font-black text-black">{profile.completedTopics} / {profile.totalTopics}</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
            <div
              className="h-full bg-black rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (profile.completedTopics / profile.totalTopics) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-black font-bold text-center">Tüm TYT ve AYT konuları baz alınmıştır.</p>
        </div>
      </div>

      {/* Alt Kısım Grid - Öğretmenler ve Kitaplar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Öğretmenler */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-black">Takip Edilen Hocalar</h3>
            <span className="text-xs font-bold text-black">{(isEditing ? editForm.teachers : profile.teachers).length} Kişi</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {(isEditing ? editForm.teachers : profile.teachers).map((teacher, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-200 relative group">
                <p className="font-black text-black text-xs truncate" title={teacher.name}>{teacher.name}</p>
                <p className="text-black font-bold text-[10px] truncate">{teacher.subject}</p>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveResource('teacher', idx)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[10px]"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {(isEditing ? editForm.teachers : profile.teachers).length === 0 && <p className="text-xs text-black font-bold col-span-2">Henüz öğretmen eklenmedi.</p>}
          </div>

          {isEditing && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <select
                  value={newResource.type === 'teacher' ? newResource.subject : ''}
                  onChange={e => setNewResource({ type: 'teacher', subject: e.target.value, name: newResource.name })}
                  className="w-full p-1.5 text-xs font-bold text-black border border-gray-300 rounded focus:border-black focus:outline-none"
                >
                  <option value="">Ders Seçiniz</option>
                  {allSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Hoca Adı..."
                    value={newResource.type === 'teacher' ? newResource.name : ''}
                    onChange={e => setNewResource({ type: 'teacher', subject: newResource.subject, name: e.target.value })}
                    className="flex-1 p-1.5 text-xs font-bold text-black border border-gray-300 rounded focus:border-black focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleAddResource('teacher')}
                  />
                  <button onClick={() => handleAddResource('teacher')} className="bg-black text-white px-3 rounded text-xs font-bold">+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kitaplar */}
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-black">Kaynak Kitaplar</h3>
            <span className="text-xs font-bold text-black">{(isEditing ? editForm.books : profile.books).length} Kitap</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {(isEditing ? editForm.books : profile.books).map((book, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-200 relative group">
                <p className="font-black text-black text-xs truncate" title={book.name}>{book.name}</p>
                <p className="text-black font-bold text-[10px] truncate">{book.subject}</p>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveResource('book', idx)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[10px]"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {(isEditing ? editForm.books : profile.books).length === 0 && <p className="text-xs text-black font-bold col-span-2">Henüz kitap eklenmedi.</p>}
          </div>

          {isEditing && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <select
                  value={newResource.type === 'book' ? newResource.subject : ''}
                  onChange={e => setNewResource({ type: 'book', subject: e.target.value, name: newResource.name })}
                  className="w-full p-1.5 text-xs font-bold text-black border border-gray-300 rounded focus:border-black focus:outline-none"
                >
                  <option value="">Ders Seçiniz</option>
                  {allSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kitap Adı..."
                    value={newResource.type === 'book' ? newResource.name : ''}
                    onChange={e => setNewResource({ type: 'book', subject: newResource.subject, name: e.target.value })}
                    className="flex-1 p-1.5 text-xs font-bold text-black border border-gray-300 rounded focus:border-black focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleAddResource('book')}
                  />
                  <button onClick={() => handleAddResource('book')} className="bg-black text-white px-3 rounded text-xs font-bold">+</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleResetOnboarding}
          className="text-black font-bold hover:text-red-600 text-[10px] transition-colors flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3.5-7l-1 1" /><path d="M12 7v6l4 2" /></svg>
          Sıfırla
        </button>
      </div>
    </div>
  );
}
