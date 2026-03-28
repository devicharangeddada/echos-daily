import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Target, GraduationCap, BarChart3, BookOpen, TreePine, Settings, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { echosTransition } from '@/lib/motion';

const SIDEBAR_WIDTH = '18rem';
const SIDEBAR_WIDTH_MOBILE = '80vw';
const sidebarItems = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'syllabus', label: 'Syllabus', icon: TreePine },
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'exam', label: 'Exam', icon: BookOpen },
  { id: 'education', label: 'Learn', icon: GraduationCap },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface DesktopSidebarProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const DesktopSidebar = ({ activeTab, onChange }: DesktopSidebarProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const toggleSidebar = () => {
    if (isTransitioning) return;
    setOpen((value) => !value);
  };

  const closeSidebar = () => {
    if (isTransitioning) return;
    setOpen(false);
  };

  const handleSelect = (tab: string) => {
    onChange(tab);
    if (isMobile) {
      closeSidebar();
    }
  };

  const width = isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH;

  const buttonLabel = open ? 'Close sidebar' : 'Open sidebar';

  return (
    <>
      <button
        type="button"
        aria-label={buttonLabel}
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#121212]/95 text-[#e0e0e0] shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-105 md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.button
            key="sidebar-overlay"
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: 'easeInOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="desktop-sidebar"
            className="fixed inset-y-0 left-0 z-50 flex h-full flex-col overflow-hidden rounded-r-3xl border-r border-white/10 bg-[#121212] text-[#e0e0e0] shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
            style={{ width, minWidth: width, maxWidth: width }}
            initial={{ x: '-100%', opacity: 0.92, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeInOut' } }}
            exit={{ x: '-100%', opacity: 0.92, scale: 0.98, transition: { duration: 0.25, ease: 'easeInOut' } }}
            onAnimationStart={() => setIsTransitioning(true)}
            onAnimationComplete={() => setIsTransitioning(false)}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">EchOS</h1>
                <p className="text-xs text-[#cfcfcf]">Responsive workspace</p>
              </div>
              <button
                type="button"
                aria-label="Close sidebar"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#e0e0e0] transition hover:bg-white/10"
                onClick={closeSidebar}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id} className="rounded-3xl">
                      <motion.button
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        whileTap={{ scale: 0.98, transition: echosTransition }}
                        whileHover={{ scale: 1.01, transition: echosTransition }}
                        className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bb86fc]/70 ${
                          isActive
                            ? 'bg-[#7c3aed]/20 text-[#ffffff] shadow-[inset_0_0_0_1px_rgba(124,58,237,0.15)]'
                            : 'text-[#d8d8d8] hover:bg-white/5 hover:text-[#ffffff]'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-[#c4b5fd]' : 'text-[#9ca3af]'}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {isActive && <span className="h-3 w-3 rounded-full bg-[#7c3aed]" />}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {!open && !isMobile && (
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={toggleSidebar}
          className="fixed left-0 top-[50%] z-50 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-r-3xl border border-white/10 bg-[#121212]/95 text-[#e0e0e0] shadow-lg shadow-black/25 transition-transform duration-200 hover:-translate-x-0 hover:bg-[#1f1f1f]"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default DesktopSidebar;
