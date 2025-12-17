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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'schedule',
      label: 'Ders Programı',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'Geçmiş',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M21 12a9 9 0 1 1-3.5-7l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profilim',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'payments',
      label: 'Ödemeler',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="2" y="7" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.2" />
        </svg>
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
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <nav
        className={`w-44 bg-white text-gray-900 p-3 flex flex-col fixed inset-y-0 left-0 z-40 shadow-sm border-r transition-transform duration-300 transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h1 className="flex items-center px-2 py-2 mb-4 border-b border-gray-100">
          <Image src="/logo.png" alt="Company Logo" width={35} height={35} />
          <span className="text-lg font-semibold text-gray-900 ml-2">| Koç</span>
        </h1>
        <ul className="space-y-2 flex-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false); // Always close sidebar on mobile after navigation
                }}
                className={`w-full text-left px-2 py-2 rounded transition flex items-center gap-2 ${
                  currentPage === item.id
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 text-gray-900" style={{ display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-700 pt-4 text-xs text-gray-900">
          <p>Version 1.0</p>
        </div>
      </nav>

      <div className="flex flex-col flex-1 md:ml-44">
        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          {renderPage()}
        </main>
      </div>

      {/* Menu FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-black text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
