'use client';

import { useState, useEffect } from 'react';
import StatisticsView from './statistics-view';
import CoachView from './coach-view';

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
  const [activeTab, setActiveTab] = useState<Tab>('statistics');

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

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-6 flex justify-center">
        <div className="bg-gray-100 rounded-full p-1 flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('statistics')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all ${
              activeTab === 'statistics'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            İstatistik
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all ${
              activeTab === 'coach'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Koç
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'statistics' && <StatisticsView courses={courses} stats={stats} />}
        {activeTab === 'coach' && <CoachView />}
      </div>
    </div>
  );
}
