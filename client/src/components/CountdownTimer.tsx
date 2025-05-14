import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  endDate: Date;
  className?: string;
  compact?: boolean; // Compact mode for banners
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, className = '', compact = false }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Function to calculate time remaining
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        // Sale has expired
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      // Calculate time components
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Set up interval to update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [endDate]);

  // If the timer has expired
  if (isExpired) {
    return (
      <motion.div 
        className={`${compact ? 'text-white' : 'text-red-500'} font-medium ${className}`}
        style={{ marginLeft: '6px' }} // Add explicit left margin for spacing
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { duration: 0.3 }
        }}
      >
        Sale has ended
      </motion.div>
    );
  }

  if (compact) {
    // Compact version for the banner - without "Ends in" text
    return (
      <motion.div 
        className={`inline-flex items-center space-x-1 text-white font-medium ${className}`}
        style={{ marginLeft: '6px' }} // Add explicit left margin for spacing
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { duration: 0.3 }
        }}
      >
        <span className="inline-flex gap-1">
          {timeLeft.days > 0 && (
            <span className="font-bold tabular-nums">{timeLeft.days}d</span>
          )}
          {(timeLeft.days > 0 || timeLeft.hours > 0) && (
            <span className="font-bold tabular-nums">{timeLeft.hours}h</span>
          )}
          {(timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0) && (
            <span className="font-bold tabular-nums">{timeLeft.minutes}m</span>
          )}
          <span className="font-bold tabular-nums">{timeLeft.seconds}s</span>
        </span>
      </motion.div>
    );
  }

  // Standard version for product descriptions - clean version without "Only" or "left!"
  return (
    <motion.div 
      className={`flex items-center space-x-1 text-red-500 font-medium ${className}`}
      style={{ marginLeft: '6px' }} // Add explicit left margin for spacing
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: { duration: 0.3 }
      }}
    >
      {timeLeft.days > 0 && (
        <motion.span 
          key={`days-${timeLeft.days}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="font-bold"
        >
          {timeLeft.days}d
        </motion.span>
      )}
      {(timeLeft.days > 0 || timeLeft.hours > 0) && (
        <motion.span 
          key={`hours-${timeLeft.hours}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="font-bold"
        >
          {timeLeft.hours}h
        </motion.span>
      )}
      {(timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0) && (
        <motion.span 
          key={`minutes-${timeLeft.minutes}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="font-bold"
        >
          {timeLeft.minutes}m
        </motion.span>
      )}
      <motion.span 
        key={`seconds-${timeLeft.seconds}`}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="font-bold"
      >
        {timeLeft.seconds}s
      </motion.span>
    </motion.div>
  );
};

export default CountdownTimer;