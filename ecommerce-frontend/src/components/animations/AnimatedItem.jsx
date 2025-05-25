import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedItem component for animating individual items in a list or grid
 * Useful for creating staggered animations for collections of items
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to animate
 * @param {number} props.index - Index of the item in the list (for staggered animations)
 * @param {string} props.variant - Animation variant name
 * @param {string} props.className - Additional CSS classes
 */
const AnimatedItem = ({ 
  children, 
  index = 0, 
  variant = 'fadeIn',
  className = "" 
}) => {
  // Animation variants
  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          delay: index * 0.1,
          duration: 0.5
        }
      }
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: index * 0.1,
          duration: 0.5
        }
      }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          delay: index * 0.1,
          duration: 0.5
        }
      }
    },
    pop: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          delay: index * 0.1,
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }
    }
  };

  const selectedVariant = variants[variant] || variants.fadeIn;

  return (
    <motion.div
      variants={selectedVariant}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedItem;
