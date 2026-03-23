export const echosEase = [0.22, 1, 0.36, 1] as const;

export const echosTransition = {
  duration: 0.2,
  ease: echosEase,
};

export const hoverLift = {
  whileHover: { y: -2, transition: echosTransition },
  whileTap: { scale: 0.97, transition: echosTransition },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: echosTransition },
  exit: { opacity: 0, scale: 0.95, transition: echosTransition },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};
