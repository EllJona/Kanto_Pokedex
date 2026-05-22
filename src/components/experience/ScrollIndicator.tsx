"use client";

import { motion, useScroll, useTransform } from "framer-motion";

type Props = {
  target?: React.RefObject<HTMLElement | null>;
};

export function ScrollIndicator({ target }: Props) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.15], [0, 16]);

  return (
    <motion.div
      className="scroll-indicator"
      style={{ opacity, y }}
      aria-hidden
    >
      <span className="scroll-indicator__label font-display">
        Scroll para explorar
      </span>
      <span className="scroll-indicator__line" />
    </motion.div>
  );
}
