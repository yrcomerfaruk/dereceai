'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
    id: string;
    question: string;
    type: 'single' | 'multiple' | 'subject-status' | 'teacher-select' | 'book-select' | 'net-input' | 'time-range' | 'week-schedule';
    options?: string[];
    department?: string;
}

const SUBJECTS = {
    Sayısal: ['TYT Türkçe', 'TYT Matematik', 'TYT Sosyal', 'TYT Fen', 'AYT Matematik', 'AYT Fen'],
    EA: ['TYT Türkçe', 'TYT Matematik', 'TYT Sosyal', 'TYT Fen', 'AYT Matematik', 'AYT Sosyal 1'],
};

const YOUTUBE_TEACHERS = ['Hakan Hoca', 'Ayşe Öğretmen', 'Mehmet Bey', 'Zeynep Hanım', 'Ali Hoca'];
const YKS_BOOKS = ['Limit Matematik', 'Karekök TYT', 'Palme Fizik', 'Apotemi Türkçe', '3D Kimya'];
const WEEK_DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function OnboardingPage({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [subjectStatus, setSubjectStatus] = useState<Record<string, string>>({});
    const [customInput, setCustomInput] = useState('');

    const getQuestions = (): Question[] => [
        { id: 'grade', question: 'Kaçıncı Sınıfsın?', type: 'single', options: ['12. Sınıf', 'Mezun'] },
        { id: 'department', question: 'Hangi Bölümsün?', type: 'single', options: ['Sayısal', 'EA'] },
        { id: 'highschool', question: 'Lise Hayatın Nasıl Geçti?', type: 'single', options: ['Verimsiz', 'Ortalama', 'Verimli'] },
        { id: 'studyStart', question: 'Sınava Çalışmaya Ne Zaman Başladın?', type: 'single', options: ['Başlamadım', 'Düzensiz Çalışıyorum', '3 ay', '6 ay', '1 yıl', 'Lise Başından'] },
        { id: 'subjectStatus', question: 'TYT ve AYT Konularında Ne Durumdasın?', type: 'subject-status', department: answers.department || 'Sayısal' },
        { id: 'resources', question: 'Destek Aldığın Kaynaklar', type: 'multiple', options: ['YouTube', 'Özel Ders', 'Dershane', 'Özel Uygulama'] },
        { id: 'teachers', question: 'Destek Aldığın Hocalar', type: 'teacher-select' },
        { id: 'books', question: 'Destek Aldığın Kitaplar', type: 'book-select' },
        { id: 'nets', question: 'Deneme Netlerin ve Hedefin', type: 'net-input' },
        { id: 'studyHours', question: 'Günlük Çalışma Saati ve Aralığı', type: 'time-range' },
        { id: 'sessionLength', question: 'Tek Oturuşta Etüt Uzunluğun', type: 'single', options: ['45 Dakika', '1 saat', '75 dakika', '1.5 saat', '2 saat'] },
        { id: 'weekSchedule', question: 'Hafta Başlangıcı ve Dinlenme Günün', type: 'week-schedule' },
    ];

    const questions = getQuestions();
    const currentQuestion = questions[currentStep];
    const progress = (currentStep / questions.length) * 100;

    const handleAnswer = (answer: any) => {
        setAnswers({ ...answers, [currentQuestion.id]: answer });

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
            setSelectedOptions([]);
            setSubjectStatus({});
            setCustomInput('');
        } else {
            localStorage.setItem('onboardingData', JSON.stringify({ ...answers, [currentQuestion.id]: answer }));
            if (onComplete) {
                onComplete();
            } else {
                router.push('/home');
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setSelectedOptions([]);
            setSubjectStatus({});
            setCustomInput('');
        }
    };

    const toggleMultiple = (option: string) => {
        setSelectedOptions(prev =>
            prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
        );
    };

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

            case 'multiple':
                return (
                    <div className="space-y-3">
                        {currentQuestion.options?.map((option) => (
                            <button
                                key={option}
                                onClick={() => toggleMultiple(option)}
                                className={`w-full p-3 text-left border-2 rounded-xl transition-all text-sm font-medium ${selectedOptions.includes(option)
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-100 hover:border-gray-900 hover:bg-gray-50 text-gray-900'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                        {selectedOptions.length > 0 && (
                            <button
                                onClick={() => handleAnswer(selectedOptions)}
                                className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                            >
                                <span>Devam Et</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}
                    </div>
                );

            case 'subject-status':
                const subjects = SUBJECTS[currentQuestion.department as keyof typeof SUBJECTS] || SUBJECTS.Sayısal;
                return (
                    <div className="space-y-4">
                        {subjects.map((subject) => (
                            <div key={subject} className="border border-gray-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-900 mb-2">{subject}</p>
                                <div className="flex gap-2">
                                    {['Bilmiyorum', 'Tekrar Yeterli', 'Biliyorum'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setSubjectStatus({ ...subjectStatus, [subject]: status })}
                                            className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${subjectStatus[subject] === status
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {Object.keys(subjectStatus).length === subjects.length && (
                            <button
                                onClick={() => handleAnswer(subjectStatus)}
                                className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                            >
                                <span>Devam Et</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}
                    </div>
                );

            case 'teacher-select':
            case 'book-select':
                const items = currentQuestion.type === 'teacher-select' ? YOUTUBE_TEACHERS : YKS_BOOKS;
                return (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <button
                                key={item}
                                onClick={() => toggleMultiple(item)}
                                className={`w-full p-3 text-left border-2 rounded-lg transition-all text-sm ${selectedOptions.includes(item)
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-200 hover:border-gray-900 hover:bg-gray-50 text-gray-900'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                        <div className="flex gap-2 mt-4">
                            <input
                                type="text"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Kendi ekle..."
                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none text-black transition-all"
                            />
                            <button
                                onClick={() => {
                                    if (customInput.trim()) {
                                        toggleMultiple(customInput.trim());
                                        setCustomInput('');
                                    }
                                }}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all"
                            >
                                Ekle
                            </button>
                        </div>
                        {selectedOptions.length > 0 && (
                            <button
                                onClick={() => handleAnswer(selectedOptions)}
                                className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                            >
                                <span>Devam Et</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}
                    </div>
                );

            case 'net-input':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Güncel Net</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-gray-900 focus:outline-none text-black transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Net</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-gray-900 focus:outline-none text-black transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => handleAnswer({ current: 0, target: 0 })}
                            className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                        >
                            <span>Devam Et</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                );

            case 'time-range':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-gray-900 focus:outline-none text-black transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-gray-900 focus:outline-none text-black transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => handleAnswer({ start: '09:00', end: '18:00' })}
                            className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                        >
                            <span>Devam Et</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                );

            case 'week-schedule':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Hafta Başlangıcı</label>
                            <select className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-gray-900 focus:outline-none text-black transition-all appearance-none bg-white">
                                {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Dinlenme Günü</label>
                            <select className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-gray-900 focus:outline-none text-black transition-all appearance-none bg-white">
                                {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => handleAnswer({ start: 'Pazartesi', rest: 'Pazar' })}
                            className="w-full py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-semibold mt-4 flex items-center justify-center gap-2 group"
                        >
                            <span>Tamamla</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                );

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
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:-translate-x-1 transition-transform">
                                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Geri Git</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
