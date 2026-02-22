// ──────────────────────────────────────────
// ScrollReveal — smooth spring-based scroll-triggered animations
// ──────────────────────────────────────────
import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 18,
      mass: 0.8,
      delay: i * 0.1,
    },
  }),
};

export default function ScrollReveal({ children, className = '', index = 0, once = true }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      custom={index}
      className={className}
    >
      {children}
    </motion.div>
  );
}
