import { useState } from 'react';
import { motion } from 'framer-motion';

export function TimePicker({ hours, minutes, onChange, isDarkMode }) {
  const [isAM, setIsAM] = useState(hours < 12);
  const [displayHours, setDisplayHours] = useState(hours % 12 || 12);
  const [displayMinutes, setDisplayMinutes] = useState(minutes);

  const handleHourScroll = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    let newHours = displayHours + delta;
    
    if (newHours > 12) newHours = 1;
    if (newHours < 1) newHours = 12;
    
    setDisplayHours(newHours);
    const hours24 = isAM ? (newHours % 12) : (newHours % 12) + 12;
    onChange(hours24, displayMinutes);
  };

  const handleMinuteScroll = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    let newMinutes = displayMinutes + delta;
    
    if (newMinutes > 59) newMinutes = 0;
    if (newMinutes < 0) newMinutes = 59;
    
    setDisplayMinutes(newMinutes);
    const hours24 = isAM ? (displayHours % 12) : (displayHours % 12) + 12;
    onChange(hours24, newMinutes);
  };

  const toggleAMPM = () => {
    const newIsAM = !isAM;
    setIsAM(newIsAM);
    const hours24 = newIsAM ? (displayHours % 12) : (displayHours % 12) + 12;
    onChange(hours24, displayMinutes);
  };

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <ScrollableTimeDisplay
        value={displayHours}
        onScroll={handleHourScroll}
        label="Hours"
        isDarkMode={isDarkMode}
      />
      
      <span className="text-3xl text-cyan-400">:</span>
      
      <ScrollableTimeDisplay
        value={displayMinutes}
        onScroll={handleMinuteScroll}
        label="Minutes"
        isDarkMode={isDarkMode}
      />
      
      <motion.button
        onClick={toggleAMPM}
        className="ml-2 px-3 py-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-400 text-sm transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isAM ? 'AM' : 'PM'}
      </motion.button>
    </div>
  );
}

function ScrollableTimeDisplay({ value, onScroll, label, isDarkMode }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-[10px] mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
        {label}
      </span>
      <motion.div
        onWheel={onScroll}
        className={`px-4 py-2 rounded-lg border hover:border-cyan-500/50 cursor-ns-resize select-none transition-all duration-300 ${
          isDarkMode
            ? 'bg-white/5 border-white/10 hover:bg-white/10'
            : 'bg-black/5 border-black/10 hover:bg-black/10'
        }`}
        whileHover={{ scale: 1.05 }}
      >
        <motion.span
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-3xl tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
        >
          {value.toString().padStart(2, '0')}
        </motion.span>
      </motion.div>
    </div>
  );
}
