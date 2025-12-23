'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import subjectsData from './subjects.json';
import { SubjectAccordion, TopicStatus } from './components/SubjectAccordion';
import { NetInput } from './components/NetInput';

interface Question {
    id: string;
    question: string;
    type: 'single' | 'multiple' | 'subject-proficiency' | 'teacher-select' | 'book-select' | 'net-input' | 'study-details' | 'session-details' | 'week-schedule';
    options?: string[];
    department?: string;
    category?: 'TYT' | 'AYT';
}

const WEEK_DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const NET_GROUPS = {
    TYT: [
        { id: 'tyt-turkce', name: 'Türkçe', max: 40 },
        { id: 'tyt-sosyal', name: 'Sosyal', max: 20 },
        { id: 'tyt-matematik', name: 'Matematik', max: 40 },
        { id: 'tyt-fen', name: 'Fen', max: 20 },
    ],
    AYT: {
        Sayısal: [
            { id: 'ayt-matematik', name: 'Matematik', max: 40 },
            { id: 'ayt-fizik', name: 'Fizik', max: 14 },
            { id: 'ayt-kimya', name: 'Kimya', max: 13 },
            { id: 'ayt-biyoloji', name: 'Biyoloji', max: 13 },
        ],
        EA: [
            { id: 'ayt-matematik', name: 'Matematik', max: 40 },
            { id: 'ayt-edebiyat', name: 'Edebiyat', max: 24 },
            { id: 'ayt-tarih', name: 'Tarih', max: 10 },
            { id: 'ayt-cografya', name: 'Coğrafya', max: 6 },
        ]
    }
};

