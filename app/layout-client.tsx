'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import HomePage from './home/page';
import SchedulePage from './schedule/page';
import HistoryPage from './history/page';
import ProfilimPage from './profile/page';
import PaymentsPage from './payments/page';
import OnboardingPage from './onboarding/page';
import LoginPage from './login/page';
import AuthProvider, { useAuth } from './auth-provider';
import { supabase } from '@/lib/supabase';
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
    <AuthProvider>
      <HeaderProvider>
        <ClientLayoutInner />
      </HeaderProvider>
    </AuthProvider>
  );
}

function ClientLayoutInner() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkProfile() {
      if (authLoading) return;

      if (!user) {
        // If not logged in, and not separately on login page (which we are handling via conditional render below for simplicity or routing)
        // Actually, since we control 'currentPage' state manually here for SPA feel, we need to handle "Login" as a state or let Next.js router handle it.
        // Current architecture: SPA-like structure for main app, but Login is a separate route '/login'.
        // If we are on /login, we shouldn't redirect.
        // But this component RenderPage renders components.
        return;
      }

      // Check profile in Supabase
      // Check profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (data && data.onboarding_completed) {
        setOnboardingComplete(true);
        // Sync local storage just in case or rely purely on DB
        localStorage.setItem('onboardingData', 'true'); // Simplified
      } else {
        // If data is null (meaning no profile row) OR onboarding_completed is false
        // Trigger creation of profile row if it doesn't exist? 
        // No, the SQL trigger should handle creation now.
        // If trigger failed, we might have no row.
        // But for now, just direct to onboarding.
        setOnboardingComplete(false);
        setCurrentPage('onboarding');
      }
    }

    checkProfile();
  }, [user, authLoading]);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    setCurrentPage('home');
  };
  // Handle redirects
  useEffect(() => {
    if (!authLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, authLoading, pathname]);

  // ... (previous logic)

  // If loading, show spinner (Black as requested)
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // If not logged in and not on login page, render nothing while redirecting
  if (!user && pathname !== '/login') return null;

  if (pathname === '/login') {
    return <LoginPage />;
  }

  // If !user (and on login page), we returned above. So user is present here.
  if (!user) return null;

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

  return (
    <div className="flex h-[100dvh] md:min-h-screen bg-white overflow-hidden relative">
      {/* Mobile Overlay for Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!onboardingComplete && currentPage === 'onboarding' ? null : (
        <nav
          className={`w-44 bg-white text-gray-900 p-3 flex flex-col fixed inset-y-0 left-0 z-[100] shadow-xl md:shadow-sm border-r transition-transform duration-300 transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* ... (sidebar content same as before) */}
          <div className="flex items-center justify-between mb-4 px-1 py-1">
            <div className="flex items-center px-1">
              <span className="text-lg font-black tracking-tighter text-black">
                DERECE <span className="text-gray-400">AI</span>
              </span>
            </div>
          </div>
          <ul className="space-y-2 flex-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
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
          <div className="border-t border-gray-100 pt-4 text-center">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="flex items-center justify-center gap-2 w-full text-xs font-bold text-red-500 hover:text-red-700 transition mb-3"
            >
              Çıkış Yap
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden w-full text-center mb-1 text-[11px] font-black tracking-wide text-black hover:opacity-70 transition-opacity"
            >
              Menüyü Kapat
            </button>
            <p className="text-[10px] font-black text-black uppercase tracking-widest">Version 1.0</p>
          </div>
        </nav>
      )}

      {/* ... rest of layout */}
      <div className={`flex flex-col flex-1 ${!onboardingComplete && currentPage === 'onboarding' ? '' : 'md:ml-44'} overflow-hidden relative h-full`}>
        <HeaderArea onboardingComplete={onboardingComplete} currentPage={currentPage} setSidebarOpen={setSidebarOpen} />

        <main className={`flex-1 ${!onboardingComplete && currentPage === 'onboarding' ? 'p-0 overflow-y-auto' : `p-3 pb-5 pt-12 sm:p-4 md:p-6 md:pb-6 md:pt-6 ${currentPage === 'home' ? 'overflow-hidden h-[calc(100dvh-48px)] md:h-screen' : 'overflow-y-auto'}`} `}>
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
      <div className="flex-1" />
      <div className="flex-1" />
      <div className="flex items-center">
        {headerActions}
      </div>
    </div>
  );
}
