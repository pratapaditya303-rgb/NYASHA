import React, { useState, useEffect } from 'react';
import {
  Scale,
  Shield,
  PhoneCall,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  Vote,
  BookOpen,
  Users,
  Search,
  CheckCircle2,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { Advocate, NotificationItem } from '../types';
import { db } from '../lib/store';
import { PWAInstallButton } from './PWAInstallButton';
import { AdvocateLogo } from './AdvocateLogo';
import { AppIconStudioModal } from './AppIconStudioModal';

interface HeaderProps {
  currentUser: Advocate | null;
  onNavigate: (route: string) => void;
  currentRoute: string;
  onOpenEmergency: () => void;
  onLogout: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  currentRoute,
  onOpenEmergency,
  onLogout,
  theme = 'dark',
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [, setIconVersion] = useState(0);

  useEffect(() => {
    const handleIconChange = () => setIconVersion((v) => v + 1);
    window.addEventListener('app_icon_changed', handleIconChange);
    return () => window.removeEventListener('app_icon_changed', handleIconChange);
  }, []);

  const notifications = db.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinks = [
    { label: 'Home', route: 'home' },
    { label: 'Drafting', route: 'drafting' },
    { label: 'Advocate Directory', route: 'advocates' },
    { label: 'Cause List', route: 'causelist' },
    { label: 'Case Status (केस स्थिति)', route: 'client-status' },
    { label: 'e-Library', route: 'elibrary' },
    { label: 'Junior-Senior', route: 'connect' },
    { label: 'Election', route: 'election' },
    { label: 'Verify ID', route: 'verify' },
  ];

  const stateConfig = db.getStateBarConfig();

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-amber-500/20 shadow-xl">
      {/* Dynamic State Bar Council Election Live Notification Banner */}
      {stateConfig.status === 'VotingOpen' && (
        <div className="bg-gradient-to-r from-red-700 via-amber-700 to-red-700 text-white text-[11px] font-bold py-1.5 px-4 tracking-wide shadow-md transition-all border-b border-amber-400/40">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div
              onClick={() => onNavigate('election')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="bg-slate-950/90 text-amber-300 px-2 py-0.5 rounded font-extrabold uppercase text-[10px] border border-amber-400/40">
                LIVE E-VOTING ACTIVE
              </span>
              <span>
                State Bar Council General Elections 2026-2027 are ACTIVE across all 75 Districts!
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('election')}
                className="text-amber-200 underline hover:text-white text-[11px] font-extrabold"
              >
                Cast State Ballot →
              </button>
              <button
                type="button"
                onClick={() => onNavigate('state-bar-admin')}
                className="px-2.5 py-0.5 rounded-lg bg-red-950 text-red-200 hover:text-white hover:bg-red-900 border border-red-400/60 text-[10px] font-black uppercase transition-all shadow"
              >
                🔴 State Bar Admin (ON/OFF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Gold Utility Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-[11px] font-bold py-1.5 px-4 tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>NYAAY SAHAYOGI (न्याय सहयोगी) • JUDICIAL &amp; BAR ERP PLATFORM</span>
            <span className="hidden md:inline text-slate-900">• Empowering State Bar Council &amp; District Bar Associations</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-950/80 font-bold">
            <span>All 75 Districts Legal Network</span>
            <span>•</span>
            <span>Helpline: +91 9415988800</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onNavigate('home')}
              className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/10 transition-transform hover:scale-105 cursor-pointer flex-shrink-0"
              title="Nyaay Sahayogi Portal (न्याय सहयोगी)"
            >
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden p-0.5">
                <AdvocateLogo variant="auto" className="w-full h-full" />
              </div>
            </div>
            <div onClick={() => onNavigate('home')} className="cursor-pointer">
              <h1 className="font-bold text-sm sm:text-base text-slate-100 tracking-tight leading-tight flex items-center gap-1.5">
                NYAAY SAHAYOGI
              </h1>
              <p className="text-[11px] text-amber-400 font-semibold tracking-wider">
                न्याय सहयोगी • BAR &amp; ADVOCATE PORTAL
              </p>
            </div>

            {/* Quick App Icon Customizer Trigger - EXCLUSIVE TO SUPER ADMIN */}
            {currentUser && (currentUser.role === 'super_admin' || currentUser.email?.toLowerCase() === 'nyaaysahayogi@gmail.com') && (
              <button
                type="button"
                onClick={() => setIsIconModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 text-[10px] font-bold transition ml-1 shadow-sm"
                title="Super Admin Master Icon & Branding Studio (ऐप का आइकन बदलें - केवल सुपर एडमिन)"
              >
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Change Icon 👑</span>
              </button>
            )}
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  currentRoute === item.route
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Center (Install, Emergency, Notifications, Auth) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Emergency Lawyer Button */}
            <button
              onClick={onOpenEmergency}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-transform hover:scale-105 animate-pulse"
              title="Emergency Lawyer in Ballia (तुरंत वकील चाहिए)"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">तुरंत वकील चाहिए?</span>
              <span className="sm:hidden">वकील</span>
            </button>

            {/* Dark / Light Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-amber-400 transition-all shadow-sm"
                title={theme === 'dark' ? 'Switch to Light Mode (लाइट थीम)' : 'Switch to Dark Mode (डार्क थीम)'}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden xl:inline text-[11px] font-bold">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" />
                    <span className="hidden xl:inline text-[11px] font-bold">Dark</span>
                  </>
                )}
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-amber-400 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 text-slate-100 z-50">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                    <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" /> Bar Announcements &amp; Hearings
                    </h4>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {notifications.length} Total
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => db.markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer text-xs ${
                          n.isRead
                            ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                            : 'bg-slate-800/80 border-amber-500/30 text-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-100">{n.title}</p>
                          <span className="text-[9px] text-slate-500 whitespace-nowrap">{n.createdAt.split(' ')[0]}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (currentUser.role === 'super_admin') {
                      onNavigate('super-admin');
                    } else if (currentUser.role === 'state_bar_admin') {
                      onNavigate('state-bar-admin');
                    } else if (currentUser.role === 'bar_admin' || currentUser.role === 'admin') {
                      onNavigate('admin');
                    } else {
                      onNavigate('dashboard');
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                    currentUser.role === 'super_admin'
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : currentUser.role === 'state_bar_admin'
                      ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-600/30 ring-1 ring-red-400'
                      : currentUser.role === 'bar_admin' || currentUser.role === 'admin'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {currentUser.role === 'super_admin'
                      ? '👑 Super Admin Console'
                      : currentUser.role === 'state_bar_admin'
                      ? '🔴 State Bar Council Admin'
                      : currentUser.role === 'bar_admin' || currentUser.role === 'admin'
                      ? '🏛️ Bar Admin Panel'
                      : '⚖️ Advocate Dashboard'}
                  </span>
                  <span className="md:hidden">
                    {currentUser.role === 'super_admin'
                      ? 'Super'
                      : currentUser.role === 'state_bar_admin'
                      ? '🔴 State Bar'
                      : currentUser.role === 'bar_admin'
                      ? 'Admin'
                      : 'Portal'}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow"
                  title="Admin & Advocate Login"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-950" />
                  <span>Admin / Sign In</span>
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="hidden sm:inline-block px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-2">
          {navLinks.map((item) => (
            <button
              key={item.route}
              onClick={() => {
                onNavigate(item.route);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentRoute === item.route
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Quick Admin / Advocate Auth in Mobile Menu */}
          <div className="pt-3 mt-2 border-t border-slate-800 space-y-2">
            <PWAInstallButton variant="banner" />

            {onToggleTheme && (
              <button
                onClick={() => {
                  onToggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-700" />
                  )}
                  <span>
                    {theme === 'dark' ? 'Switch to Light Theme (लाइट मोड)' : 'Switch to Dark Theme (डार्क मोड)'}
                  </span>
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {theme === 'dark' ? '☀️ Day' : '🌙 Night'}
                </span>
              </button>
            )}
            {/* Mobile App Icon Studio Button - EXCLUSIVE TO SUPER ADMIN */}
            {currentUser && (currentUser.role === 'super_admin' || currentUser.email?.toLowerCase() === 'nyaaysahayogi@gmail.com') && (
              <button
                onClick={() => {
                  setIsIconModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm font-bold flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Change App Icon 👑 (सुपर एडमिन)
                </span>
                <span className="text-xs text-amber-400">Studio ⚙️</span>
              </button>
            )}

            {!currentUser ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-sm font-bold flex items-center justify-between shadow"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-950" />
                    Admin / Advocate Login (लॉगिन)
                  </span>
                  <span className="text-xs bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-bold">Sign In</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center justify-between"
                >
                  <span>New Advocate Registration (पंजीकरण)</span>
                  <span className="text-xs text-amber-400">Apply →</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onNavigate(currentUser.role === 'admin' ? 'admin' : 'dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold flex items-center justify-between"
              >
                <span>Go to {currentUser.role === 'admin' ? '🛡️ Admin Panel' : '⚖️ Advocate Dashboard'}</span>
                <LayoutDashboard className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* App Icon & Branding Studio Modal */}
      <AppIconStudioModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
      />
    </header>
  );
};
