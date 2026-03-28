import { motion } from 'framer-motion';
import { CalendarDays, Target, GraduationCap, BarChart3, BookOpen, TreePine, Settings } from 'lucide-react';
import { echosTransition } from '@/lib/motion';

const tabs = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'syllabus', label: 'Syllabus', icon: TreePine },
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'exam', label: 'Exam', icon: BookOpen },
  { id: 'education', label: 'Learn', icon: GraduationCap },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
  hidden?: boolean;
}

const BottomNav = ({ active, onChange, hidden }: BottomNavProps) => {
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 select-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto max-w-lg px-2 sm:px-4 pb-2">
        <div className="glass-card flex items-center justify-around px-1 py-1.5 shadow-lg shadow-primary/5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-2 sm:px-3 py-2.5 sm:py-3 min-h-[44px] min-w-[44px] transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
                whileTap={{ scale: 0.92, transition: echosTransition }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-secondary"
                    transition={echosTransition}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4 sm:h-5 sm:w-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="relative z-10 text-[9px] sm:text-[10px] font-medium leading-tight">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
