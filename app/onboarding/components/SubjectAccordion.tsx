import { useState } from 'react';

interface Subject {
    id: string;
    name: string;
    topics: string[];
}

export type TopicStatus = 0 | 1 | 2; // 0: Bilmiyorum, 1: Tekrar, 2: Biliyorum

interface SubjectAccordionProps {
    subject: Subject;
    topicStatuses: Record<string, TopicStatus>;
    onTopicStatusChange: (topic: string, status: TopicStatus) => void;
    onBulkStatusChange: (status: TopicStatus) => void;
}

export function SubjectAccordion({
    subject,
    topicStatuses,
    onTopicStatusChange,
    onBulkStatusChange,
}: SubjectAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Calculate stats
    const totalTopics = subject.topics.length;
    const knownCount = Object.values(topicStatuses).filter(s => s === 2).length;
    const reviewCount = Object.values(topicStatuses).filter(s => s === 1).length;

    // Percent completed (Weighted: Review is 50%, Known is 100% of 'knowing')
    // User requested "0, 2, 4" weighting style, which maps to 0, 0.5, 1.
    const percent = Math.round(((knownCount + reviewCount * 0.5) / totalTopics) * 100);

    return (
        <div className={`border rounded-xl overflow-hidden transition-all duration-300 bg-white ${isOpen ? 'border-black shadow-sm' : 'border-gray-200'
            }`}>
            {/* Header */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-4 flex flex-wrap items-center justify-between cursor-pointer select-none group gap-2"
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 md:text-lg text-base group-hover:text-black transition-colors">{subject.name}</h3>

                    {/* Status Badge */}
                    {(knownCount > 0 || reviewCount > 0) && (
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                            %{percent}
                        </span>
                    )}
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                    {/* Bulk Actions (visible when open) */}
                    {isOpen && (
                        <div className="flex gap-1 md:mr-2" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => onBulkStatusChange(0)}
                                className="px-2 py-1.5 md:py-1 text-[10px] font-bold border border-gray-200 rounded hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <span className="hidden md:inline">SIFIRLA</span>
                                <span className="md:hidden">✕</span>
                            </button>
                            <button
                                onClick={() => onBulkStatusChange(2)}
                                className="px-2 py-1.5 md:py-1 text-[10px] font-bold border border-black bg-black text-white rounded hover:bg-gray-800 transition-colors"
                            >
                                <span className="hidden md:inline">TAMAMLA</span>
                                <span className="md:hidden">✓</span>
                            </button>
                        </div>
                    )}

                    <div className={`transform transition-transform duration-300 text-gray-400 group-hover:text-black ${isOpen ? 'rotate-180' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-2 md:px-4 pb-4 space-y-0.5">
                    <div className="h-px bg-gray-100 w-full mb-2" />

                    {subject.topics.map((topic) => {
                        const status = topicStatuses[topic] || 0;
                        return (
                            <div key={topic} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg group/item transition-colors">
                                <span className={`text-sm font-medium transition-colors ${status !== 0 ? 'text-black' : 'text-gray-500'
                                    }`}>
                                    {topic}
                                </span>

                                <div className="flex items-center gap-1">
                                    {/* 0: Bilmiyorum */}
                                    <button
                                        onClick={() => onTopicStatusChange(topic, 0)}
                                        className={`w-8 h-8 rounded flex items-center justify-center transition-all ${status === 0
                                            ? 'text-gray-400 bg-gray-100'
                                            : 'text-gray-200 hover:text-gray-400'
                                            }`}
                                        title="Bilmiyorum / Çalışmadım"
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full border-2 border-current" />
                                    </button>

                                    {/* 1: Tekrar (Refresh Icon) */}
                                    <button
                                        onClick={() => onTopicStatusChange(topic, 1)}
                                        className={`w-8 h-8 rounded flex items-center justify-center transition-all ${status === 1
                                            ? 'text-black bg-gray-100'
                                            : 'text-gray-200 hover:text-black'
                                            }`}
                                        title="Tekrar Gerekli"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 4v6h-6" />
                                            <path d="M1 20v-6h6" />
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                        </svg>
                                    </button>

                                    {/* 2: Biliyorum */}
                                    <button
                                        onClick={() => onTopicStatusChange(topic, 2)}
                                        className={`w-8 h-8 rounded flex items-center justify-center transition-all ${status === 2
                                            ? 'text-black bg-gray-100'
                                            : 'text-gray-200 hover:text-black'
                                            }`}
                                        title="Tamamlandı"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
