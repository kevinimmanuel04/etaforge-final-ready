import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Calendar({ value, onChange, isDarkMode }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(value));

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(newDate);
  };

  const isSelected = (day) => {
    return (
      value.getDate() === day &&
      value.getMonth() === currentMonth.getMonth() &&
      value.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <motion.button
        key={day}
        onClick={() => selectDate(day)}
        className={`aspect-square rounded-lg flex items-center justify-center relative overflow-hidden group text-sm ${
          isSelected(day)
            ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
            : isToday(day)
            ? isDarkMode
              ? 'bg-white/10 text-cyan-400 border border-cyan-500/50'
              : 'bg-black/10 text-cyan-600 border border-cyan-500/50'
            : isDarkMode
            ? 'text-gray-300 hover:bg-white/10'
            : 'text-gray-700 hover:bg-black/10'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: day * 0.005 }}
      >
        {!isSelected(day) && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        <span className="relative z-10">{day}</span>
      </motion.button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <motion.button
          onClick={prevMonth}
          className={`p-1.5 rounded-lg transition-colors duration-300 ${
            isDarkMode
              ? 'hover:bg-white/10 text-gray-400 hover:text-cyan-400'
              : 'hover:bg-black/10 text-gray-600 hover:text-cyan-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <motion.div
          key={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            {monthNames[currentMonth.getMonth()]}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentMonth.getFullYear()}
          </p>
        </motion.div>

        <motion.button
          onClick={nextMonth}
          className={`p-1.5 rounded-lg transition-colors duration-300 ${
            isDarkMode
              ? 'hover:bg-white/10 text-gray-400 hover:text-cyan-400'
              : 'hover:bg-black/10 text-gray-600 hover:text-cyan-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className={`text-center text-[10px] py-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}
