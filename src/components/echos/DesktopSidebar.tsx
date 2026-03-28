import { motion } from "framer-motion";
import {
  CalendarDays,
  Target,
  GraduationCap,
  BarChart3,
  BookOpen,
  TreePine,
  Settings,
} from "lucide-react";

const sidebarItems = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "focus", label: "Focus", icon: Target },
  { id: "exam", label: "Exam", icon: BookOpen },
  { id: "education", label: "Learn", icon: GraduationCap },
  { id: "analytics", label: "Stats", icon: BarChart3 },
  { id: "syllabus", label: "Syllabus", icon: TreePine },
  { id: "settings", label: "Settings", icon: Settings },
];

interface DesktopSidebarProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-[1.25rem] px-4 py-3 text-left text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
      active
        ? "bg-primary/10 text-primary shadow-[0_14px_40px_rgba(59,130,246,0.12)]"
        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
    }`}
  >
    <Icon
      className={`h-5 w-5 transition-colors ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    />
    <span className="truncate">{label}</span>
  </button>
);

const DesktopSidebar = ({ activeTab, onChange }: DesktopSidebarProps) => {
  return (
    <motion.div
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
      className="flex h-full flex-col p-4"
    >
      <div className="px-4 py-8 mb-4">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
          EchOS
        </h1>
      </div>

      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-foreground/5"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm font-semibold">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default DesktopSidebar;
