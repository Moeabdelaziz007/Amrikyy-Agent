// Advanced Animation Utilities for Framer Motion
import { Variants, Transition } from 'framer-motion'

// Smooth easing curves
export const easings = {
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  easeInOutQuart: [0.77, 0, 0.175, 1],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  spring: { type: "spring", stiffness: 300, damping: 30 }
} as const

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.easeInOutCubic
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: easings.easeInOutCubic
    }
  }
}

// Staggered container animations
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.3
    }
  }
}

export const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.9 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.easeOutBack
    }
  }
}

// Card hover animations
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2,
      ease: easings.easeInOutCubic
    }
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: {
      duration: 0.2,
      ease: easings.easeInOutCubic
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
}

// Button press animation
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: easings.easeOutBack }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}

// Modal/Dialog animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 100
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOutBack
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 100,
    transition: {
      duration: 0.2,
      ease: easings.easeInOutCubic
    }
  }
}

// Backdrop animation
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

// Floating elements animation
export const floatingVariants: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Slide in animations
export const slideVariants = {
  left: {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: easings.easeOutBack }
    }
  },
  right: {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: easings.easeOutBack }
    }
  },
  up: {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: easings.easeOutBack }
    }
  },
  down: {
    hidden: { opacity: 0, y: -100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: easings.easeOutBack }
    }
  }
}

// Loading spinner variants
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Pulse animation for loading states
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}