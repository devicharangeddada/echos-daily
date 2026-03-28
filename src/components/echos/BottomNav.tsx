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
import { echosTransition } from "@/lib/motion";

const tabs = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "focus", label: "Focus", icon: Target },
  { id: "education", label: "Learn", icon: GraduationCap },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
  hidden?: boolean;
}

const NavItem = ({
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
    className={`relative flex min-h-[56px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-3xl px-3 py-2 text-[11px] font-semibold transition-colors duration-200 ${
      active
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {active && (
      <span className="absolute inset-1 rounded-3xl bg-primary/10" />
    )}
    <Icon
      className={`relative z-10 h-5 w-5 transition-colors ${
        active ? "text-primary" : ""
      }`}
    />
    <span className="relative z-10">{label}</span>
  </button>
);

const BottomNav = ({ active, onChange, hidden }: BottomNavProps) => {
  if (hidden) return null;

  return (
    <motion.nav
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...echosTransition, duration: 0.28 }}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-center justify-between rounded-[1.75rem] border border-white/10 bg-surface/85 px-4 py-3 shadow-2xl shadow-black/15 backdrop-blur-2xl"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={isActive}
            onClick={() => onChange(tab.id)}
          />
        );
      })}
    </motion.nav>
  );
};

export default BottomNav;
