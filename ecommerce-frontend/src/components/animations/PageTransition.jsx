import { motion } from 'framer-motion';

// Animation variants for different transition effects
export const pageVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 }
  },
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  },
  flip: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: -90 }
  },
  staggered: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }
};

// Transition timing configurations
export const pageTransitions = {
  default: {
    duration: 0.4,
    ease: [0.43, 0.13, 0.23, 0.96] // Custom easing curve
  },
  slow: {
    duration: 0.7,
    ease: "easeInOut"
  },
  bounce: {
    type: "spring",
    stiffness: 300,
    damping: 20
  },
  staggered: {
    staggerChildren: 0.1,
    delayChildren: 0.2
  }
};

/**
 * PageTransition component that wraps content with motion animations
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to animate
 * @param {string} props.variant - Animation variant name (fadeIn, slideUp, etc.)
 * @param {string} props.transition - Transition timing name (default, slow, bounce)
 * @param {boolean} props.staggerChildren - Whether to stagger child animations
 */
const PageTransition = ({ 
  children, 
  variant = 'fadeIn', 
  transition = 'default',
  staggerChildren = false,
  className = ""
}) => {
  const selectedVariant = pageVariants[variant] || pageVariants.fadeIn;
  const selectedTransition = staggerChildren 
    ? pageTransitions.staggered 
    : (pageTransitions[transition] || pageTransitions.default);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={selectedVariant}
      transition={selectedTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
