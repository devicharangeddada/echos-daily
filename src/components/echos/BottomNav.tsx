import { motion } from 'framer-motion';
import { CalendarDays, CheckSquare, Target, GraduationCap, BarChart3 } from 'lucide-react';
import { echosTransition } from '@/lib/motion';

const tabs = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'education', label: 'Learn', icon: GraduationCap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const;

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
}

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg px-4 pb-2">
        <div className="glass-card flex items-center justify-around px-2 py-2 shadow-lg shadow-primary/5">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors ${
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
                <Icon className="relative z-10 h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="relative z-10 text-[10px] font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
