import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
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
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { CalendarDays, Target, GraduationCap, BarChart3, BookOpen, TreePine, Settings } from 'lucide-react';

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

const sidebarItems = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'syllabus', label: 'Syllabus', icon: TreePine },
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'exam', label: 'Exam', icon: BookOpen },
  { id: 'education', label: 'Learn', icon: GraduationCap },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('today');
  const focusSession = useStore((s) => s.focusSession);
  const Screen = screens[activeTab];

  useTheme();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize to handle responsive changes
      setActiveTab(prev => prev);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = window.innerWidth > 768;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex">
        {isDesktop && (
          <Sidebar>
            <SidebarHeader className="p-4">
              <h1 className="text-headline">EchOS</h1>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        )}

        <main className="flex-1">
          <div className="p-4 md:p-6">
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
        </main>

        {!isDesktop && (
          <BottomNav active={activeTab} onChange={setActiveTab} hidden={focusSession.isActive} />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Index;
