import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import TodayScreen from '@/components/echos/TodayScreen';
import FocusScreen from '@/components/echos/FocusScreen';
import EducationScreen from '@/components/echos/EducationScreen';
import CalendarScreen from '@/components/echos/CalendarScreen';
import AnalyticsScreen from '@/components/echos/AnalyticsScreen';
import ExamHub from '@/components/echos/ExamHub';
import SyllabusTree from '@/components/echos/SyllabusTree';
import SettingsScreen from '@/components/echos/SettingsScreen';
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

interface IndexProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const Index = ({ activeTab }: IndexProps) => {
  const Screen = screens[activeTab];

  useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 pb-28 pt-6 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="w-full flex-1">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
