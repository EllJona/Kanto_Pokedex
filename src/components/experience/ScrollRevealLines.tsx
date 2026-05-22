"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { revealTransition } from "@/lib/motionPresets";

type Props = {
  lines: string[];
  attribution?: string;
};

function RevealLine({
  line,
  index,
  total,
}: {
  line: string;
  index: number;
  total: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.45"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 1],
    reduce ? [1, 1, 1] : [0.12, 0.55, 1]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [48 - index * 6, 0]
  );
  const blur = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? ["blur(0px)", "blur(0px)", "blur(0px)"] : ["blur(10px)", "blur(4px)", "blur(0px)"]
  );

  return (
    <motion.p
      ref={ref}
      style={{ opacity, y, filter: blur }}
      className={`experience-line ${index === total - 1 ? "experience-line--emphasis" : ""}`}
    >
      {line}
    </motion.p>
  );
}

export function ScrollRevealLines({ lines, attribution }: Props) {
  return (
    <section className="experience-passage relative z-[1] mx-auto max-w-4xl px-6 py-[min(18vh,9rem)] sm:px-10 sm:py-[min(22vh,11rem)]">
      <div className="experience-passage__inner">
        {lines.map((line, i) => (
          <RevealLine key={`${i}-${line.slice(0, 12)}`} line={line} index={i} total={lines.length} />
        ))}
        {attribution ? (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ ...revealTransition, delay: 0.2 }}
            className="experience-attribution mt-10"
          >
            {attribution}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
