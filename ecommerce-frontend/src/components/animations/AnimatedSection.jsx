import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedSection component for animating individual sections within a page
 * This is useful for creating staggered animations for different parts of the page
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to animate
 * @param {string} props.variant - Animation variant name
 * @param {number} props.delay - Delay before animation starts (in seconds)
 * @param {Object} props.custom - Custom animation properties
 * @param {string} props.className - Additional CSS classes
 */
const AnimatedSection = ({ 
  children, 
  variant = 'fadeIn', 
  delay = 0, 
  custom = {},
  className = ""
}) => {
  // Animation variants
  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    },
    slideDown: {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    ...custom
  };

  const selectedVariant = variants[variant] || variants.fadeIn;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={selectedVariant}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: "easeOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
