import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import TodayScreen from '@/components/echos/TodayScreen';
import FocusScreen from '@/components/echos/FocusScreen';
import EducationScreen from '@/components/echos/EducationScreen';
import CalendarScreen from '@/components/echos/CalendarScreen';
import AnalyticsScreen from '@/components/echos/AnalyticsScreen';
import ExamHub from '@/components/echos/ExamHub';
import SyllabusTree from '@/components/echos/SyllabusTree';
import SettingsScreen from '@/components/echos/SettingsScreen';
import BottomNav from '@/components/echos/BottomNav';
import { echosTransition } from '@/lib/motion';

const screens: Record<string, React.FC> = {
  today: TodayScreen,
  calendar: CalendarScreen,
  focus: FocusScreen,
  education: EducationScreen,
  exam: ExamHub,
  syllabus: SyllabusTree,
  analytics: AnalyticsScreen,
  settings: SettingsScreen,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('today');
  const focusSession = useStore((s) => s.focusSession);
  const theme = useStore((s) => s.settings.theme);
  const Screen = screens[activeTab];

  // Apply theme on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else if (theme === 'dark') {
      root.classList.remove('light-theme');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.remove('light-theme');
      } else {
        root.classList.add('light-theme');
      }
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: echosTransition }}
          exit={{ opacity: 0, y: -10, transition: echosTransition }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
      <BottomNav active={activeTab} onChange={setActiveTab} hidden={focusSession.isActive} />
    </div>
  );
};

export default Index;
