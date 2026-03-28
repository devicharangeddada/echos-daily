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
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
      className="w-72 min-w-[18rem] h-full glass-panel border-r border-white/10 flex flex-col p-5 shadow-2xl"
    >
      <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        EchOS Daily
      </div>

      <div className="mt-4 space-y-2 overflow-hidden">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarItem
              key={item.id}
              icon={Icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => onChange(item.id)}
            />
          );
        })}
      </div>

      <div className="mt-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
        Designed for calm focus and premium productivity.
      </div>
    </motion.aside>
  );
};

export default DesktopSidebar;
