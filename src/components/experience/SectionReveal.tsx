"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { easeEditorial, revealTransition } from "@/lib/motionPresets";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function SectionReveal({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.header
      initial={
        reduce
          ? false
          : { opacity: 0, y: 56, filter: "blur(12px)" }
      }
      whileInView={
        reduce
          ? undefined
          : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once: true, margin: "-12%" }}
      transition={revealTransition}
      className={`section-reveal mb-10 sm:mb-12 ${className}`}
    >
      {eyebrow ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, x: -12 }}
          whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeEditorial, delay: 0.05 }}
          className="section-reveal__eyebrow font-display"
        >
          {eyebrow}
        </motion.p>
      ) : null}
      <h2 className="section-reveal__title font-display">{title}</h2>
      {description ? (
        <p className="section-reveal__desc font-serif">{description}</p>
      ) : null}
      {children}
    </motion.header>
  );
}
