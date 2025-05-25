import React from 'react';
import PageTransition from '../animations/PageTransition';

/**
 * AnimatedPage is a wrapper component that adds animation to page transitions
 * It uses the PageTransition component with customizable animation options
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to animate
 * @param {string} props.variant - Animation variant (fadeIn, slideUp, slideDown, slideLeft, slideRight, scale, flip)
 * @param {string} props.transition - Transition timing (default, slow, bounce)
 * @param {boolean} props.staggerChildren - Whether to stagger child animations
 * @param {string} props.className - Additional CSS classes
 */
const AnimatedPage = ({ 
  children, 
  variant = 'slideUp', 
  transition = 'default',
  staggerChildren = false,
  className = ""
}) => {
  return (
    <PageTransition
      variant={variant}
      transition={transition}
      staggerChildren={staggerChildren}
      className={className}
    >
      {children}
    </PageTransition>
  );
};

export default AnimatedPage;
