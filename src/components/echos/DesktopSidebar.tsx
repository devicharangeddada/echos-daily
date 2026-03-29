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

const sidebarItems = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "focus", label: "Focus", icon: Target },
  { id: "exam", label: "Exam", icon: BookOpen },
  { id: "education", label: "Learn", icon: GraduationCap },
  { id: "analytics", label: "Stats", icon: BarChart3 },
  { id: "syllabus", label: "Syllabus", icon: TreePine },
  { id: "settings", label: "Settings", icon: Settings },
];

const DesktopSidebar = () => {
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
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-foreground/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-item"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default DesktopSidebar;
