import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

const GoalProgressCircular = ({ percentage, text, strokeWidth = 8, achieved = false }) => {
  let pathColor = 'rgb(52, 152, 219)'; // primary-light (approx)
  let textColor = '#34495e'; // text-light (approx)
  // Attempt to get theme colors if possible, otherwise use defaults
  // This component might not have direct access to ThemeContext easily
  // For a real app, you'd pass theme-aware colors as props or use CSS variables

  // These are approximations. Better to use CSS variables set by ThemeContext
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
      pathColor = 'rgb(56, 189, 248)'; // primary-dark
      textColor = '#e2e8f0'; // text-dark
  }

  if (achieved) {
    pathColor = isDark ? 'rgb(74, 222, 128)' : 'rgb(34, 197, 94)'; // secondary-dark/light
  } else if (percentage > 85) {
    pathColor = isDark ? 'rgb(250, 204, 21)' : 'rgb(245, 158, 11)'; // yellow-400/500
  }


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{ width: '100%', maxWidth: '150px' }} // Control size from parent or here
    >
      <CircularProgressbar
        value={percentage}
        text={text || `${percentage.toFixed(0)}%`}
        strokeWidth={strokeWidth}
        styles={buildStyles({
          // Rotation of path and trail, in number of turns (0-1)
          // rotation: 0.25,

          // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
          strokeLinecap: 'round',

          // Text size
          textSize: '18px',

          // How long animation takes to go from one percentage to another, in seconds
          pathTransitionDuration: 0.8,

          // Colors
          pathColor: pathColor,
          textColor: textColor,
          trailColor: isDark ? 'rgba(255,255,255,0.1)' : '#d6d6d6', // Light gray trail
          backgroundColor: 'transparent', // Not typically used for path, but available
        })}
      />
    </motion.div>
  );
};

export default GoalProgressCircular;