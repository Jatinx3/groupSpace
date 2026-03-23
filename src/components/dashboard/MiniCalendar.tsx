"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
}

interface Props {
  tasks: Task[];
}

export default function MiniCalendar({ tasks }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0 (Sunday) to 6 (Saturday)

  const blanks = Array(startDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const toggleBlockDate = (dateStr: string) => {
    setBlockedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isToday = (date: Date) => isSameDay(date, new Date());

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectedDateStr = selectedDate ? formatDateString(selectedDate) : null;
  const selectedDateTasks = tasks.filter(
    (t) => t.due_date && isSameDay(new Date(t.due_date), selectedDate || new Date())
  );

  const isBlocked = (date: Date) => blockedDates.includes(formatDateString(date));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 p-5 shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400 dark:text-zinc-500 mb-2">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-8" />
        ))}
        {days.map((day, i) => {
          const isSel = selectedDate && isSameDay(day, selectedDate);
          const isTod = isToday(day);
          const dateStr = formatDateString(day);
          const hasTask = tasks.some((t) => t.due_date && isSameDay(new Date(t.due_date), day));
          const blocked = isBlocked(day);

          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium transition relative group
                ${isSel ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300"}
                ${isTod && !isSel ? "border border-gray-900 dark:border-white text-gray-900 dark:text-white" : ""}
                ${blocked && !isSel ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : ""}
              `}
            >
              {day.getDate()}

              {/* Deadline Dot */}
              {hasTask && !isSel && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
              )}
              
              {/* Blocked dot/bar */}
              {blocked && !isSel && (
                <span className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda / Quick Action */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDateStr}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <button
                onClick={() => selectedDate && toggleBlockDate(formatDateString(selectedDate))}
                className="text-[10px] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 px-2 py-1 rounded-md text-gray-600 dark:text-zinc-400 transition"
              >
                {selectedDate && isBlocked(selectedDate) ? "Unblock Day" : "Block Day"}
              </button>
            </div>

            {selectedDateTasks.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-zinc-500 italic">No events or deadlines</p>
            ) : (
              <ul className="space-y-1.5">
                {selectedDateTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
