'use client';

import Image from 'next/image';
import { useState } from 'react';
import HomePage from './home/page';
import SchedulePage from './schedule/page';
import HistoryPage from './history/page';
import ProfilePage from './profile/page';
import PaymentsPage from './payments/page';

type PageType = 'home' | 'schedule' | 'history' | 'profile' | 'payments';

export default function ClientLayout() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ),
    },
    {
      id: 'schedule',
      label: 'Ders Programı',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      ),
    },
    {
      id: 'history',
      label: 'Geçmiş',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12a9 9 0 1 1-3.5-7l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profilim',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ),
    },
    {
      id: 'payments',
      label: 'Ödemeler',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" /></svg>
      ),
    },
  ] as const;

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'schedule':
        return <SchedulePage />;
      case 'history':
        return <HistoryPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'profile':
        return <ProfilePage />;
    }
  };

  const currentPageLabel = navItems.find((item) => item.id === currentPage)?.label;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
                    md:translate-x-0 ${
                      sidebarOpen
                        ? 'translate-x-0 w-56' // Mobile Open, Desktop Expanded
                        : '-translate-x-full w-56 md:w-20' // Mobile Closed, Desktop Collapsed
                    }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
            <Image src="/logo.png" alt="Company Logo" width={32} height={32} />
            <span className={`ml-3 text-lg font-semibold text-gray-800 transition-opacity duration-200 ${!sidebarOpen && 'md:opacity-0 md:invisible'}`}>
              | Koç
            </span>
          </div>

          <ul className="flex-1 space-y-2 p-3 overflow-y-auto">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`w-full text-left rounded-md transition-colors duration-200 flex items-center gap-3 p-2 ${
                    currentPage === item.id
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={item.label}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className={`transition-opacity duration-200 ${!sidebarOpen && 'md:opacity-0 md:invisible'}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full text-left rounded-md transition-colors duration-200 flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 4l-8 8 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${sidebarOpen && 'rotate-180'}`} />
                </svg>
              </div>
              <span className={`transition-opacity duration-200 ${!sidebarOpen && 'md:opacity-0 md:invisible'}`}>
                Menüyü Daralt
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'md:ml-56' : 'md:ml-20'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-600 mr-4"
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {currentPageLabel}
          </h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