export default function OnboardingPage({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});

    // 3-state proficiency: { 'subjectId': { 'topicName': 0 | 1 | 2 } }
    const [proficiency, setProficiency] = useState<Record<string, Record<string, TopicStatus>>>({});

    // Resources tagged by subject: { 'subjectId': { teachers: [], books: [] } }
    const [subjectResources, setSubjectResources] = useState<Record<string, { teachers: string[], books: string[] }>>({});

    // UI state for resource stepping
    const [selectedResourceSubject, setSelectedResourceSubject] = useState<string>('');
    const [customInput, setCustomInput] = useState('');

    // Study Details State
    const [studyDetails, setStudyDetails] = useState({
        dailyHours: 6,
        startTime: '09:00',
        endTime: '22:00'
    });

    // Session Details State
    const [sessionDetails, setSessionDetails] = useState({
        sessionLength: 50, // Etüt Uzunluğu
        breakLength: 10,  // Ders Arası
        lunchBreak: 60    // Öğle Arası
    });

    const [weekSchedule, setWeekSchedule] = useState({
        startDay: 'Pazartesi',
        restDay: 'Pazar'
    });

    // Net states
    const [currentNets, setCurrentNets] = useState<Record<string, number>>({});
    const [targetNets, setTargetNets] = useState<Record<string, number>>({});

    const department = answers.department || 'Sayısal';

    const getQuestions = (): Question[] => [
        { id: 'grade', question: 'Kaçıncı Sınıfsın?', type: 'single', options: ['12. Sınıf', 'Mezun'] },
        { id: 'department', question: 'Hangi Bölümsün?', type: 'single', options: ['Sayısal', 'EA'] },
        { id: 'highschool', question: 'Lise Hayatın Nasıl Geçti?', type: 'single', options: ['Verimsiz', 'Ortalama', 'Verimli'] },
        { id: 'studyStart', question: 'Sınava Çalışmaya Ne Zaman Başladın?', type: 'single', options: ['Başlamadım', 'Düzensiz Çalışıyorum', '3 ay', '6 ay', '1 yıl', 'Lise Başından'] },

        { id: 'tytProficiency', question: 'TYT Konularında Ne Durumdasın?', type: 'subject-proficiency', category: 'TYT' },
        { id: 'aytProficiency', question: 'AYT Konularında Ne Durumdasın?', type: 'subject-proficiency', category: 'AYT', department },

        { id: 'teachers', question: 'Takip Ettiğin YouTube Kanalları / Hocalar', type: 'teacher-select' },
        { id: 'books', question: 'Kullandığın Kaynak Kitaplar', type: 'book-select' },

        { id: 'nets', question: 'Deneme Netlerin ve Hedefin', type: 'net-input' },

        { id: 'studyDetails', question: 'Çalışma Düzenin', type: 'study-details' },
        { id: 'sessionDetails', question: 'Etüt ve Mola Sürelerin', type: 'session-details' },
        { id: 'weekSchedule', question: 'Haftalık Programın', type: 'week-schedule' },
    ];

    const questions = getQuestions();
    const currentQuestion = questions[currentStep];
    const progress = (currentStep / questions.length) * 100;

    // Get all relevant subjects for dropdowns
    const allSubjects = useMemo(() => {
        return subjectsData.filter(s => {
            if (s.category === 'AYT') {
                if (department === 'Sayısal') {
                    return ['ayt-matematik', 'ayt-geometri', 'ayt-fizik', 'ayt-kimya', 'ayt-biyoloji'].includes(s.id);
                } else if (department === 'EA') {
                    return ['ayt-matematik', 'ayt-geometri', 'ayt-edebiyat', 'ayt-tarih', 'ayt-cografya', 'ayt-din'].includes(s.id);
                }
            }
            // Include TYT subjects too
            return true;
        });
    }, [department]);

    // Initialize dropdown if empty when entering resource steps
    useEffect(() => {
        if ((currentQuestion.type === 'teacher-select' || currentQuestion.type === 'book-select') && !selectedResourceSubject && allSubjects.length > 0) {
            setSelectedResourceSubject(allSubjects[0].id);
        }
    }, [currentQuestion, allSubjects, selectedResourceSubject]);

    const handleAnswer = async (answer: any) => {
        const newAnswers = { ...answers, [currentQuestion.id]: answer };
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
            setCustomInput('');
        } else {
            // Final Step: Save to Supabase
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Kullanıcı oturumu bulunamadı.");

                const profileData = {
                    id: user.id,
                    email: user.email,
                    grade: newAnswers.grade,
                    department: newAnswers.department,
                    target_score: 0,
                    exam_date: '2026-06-15',
                    weekly_hours: studyDetails.dailyHours * 6, // Approx weekly
                    teachers: [],
                    books: [],
                    onboarding_completed: true,
                    updated_at: new Date().toISOString(),
                    metadata: {
                        ...newAnswers,
                        proficiency,
                        subjectResources,
                        nets: { current: currentNets, target: targetNets },
                        studyDetails: newAnswers.studyDetails,
                        sessionDetails: newAnswers.sessionDetails,
                        weekSchedule: newAnswers.weekSchedule
                    }
                };

                const { error } = await supabase
                    .from('profiles')
                    .upsert(profileData);

                if (error) throw error;
                localStorage.setItem('onboardingData', JSON.stringify(profileData));

                if (onComplete) {
                    onComplete();
                } else {
                    router.push('/home');
                }
            } catch (error) {
                console.error("Onboarding kaydetme hatası:", error);
                alert("Veriler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setCustomInput('');
        }
    };

    // --- Helpers ---
    const handleTopicStatusChange = (subjectId: string, topic: string, status: TopicStatus) => {
        setProficiency(prev => {
            const subjectData = prev[subjectId] || {};
            return { ...prev, [subjectId]: { ...subjectData, [topic]: status } };
        });
    };

    const handleBulkStatusChange = (subject: any, status: TopicStatus) => {
        setProficiency(prev => {
            const newSubjectData: Record<string, TopicStatus> = {};
            subject.topics.forEach((t: string) => {
                newSubjectData[t] = status;
            });
            return { ...prev, [subject.id]: newSubjectData };
        });
    };

    const handleAddResource = (type: 'teachers' | 'books', value: string) => {
        if (!selectedResourceSubject || !value) return;
        setSubjectResources(prev => {
            const subjRes = prev[selectedResourceSubject] || { teachers: [], books: [] };
            if (subjRes[type].includes(value)) return prev;
            return {
                ...prev,
                [selectedResourceSubject]: { ...subjRes, [type]: [...subjRes[type], value] }
            };
        });
    };

    const handleRemoveResource = (type: 'teachers' | 'books', value: string, subjectId: string) => {
        setSubjectResources(prev => {
            const subjRes = prev[subjectId] || { teachers: [], books: [] };
            return {
                ...prev,
                [subjectId]: {
                    ...subjRes,
                    [type]: subjRes[type].filter(v => v !== value)
                }
            };
        });
    }

    const currentSubjects = useMemo(() => {
        if (currentQuestion.type !== 'subject-proficiency') return [];
        return subjectsData.filter(s => {
            if (s.category !== currentQuestion.category) return false;
            if (s.category === 'AYT') {
                if (department === 'Sayısal') {
                    return ['ayt-matematik', 'ayt-geometri', 'ayt-fizik', 'ayt-kimya', 'ayt-biyoloji'].includes(s.id);
                } else if (department === 'EA') {
                    return ['ayt-matematik', 'ayt-geometri', 'ayt-edebiyat', 'ayt-tarih', 'ayt-cografya', 'ayt-din'].includes(s.id);
                }
            }
            return true;
        });
    }, [currentQuestion, department]);

    const renderQuestion = () => {
        switch (currentQuestion.type) {
            case 'single':
                return (
                    <div className="space-y-3">
                        {currentQuestion.options?.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className="w-full p-3 text-left border-2 border-gray-100 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all text-gray-900 text-sm font-medium"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                );
            case 'subject-proficiency':
                return (
                    <div className="space-y-4">
                        {currentSubjects.map((subject) => (
                            <SubjectAccordion
                                key={subject.id}
                                subject={subject}
                                topicStatuses={proficiency[subject.id] || {}}
                                onTopicStatusChange={(topic, status) => handleTopicStatusChange(subject.id, topic, status)}
                                onBulkStatusChange={(status) => handleBulkStatusChange(subject, status)}
                            />
                        ))}
                        <button
                            onClick={() => handleAnswer(true)}
                            className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                        >
                            <span>Devam Et</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                );

            case 'teacher-select':
            case 'book-select':
                const resourceType = currentQuestion.type === 'teacher-select' ? 'teachers' : 'books';
                const placeholder = currentQuestion.type === 'teacher-select' ? 'Hoca ekle...' : 'Kitap ekle...';
                const hasAnySelection = Object.values(subjectResources).some(res => res[resourceType].length > 0);

                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Ders Seç</label>
                            <div className="relative">
                                <select
                                    value={selectedResourceSubject}
                                    onChange={(e) => setSelectedResourceSubject(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-black bg-white appearance-none font-medium pr-10"
                                >
                                    {allSubjects.map(subj => (
                                        <option key={subj.id} value={subj.id}>{subj.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder={placeholder}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-black transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customInput.trim()) {
                                        handleAddResource(resourceType, customInput.trim());
                                        setCustomInput('');
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (customInput.trim()) {
                                        handleAddResource(resourceType, customInput.trim());
                                        setCustomInput('');
                                    }
                                }}
                                className="px-5 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all flex items-center justify-center"
                            >
                                <span className="text-xl leading-none mb-0.5">+</span>
                            </button>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase">Seçilenler</h4>
                            <div className="space-y-3">
                                {allSubjects.map(subj => {
                                    const resources = subjectResources[subj.id]?.[resourceType] || [];
                                    if (resources.length === 0) return null;

                                    return (
                                        <div key={subj.id} className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                                            <p className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">{subj.name}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {resources.map(res => (
                                                    <span key={res} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-black shadow-sm">
                                                        {res}
                                                        <button
                                                            onClick={() => handleRemoveResource(resourceType, res, subj.id)}
                                                            className="text-gray-400 hover:text-red-500 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                                {!hasAnySelection && (
                                    <p className="text-sm text-gray-400 italic">Henüz seçim yapılmadı.</p>
                                )}
                            </div>
                        </div>

                        {(hasAnySelection || true) && (
                            <button
                                onClick={() => handleAnswer(subjectResources)} // Save simplified if needed, or just proceed
                                className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-8 flex items-center justify-center gap-2 group"
                            >
                                <span>Devam Et</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        )}
                    </div>
                );

            case 'net-input':
                const tytGroups = NET_GROUPS.TYT;
                const aytGroups = department === 'EA' ? NET_GROUPS.AYT.EA : NET_GROUPS.AYT.Sayısal;

                return (
                    <div className="space-y-4">
                        <div className="bg-white px-2 py-4 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4 px-2">TYT Netler</h3>
                            <NetInput
                                groups={tytGroups}
                                currentNets={currentNets}
                                targetNets={targetNets}
                                onCurrentChange={(id, val) => setCurrentNets(prev => ({ ...prev, [id]: val }))}
                                onTargetChange={(id, val) => setTargetNets(prev => ({ ...prev, [id]: val }))}
                            />
                        </div>

                        <div className="bg-white px-2 py-4 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4 px-2">AYT Netler</h3>
                            <NetInput
                                groups={aytGroups}
                                currentNets={currentNets}
                                targetNets={targetNets}
                                onCurrentChange={(id, val) => setCurrentNets(prev => ({ ...prev, [id]: val }))}
                                onTargetChange={(id, val) => setTargetNets(prev => ({ ...prev, [id]: val }))}
                            />
                        </div>

                        <button
                            onClick={() => handleAnswer({ current: currentNets, target: targetNets })}
                            className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                        >
                            <span>Devam Et</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                );

            case 'study-details':
                return (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3">Günlük Ortalama Çalışma (Saat)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="0"
                                    max="16"
                                    value={studyDetails.dailyHours}
                                    onChange={(e) => setStudyDetails(prev => ({ ...prev, dailyHours: parseInt(e.target.value) || 0 }))}
                                    className="w-20 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-center font-bold text-lg text-black"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="14"
                                    step="1"
                                    value={studyDetails.dailyHours}
                                    onChange={(e) => setStudyDetails(prev => ({ ...prev, dailyHours: parseInt(e.target.value) || 0 }))}
                                    className="flex-1 accent-black h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Başlangıç Saati</label>
                                <input
                                    type="time"
                                    value={studyDetails.startTime}
                                    onChange={(e) => setStudyDetails(prev => ({ ...prev, startTime: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-black font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Bitiş Saati</label>
                                <input
                                    type="time"
                                    value={studyDetails.endTime}
                                    onChange={(e) => setStudyDetails(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-black font-medium"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => handleAnswer(studyDetails)}
                            className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                        >
                            <span>Devam Et</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                );

            case 'session-details':
                return (
                    <div className="space-y-8">
                        {/* Session Length */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-900">Etüt Uzunluğu</label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[30, 40, 45, 50, 60, 90].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setSessionDetails(prev => ({ ...prev, sessionLength: val }))}
                                        className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${sessionDetails.sessionLength === val
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                                            }`}
                                    >
                                        {val} dk
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Break Length */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-900">Ders Arası</label>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[5, 10, 15, 20].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setSessionDetails(prev => ({ ...prev, breakLength: val }))}
                                        className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${sessionDetails.breakLength === val
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                                            }`}
                                    >
                                        {val} dk
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lunch Break */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-900">Öğle Arası</label>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[30, 45, 60, 90].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setSessionDetails(prev => ({ ...prev, lunchBreak: val }))}
                                        className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${sessionDetails.lunchBreak === val
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                                            }`}
                                    >
                                        {val} dk
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => handleAnswer(sessionDetails)}
                            className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                        >
                            <span>Devam Et</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                );

            case 'week-schedule':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Hafta Başlangıcı</label>
                            <select
                                value={weekSchedule.startDay}
                                onChange={(e) => setWeekSchedule(prev => ({ ...prev, startDay: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-black transition-all appearance-none bg-white font-medium"
                            >
                                {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Dinlenme Günü</label>
                            <select
                                value={weekSchedule.restDay}
                                onChange={(e) => setWeekSchedule(prev => ({ ...prev, restDay: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-black transition-all appearance-none bg-white font-medium"
                            >
                                {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => handleAnswer(weekSchedule)}
                            className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                        >
                            <span>Tamamla</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                        </button>
                    </div>
                );
            case 'multiple': return null;

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Top Navigation */}
            <div className="py-1 px-4 flex items-center justify-between min-h-[28px]">
                <div className="w-8 h-8 flex items-center justify-center" /> {/* Spacer */}

                <div className="text-[10px] font-bold text-gray-400 tracking-widest leading-none">
                    {Math.round(progress)}% TAMAMLANDI
                </div>

                <div className="w-8 h-8 flex items-center justify-center" /> {/* Spacer */}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-0.5 bg-gray-100">
                <div
                    className="h-full bg-black transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-start pt-8 md:pt-12 px-6">
                <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Question Number */}
                    <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">
                        Soru {currentStep + 1} / {questions.length}
                    </p>

                    {/* Question */}
                    <h1 className="text-xl md:text-2xl font-black text-black mb-6 leading-tight">
                        {currentQuestion.question}
                    </h1>

                    {/* Dynamic Question Rendering */}
                    <div className="min-h-[250px]">
                        {renderQuestion()}
                    </div>

                    {/* Back Button at Bottom */}
                    {currentStep > 0 && (
                        <div className="flex justify-center mt-12 pb-8">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-6 py-2.5 text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-all group font-medium border border-gray-100"
                                aria-label="Geri git"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                <span>Geri Git</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
