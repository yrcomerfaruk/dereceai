'use client';

import Image from 'next/image';
import { useState } from 'react';
import HomePage from './home/page';
import SchedulePage from './schedule/page';
import HistoryPage from './history/page';
import ProfilimPage from './profile/page';
import PaymentsPage from './payments/page';
import OnboardingPage from './onboarding/page';
import { HeaderProvider, useHeaderActionsDisplay } from './header-context';

type PageType = 'home' | 'schedule' | 'history' | 'profile' | 'payments' | 'onboarding';

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

export default function ClientLayout() {
  return (
    <HeaderProvider>
      <ClientLayoutInner />
    </HeaderProvider>
  );
}

function ClientLayoutInner() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Check onboarding on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('onboardingData');
      if (data) {
        setOnboardingComplete(true);
      } else {
        setOnboardingComplete(false);
        setCurrentPage('onboarding');
      }
    }
  });

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    setCurrentPage('home');
  };

  // navItems moved to module scope


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
        return <ProfilimPage />;
      case 'onboarding':
        return <OnboardingPage onComplete={handleOnboardingComplete} />;
    }
  };

  const currentPageLabel = navItems.find((item) => item.id === currentPage)?.label;

  return (
    <div className="flex h-[100dvh] md:min-h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      {!onboardingComplete && currentPage === 'onboarding' ? null : (
        <nav
          className={`w-44 bg-white text-gray-900 p-3 flex flex-col fixed inset-y-0 left-0 z-[100] shadow-sm border-r transition-transform duration-300 transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex items-center justify-between mb-4 px-1 py-1">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs ring-2 ring-gray-100 overflow-hidden ml-1">
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <ul className="space-y-2 flex-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false); // Always close sidebar on mobile after navigation
                  }}
                  className={`w-full text-left px-2 py-2 rounded transition flex items-center gap-2 ${currentPage === item.id
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
      )}

      <div className={`flex flex-col flex-1 ${!onboardingComplete && currentPage === 'onboarding' ? '' : 'md:ml-44'} overflow-hidden relative h-full`}>
        <HeaderArea onboardingComplete={onboardingComplete} currentPage={currentPage} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className={`flex-1 ${!onboardingComplete && currentPage === 'onboarding' ? 'p-0' : 'p-3 pb-8 pt-16 sm:p-4 md:p-6 md:pb-6 md:pt-6'} overflow-y-auto`}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function HeaderArea({ onboardingComplete, currentPage, setSidebarOpen }: any) {
  const headerActions = useHeaderActionsDisplay();

  if (!onboardingComplete && currentPage === 'onboarding') return null;

  return (
    <div className="md:hidden fixed top-0 inset-x-0 h-12 bg-white/80 backdrop-blur-md border-b border-gray-100 z-[60] flex items-center px-4">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-1.5 -ml-1.5 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8h16M4 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="ml-1 text-sm font-semibold text-gray-900">
        {navItems.find(item => item.id === currentPage)?.label}
      </div>
      <div className="flex-1" />
      <div className="flex items-center">
        {headerActions}
      </div>
    </div>
  );
}
