import React, { useState, useEffect } from 'react';
import { db } from './lib/store';
import { Advocate } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AILegalAssistant } from './components/AILegalAssistant';
import { EmergencyLawyerModal } from './components/EmergencyLawyerModal';

// Views
import { HomeView } from './views/HomeView';
import { AdvocateDirectoryView } from './views/AdvocateDirectoryView';
import { CauseListView } from './views/CauseListView';
import { ELibraryView } from './views/ELibraryView';
import { ElectionView } from './views/ElectionView';
import { JuniorSeniorConnectView } from './views/JuniorSeniorConnectView';
import { VerifyIDView } from './views/VerifyIDView';
import { RegisterView } from './views/RegisterView';
import { LoginView } from './views/LoginView';
import { AdvocateDashboardView } from './views/AdvocateDashboardView';
import { AdminPanelView } from './views/AdminPanelView';
import { SuperAdminPanelView } from './views/SuperAdminPanelView';
import { StateBarPortalView } from './views/StateBarPortalView';
import { ClientCaseStatusView } from './views/ClientCaseStatusView';
import { LegalDraftingView } from './views/LegalDraftingView';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<Advocate | null>(null);
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [verifyBarNo, setVerifyBarNo] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [adminInitialTab, setAdminInitialTab] = useState<string>('members');
  const [loginInitialMode, setLoginInitialMode] = useState<'advocate_admin' | 'state_bar' | 'client'>('advocate_admin');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('ballia_bar_theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  const [, setCloudSyncTick] = useState<number>(0);

  // Auto Cloud Synchronization Loop across all Advocates, Bar Admins & State Bar Council
  useEffect(() => {
    // Initial cloud sync
    db.syncWithServer(false);

    // Periodic 5-second live background sync
    const syncInterval = setInterval(() => {
      db.syncWithServer(false);
    }, 5000);

    const handleCloudSync = (e: Event) => {
      const customEvt = e as CustomEvent<{ key?: string }>;
      if (!customEvt.detail || customEvt.detail.key === 'CLOUD_SYNC') {
        setCloudSyncTick((t) => t + 1);
      }
    };
    window.addEventListener('crba_state_updated', handleCloudSync);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('crba_state_updated', handleCloudSync);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('ballia_bar_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initial user check
  useEffect(() => {
    const savedUser = localStorage.getItem('ballia_bar_current_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    }

    // Check if QR code was scanned pointing to #verify/...
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify/')) {
        const rawBar = decodeURIComponent(hash.replace('#verify/', ''));
        if (rawBar) {
          setVerifyBarNo(rawBar.replace(/_/g, '/'));
          setCurrentRoute('verify');
        }
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  const handleLoginSuccess = (user: Advocate) => {
    setCurrentUser(user);
    localStorage.setItem('ballia_bar_current_user', JSON.stringify(user));
    if (user.role === 'super_admin') {
      setCurrentRoute('super-admin');
    } else if (user.role === 'state_bar_admin') {
      setCurrentRoute('state-bar-portal');
    } else if (user.role === 'bar_admin' || user.role === 'admin' || user.email === 'nyaaysahayogi@gmail.com') {
      setAdminInitialTab('members');
      setCurrentRoute('admin');
    } else {
      setCurrentRoute('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ballia_bar_current_user');
    setCurrentRoute('home');
  };

  const handleSelectAdvocate = (adv: Advocate) => {
    setSelectedAdvocate(adv);
    setCurrentRoute('advocates');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (route: string, param?: string) => {
    if (route === 'verify' && param) {
      setVerifyBarNo(param);
    }
    if (route === 'client-status' && param) {
      setClientSearchQuery(param);
    }
    if (route === 'state-bar-portal' || route === 'state-bar-admin' || route === 'state_bar' || route === 'state-admin') {
      setCurrentRoute('state-bar-portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (route === 'state-bar-login') {
      setLoginInitialMode('state_bar');
      setCurrentRoute('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (route === 'login') {
      setLoginInitialMode('advocate_admin');
    }
    if (route === 'advocates' || route === 'directory') {
      if (!param) {
        // If navigating directly without clicking specific advocate, clear any previous selection
        setSelectedAdvocate(null);
      }
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Main Navigation Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Dynamic View Router */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectAdvocate={handleSelectAdvocate}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {(currentRoute === 'directory' || currentRoute === 'advocates') && (
          <AdvocateDirectoryView
            onNavigate={handleNavigate}
            selectedAdvocate={selectedAdvocate}
            onSelectAdvocate={setSelectedAdvocate}
          />
        )}

        {currentRoute === 'client-status' && (
          <ClientCaseStatusView
            onNavigate={handleNavigate}
            initialQuery={clientSearchQuery}
          />
        )}

        {currentRoute === 'drafting' && (
          <LegalDraftingView />
        )}

        {currentRoute === 'causelist' && (
          <CauseListView />
        )}

        {currentRoute === 'elibrary' && (
          <ELibraryView />
        )}

        {currentRoute === 'election' && (
          <ElectionView
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'connect' && (
          <JuniorSeniorConnectView
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'verify' && (
          <VerifyIDView initialBarNo={verifyBarNo} />
        )}

        {currentRoute === 'register' && (
          <RegisterView
            onNavigate={handleNavigate}
            onRegistered={(adv) => {
              // auto login or direct
            }}
          />
        )}

        {currentRoute === 'login' && (
          <LoginView
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
            initialMode={loginInitialMode}
          />
        )}

        {currentRoute === 'dashboard' && (
          currentUser ? (
            <AdvocateDashboardView
              advocate={currentUser}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          ) : (
            <LoginView
              onNavigate={handleNavigate}
              onLoginSuccess={handleLoginSuccess}
              initialMode={loginInitialMode}
            />
          )
        )}

        {currentRoute === 'admin' && (
          <AdminPanelView
            currentUser={currentUser}
            initialTab={adminInitialTab}
            onLogout={handleLogout}
            onNavigateToSuperAdmin={() => handleNavigate('super-admin')}
            onNavigateToStateBarPortal={() => handleNavigate('state-bar-portal')}
          />
        )}

        {(currentRoute === 'super-admin' || currentRoute === 'superadmin') && (
          <SuperAdminPanelView
            onLogout={handleLogout}
            onNavigateToBarAdmin={() => handleNavigate('admin')}
            onNavigateToStateBarAdmin={() => handleNavigate('state-bar-portal')}
          />
        )}

        {(currentRoute === 'state-bar-portal' || currentRoute === 'state-bar-admin') && (
          <StateBarPortalView
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating AI Legal Assistant (Module 9) */}
      <AILegalAssistant />

      {/* Emergency Lawyer Modal (Module 8) */}
      <EmergencyLawyerModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

    </div>
  );
}
