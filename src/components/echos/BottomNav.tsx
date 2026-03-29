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
import { NavLink } from "react-router-dom";
import { echosTransition } from "@/lib/motion";

const tabs = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "focus", label: "Focus", icon: Target },
  { id: "education", label: "Learn", icon: GraduationCap },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const BottomNav = ({ hidden }: { hidden?: boolean }) => {
  if (hidden) return null;

  const mobileTabs = tabs.slice(0, 5);

  return (
    <motion.nav
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...echosTransition, duration: 0.28 }}
      className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-lg items-center justify-between rounded-[1.75rem] apple-glass px-4 py-3 shadow-2xl shadow-black/15"
    >
      {mobileTabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={`/${tab.id}`}
          className={({ isActive }) =>
            `relative flex flex-1 flex-col items-center gap-1 rounded-3xl px-3 py-2 text-[10px] font-bold uppercase tracking-tighter transition-colors duration-200 apple-bounce ${
              isActive
                ? "text-primary"
                : "text-muted-foreground/60 hover:text-foreground"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute inset-1 rounded-3xl bg-primary/10" />
              )}
              <tab.icon
                size={22}
                className={`relative z-10 transition-colors ${
                  isActive ? "text-primary" : ""
                }`}
              />
              <span className="relative z-10">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </motion.nav>
  );
};

export default BottomNav;
