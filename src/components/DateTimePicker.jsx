import { useState } from 'react';
import { Calendar } from './Calendar';
import { TimePicker } from './TimePicker';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export function DateTimePicker({ value, onChange, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('date');
  const [tempDate, setTempDate] = useState(value || new Date());

  const handleDateChange = (date) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());
    setTempDate(newDate);
  };

  const handleTimeChange = (hours, minutes) => {
    const newDate = new Date(tempDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setTempDate(newDate);
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl backdrop-blur-xl border transition-all duration-300 group relative overflow-hidden ${
          isDarkMode 
            ? 'bg-white/5 border-white/10 hover:border-cyan-500/50' 
            : 'bg-black/5 border-black/10 hover:border-cyan-500/50'
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all duration-300">
              <CalendarIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-left">
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date & Time</p>
              <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {value
                  ? value.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Select date & time'}
              </p>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            ▼
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 w-full mt-2 p-4 rounded-xl backdrop-blur-2xl border shadow-2xl shadow-cyan-500/10 ${
              isDarkMode 
                ? 'bg-gray-900/95 border-white/10' 
                : 'bg-white/95 border-black/10'
            }`}
          >
            <div className="flex gap-2 mb-4">
              <TabButton
                active={activeTab === 'date'}
                onClick={() => setActiveTab('date')}
                icon={<CalendarIcon className="w-3 h-3" />}
                label="Date"
                isDarkMode={isDarkMode}
              />
              <TabButton
                active={activeTab === 'time'}
                onClick={() => setActiveTab('time')}
                icon={<Clock className="w-3 h-3" />}
                label="Time"
                isDarkMode={isDarkMode}
              />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'date' ? (
                <motion.div
                  key="date"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <Calendar value={tempDate} onChange={handleDateChange} isDarkMode={isDarkMode} />
                </motion.div>
              ) : (
                <motion.div
                  key="time"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <TimePicker
                    hours={tempDate.getHours()}
                    minutes={tempDate.getMinutes()}
                    onChange={handleTimeChange}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 mt-4">
              <motion.button
                onClick={handleClear}
                className={`flex-1 px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                    : 'bg-black/5 border-black/10 text-gray-600 hover:bg-black/10 hover:text-black'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, isDarkMode }) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
        active
          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400'
          : isDarkMode
          ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
          : 'bg-black/5 border border-black/10 text-gray-600 hover:bg-black/10 hover:text-black'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}
