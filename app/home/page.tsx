'use client';

import { useState, useEffect } from 'react';
import StatisticsView from './statistics-view';
import AIChatView from './ai-chat-view';
import { useHeaderActions } from '../header-context';

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

type Tab = 'statistics' | 'coach';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCompletion: 0,
    completedTopics: 0,
    totalTopics: 0,
  });
  const [activeTab, setActiveTab] = useState<Tab>('coach');

  useEffect(() => {
    // Fetch data only if the statistics tab is active, to avoid unnecessary calls
    if (activeTab === 'statistics') {
      fetch('/api/courses')
        .then((res) => res.json())
        .then((data) => {
          setCourses(data.courses);
          calculateStats(data.courses);
        });
    }
  }, [activeTab]);

  const calculateStats = (coursesData: Course[]) => {
    let totalCompletion = 0;
    let completedTopics = 0;
    let totalTopics = 0;

    coursesData.forEach((course) => {
      totalCompletion += course.completion;
      course.topics.forEach((topic) => {
        totalTopics++;
        if (topic.completion >= 100) completedTopics++;
      });
    });

    setStats({
      totalCompletion: coursesData.length > 0 ? Math.round(totalCompletion / coursesData.length) : 0,
      completedTopics,
      totalTopics,
    });
  };

  useHeaderActions(
    <div className="md:hidden flex items-center bg-gray-100 rounded-full p-0.5 space-x-0.5">
      <button
        onClick={() => setActiveTab('coach')}
        className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium text-[12px] transition-all ${activeTab === 'coach'
          ? 'bg-white text-gray-800 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        Koç
      </button>
      <button
        onClick={() => setActiveTab('statistics')}
        className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium text-[12px] transition-all ${activeTab === 'statistics'
          ? 'bg-white text-gray-800 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        İstatistik
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="hidden md:flex mb-3 justify-end items-center">
        <div className="bg-gray-100 rounded-full p-0.5 flex items-center space-x-0.5">
          <button
            onClick={() => setActiveTab('coach')}
            className={`whitespace-nowrap px-3 py-0.5 rounded-full font-medium text-sm transition-all min-w-[30px] ${activeTab === 'coach'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Koç
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`whitespace-nowrap px-3 py-0.5 rounded-full font-medium text-sm transition-all min-w-[30px] ${activeTab === 'statistics'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            İstatistik
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'statistics' && <StatisticsView courses={courses} stats={stats} />}
        {activeTab === 'coach' && <AIChatView />}
      </div>
    </div>
  );
}
