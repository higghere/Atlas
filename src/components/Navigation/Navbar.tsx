import React, { useEffect, useRef } from 'react';
import { User, Activity, Heart, TestTube, Clock, BookOpen, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

export type NavTabId =
  | 'home'
  | 'anatomy'
  | 'patient-profile'
  | 'simulation'
  | 'laboratory'
  | 'timeline'
  | 'study'
  | 'settings';

interface NavbarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  systemicStatusText?: string;
  systemicStatusColor?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  systemicStatusText = 'Stable Homeostasis',
  systemicStatusColor = 'text-emerald-400',
}) => {
  const navbarRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const idleTrackRef = useRef<HTMLDivElement>(null);

  const tabs: Array<{ id: NavTabId; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'anatomy', label: 'Anatomy', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'patient-profile', label: 'Patient Profile', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'simulation', label: 'Simulation', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'laboratory', label: 'Laboratory', icon: <TestTube className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'study', label: 'Study', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-3.5 h-3.5" /> },
  ];

  // ── Size idle envelope to span first → last nav item exactly ──
  const positionIdleTrack = () => {
    const navbar = navbarRef.current;
    const idleTrack = idleTrackRef.current;
    if (!navbar || !idleTrack) return;

    const navItems = navbar.querySelectorAll<HTMLElement>('.nav-item');
    if (!navItems.length) return;

    const navRect = navbar.getBoundingClientRect();
    const firstRect = navItems[0].getBoundingClientRect();
    const lastRect = navItems[navItems.length - 1].getBoundingClientRect();

    const left = firstRect.left - navRect.left + navbar.scrollLeft;
    const width = lastRect.right - firstRect.left;

    idleTrack.style.left = `${left}px`;
    idleTrack.style.width = `${width}px`;
  };

  // ── Position slider under a given button ──
  const positionSlider = (btn: HTMLElement) => {
    const navbar = navbarRef.current;
    const slider = sliderRef.current;
    if (!navbar || !slider || !btn) return;

    const navRect = navbar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    slider.style.left = `${btnRect.left - navRect.left + navbar.scrollLeft}px`;
    slider.style.top = `${btnRect.top - navRect.top}px`;
    slider.style.width = `${btnRect.width}px`;
    slider.style.height = `${btnRect.height}px`;
  };

  useEffect(() => {
    positionIdleTrack();
    const activeBtn = navbarRef.current?.querySelector<HTMLElement>(`.nav-item[data-tab="${activeTab}"]`);
    if (activeBtn) {
      positionSlider(activeBtn);
    }
    window.addEventListener('resize', positionIdleTrack);
    return () => window.removeEventListener('resize', positionIdleTrack);
  }, [activeTab]);

  return (
    <header className="flex flex-col lg:flex-row justify-between items-center gap-3 border-b border-slate-900 pb-3 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5 rounded-2xl shadow-xl">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-medical-600/20 border border-medical-500/30 flex items-center justify-center shadow-lg shadow-medical-500/5">
          <Heart className="w-5 h-5 text-medical-400 fill-medical-400/20 animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-wider text-slate-100 uppercase flex items-center gap-2">
            Human Atlas
            <span className="text-[8px] bg-slate-900 border border-slate-800 text-medical-400 px-1.5 py-0.5 rounded tracking-widest font-bold">
              PRO SIMULATOR
            </span>
          </h1>
          <p className="text-[9px] text-slate-500 font-mono tracking-tight">
            Event-Driven Multi-Subsystem Physiology & EHR Engine
          </p>
        </div>
      </div>

      {/* Sliding Navigation Bar */}
      <nav
        id="navbar"
        ref={navbarRef}
        className="relative flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 px-2 bg-slate-950/80 border border-slate-900 rounded-xl shadow-inner max-w-full"
      >
        {/* Idle track envelope */}
        <div
          id="navIdleTrack"
          ref={idleTrackRef}
          className="absolute h-full pointer-events-none rounded-lg bg-slate-900/10 border border-slate-850/30"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Sliding active indicator */}
        <div
          id="navSlider"
          ref={sliderRef}
          className="absolute pointer-events-none rounded-lg bg-medical-500/20 border border-medical-500/50 shadow-md shadow-medical-500/10"
          style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Navigation Buttons */}
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              data-tab={t.id}
              onClick={(e) => {
                positionSlider(e.currentTarget);
                onSelectTab(t.id);
              }}
              className={`nav-item relative z-10 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors duration-200 select-none ${
                isActive
                  ? 'text-medical-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status Pill */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[10px]">
        <ShieldCheck className="w-3.5 h-3.5 text-medical-400" />
        <span className="text-slate-400 uppercase font-bold">Status:</span>
        <span className={`font-mono font-bold ${systemicStatusColor}`}>
          {systemicStatusText}
        </span>
      </div>
    </header>
  );
};
