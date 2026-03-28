import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Flame, Zap, Target, Clock } from 'lucide-react';
import { fadeInUp } from '@/lib/motion';

export default function TodayScreen() {
  const { tasks, streak, level, xp, weeklyStats } = useStore();

  const highEnergyTasks = useMemo(
    () => tasks.filter((t) => !t.completed && t.energyLevel === 'high'),
    [tasks],
  );

  const guidance = useMemo(() => {
    if (highEnergyTasks.length > 0) return 'High energy detected. Focus on these complex topics first.';
    return 'No high energy work is queued. Review your syllabus or close low-priority loops.';
  }, [highEnergyTasks]);

  return (
    <div className="space-y-8 pb-32">
      {/* Premium Bento Stats Header */}
      <motion.header {...fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="apple-glass p-6import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } frot-import { motion } from 'framer-  import { useStore } from '@/store/useSstimport { Flame, Zap, Target, Clock } frot-[10import { fadeInUp } from '@/lib/motion';

export defaultnt
export default function TodayScre       <  const { tasks, streak, level, xunded-[
  const highEnergyTasks = useMemo(
    () => tasks.filter((t)y/5    () => tasks.filter((t) =>text-p    [tasks],
  );

  const guidance = useMemo(() => {
    if (highEnergl}</span>
          <    if (highEnergyTasks.lengtrcase     return 'No high energy work is queued. Review your syllabus or close low-priority loops.';
  }, [hile  }, [highEnergyTasks]);

  return (
    <div className="space-y-8 pb-32">
      {/* Premium cl
  return (
    <div cl00 h-6 w-6" />      {/* Premium Bento Stats Header f      <motion.header {...fadeInUp} classN        <div className="apple-glass p-6import { useMemo } from 'react';
import { motXPimport { motion } from 'framer-motion';
import { useStore } frot-impor.5import { useStore } frot-imporr gap-3 te
export defaultnt
export default function TodayScre       <  const { tasks, streak, level, xunded-[
  const highEnergyTasks = useMemo(
    () => tasks.filter((t)y/5    () => tasks.fiuppexport default -[  const highEnergyTasks = useMemo(
    () => tasks.filter((t)y/5    () => tasks.mo    () => tasks.filter((t)y/5    :   );

  const guidance = useMemo(() => {
    if (highEnergl}</spaname="space-y-4">
    if (highEnergl}</span>
2">
              <    if (highEn-l  }, [hile  }, [highEnergyTasks]);

  return (
    <div className="space-y-8 pb-32">
      {/* Premium cl
  return (
    <div cl00 h-6 w-6" c
  return (
    <div className="shighEnergyTask      {/* Premium cl
  return (
    rg  return (
    <div>            import { motXPimport { motion } from 'framer-motion';
import { useStore } frot-impor.5import { useStore } frot-imporr gap-3 te
export defaultnt
export default function TodaySgrimport { useStore } frot-impor.5import { useStore }   export defaultnt
export default function TodayScre       <  const { tasexexport default p-  const highEnergyTasks = useMemo(
    () => tasks.filter((t)y/5    () => tasks. r    () => tasks.filter((t)y/5    ma    () => tasks.filter((t)y/5    () => tasks.mo    () => tasks.filter((t)y/5    :   );

  const guissN
  const guidance = useMemo(() => {
    if (highEnergl}</spaname="space-y-4">
    i   <h    if (highEnergl}</spanameext-bas    if (highEnergl}</span>
2">
          <2">
              <   ex flex-w
  return (
    <div className="space-y-8 pb-32">
      {/* Premeground font-b      {/* Premium cl
  return (
n clas  return (
    <div b   econdary  return (
    <div claground">{task  return (
    rg  return (
    <div>            ie="rounded-full bg-secondary/20 pximport { useStore } frot-impor.5import { useStore } frot-imporr gap-3 te
  export defaultnt
export default function TodaySgrimport { useStor           <button classNexport default function TodayScre       <  const { tasexexport default p-  const highEnergyTasks = uund    () => tasks.filter((t)y/5    () => tasks. r    () => tasks.filter((t)y/5    ma    () => tasks.filter((  
  const guissN
  const guidance = useMemo(() => {
    if (highEnergl}</spaname="space-y-4">
    i   <h    if (highEnergl}</spanameext-bas    if (highEnergl}</span>
2"der-border">
         if (highEnergl}</spaname="spao     i   <h    if (highEnergl}</spanameexen2">
          <2">
              <   ex flex-w
  return (
    <div cla </div             io  return (
    <div cl  );
}
