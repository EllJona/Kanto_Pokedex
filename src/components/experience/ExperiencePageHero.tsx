"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { easeEditorial } from "@/lib/motionPresets";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function ExperiencePageHero({
  eyebrow,
  title,
  description,
  action,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: easeEditorial }}
      className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <p className="text-on-bg-muted mb-2 font-display text-[10px] font-bold uppercase tracking-[0.4em]">
          {eyebrow}
        </p>
        <h1 className="text-shadow-pokemon font-display text-3xl font-bold text-white sm:text-4xl">
          {title}
        </h1>
        <p className="text-on-bg mt-3 max-w-xl text-sm sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
