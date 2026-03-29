import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import TodayScreen from "@/components/echos/TodayScreen";
import FocusScreen from "@/components/echos/FocusScreen";
import EducationScreen from "@/components/echos/EducationScreen";
import CalendarScreen from "@/components/echos/CalendarScreen";
import AnalyticsScreen from "@/components/echos/AnalyticsScreen";
import ExamHub from "@/components/echos/ExamHub";
import SyllabusTree from "@/components/echos/SyllabusTree";
import SettingsScreen from "@/components/echos/SettingsScreen";
import { echosTransition } from "@/lib/motion";

const screens = {
  today: TodayScreen,
  calendar: CalendarScreen,
  focus: FocusScreen,
  education: EducationScreen,
  exam: ExamHub,
  syllabus: SyllabusTree,
  analytics: AnalyticsScreen,
  settings: SettingsScreen,
} as const;

type TabType = 'today' | 'calendar' | 'focus' | 'education' | 'exam' | 'syllabus' | 'analytics' | 'settings';

const Index = () => {
  const { tab } = useParams<{ tab?: TabType }>();
  const activeTab = tab ?? "today";
  const Screen = screens[activeTab] ?? TodayScreen;

  return (
    <div className="bg-background text-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: echosTransition }}
          exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
