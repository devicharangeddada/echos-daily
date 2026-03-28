import { motion } from 'framer-motion';
import { CalendarDays, Target, GraduationCap, BarChart3, BookOpen, TreePine, Settings } from 'lucide-react';
import { echosTransition } from '@/lib/motion';

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
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-30 select-none flex flex-col">
      <div className="p-4">
        <h1 className="text-headline">EchOS</h1>
      </div>
      <nav className="px-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <motion.button
                  onClick={() => onChange(item.id)}
                  whileTap={{ scale: 0.98, transition: echosTransition }}
                  className={`w-full flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-accent/15 text-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="ml-auto w-1 h-4 rounded-full bg-accent"
                      transition={echosTransition}
                    />
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default DesktopSidebar;
