import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedTableRowProps {
  children: React.ReactNode;
  id: number | string;
  index: number;
  isActive: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

export const AnimatedTableRow: React.FC<AnimatedTableRowProps> = ({
  children,
  id,
  index,
  isActive,
  onAnimationComplete,
  className = '',
}) => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const [prevIndex, setPrevIndex] = useState(index);
  const [prevActive, setPrevActive] = useState(isActive);
  const controls = useAnimation();
  
  // Calculate distance and direction for slide animation
  const getSlideAnimation = () => {
    if (prevIndex === index) return {};
    
    const direction = prevIndex > index ? 'up' : 'down';
    const distance = Math.abs(prevIndex - index) * 56; // Approximate row height
    
    if (direction === 'up') {
      return {
        y: [-distance, 0],
        opacity: [0.5, 1],
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      };
    } else {
      return {
        y: [distance, 0],
        opacity: [0.5, 1],
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      };
    }
  };
  
  // Handle status change animation
  const getStatusChangeAnimation = () => {
    if (prevActive === isActive) return {};
    
    // When status changes, animate more dramatically
    return {
      backgroundColor: [
        '#ffffff', 
        isActive ? 'rgba(220, 252, 231, 0.3)' : 'rgba(254, 226, 226, 0.3)', 
        isActive ? 'rgba(220, 252, 231, 0.1)' : 'rgba(254, 226, 226, 0)'
      ],
      x: [0, isActive ? -5 : 5, 0], // Slight horizontal movement based on activation state
      scale: [1, 1.01, 1],
      transition: { 
        duration: 0.7, 
        ease: [0.2, 0.65, 0.3, 0.9] // Custom easing for a nice "bounce" effect
      }
    };
  };
  
  // Track when index or active status changes to trigger animations
  useEffect(() => {
    const indexChanged = prevIndex !== index;
    const statusChanged = prevActive !== isActive;
    
    if (indexChanged || statusChanged) {
      // Different animation when status changes vs. when position changes
      if (statusChanged) {
        controls.start({
          ...getStatusChangeAnimation(),
        });
      } else if (indexChanged) {
        controls.start({
          ...getSlideAnimation(),
        });
      }
      
      // Update previous values
      if (indexChanged) setPrevIndex(index);
      if (statusChanged) setPrevActive(isActive);
    }
  }, [index, isActive, prevIndex, prevActive]);
  
  return (
    <motion.tr
      ref={rowRef}
      data-discount-id={id}
      data-index={index}
      data-active={isActive ? 'true' : 'false'}
      className={`relative ${className} ${isActive ? 'active-discount-row' : ''}`}
      initial={false}
      animate={controls}
      onAnimationComplete={() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }}
      style={{ 
        zIndex: isActive ? 2 : 1,
        position: 'relative',
        transform: 'translate3d(0, 0, 0)', // Forces GPU acceleration
        borderLeft: isActive ? '2px solid rgb(34, 197, 94)' : 'none',
        transition: 'border-left 0.3s ease-in-out' // Smooth transition for border
      }}
      layoutId={`discount-row-${id}`}
    >
      {children}
    </motion.tr>
  );
};