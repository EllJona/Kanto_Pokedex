"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type Props = {
  urls: string[];
  alt: string;
  className?: string;
  /** Perspectiva GBA: costas um pouco maiores que a frente do oponente. */
  role?: "foe" | "player" | "mini";
  /** >0 dispara um shake curto (ex.: roundKey quando acertou). */
  shakeSignal?: number;
  /** Sutil idle no campo. */
  idle?: boolean;
};

const imgClass =
  "gba-battle-sprite__img max-w-full object-contain object-bottom [image-rendering:pixelated]";

export function BattlePixelSprite({
  urls,
  alt,
  className = "",
  role = "foe",
  shakeSignal = 0,
  idle = true,
}: Props) {
  const [i, setI] = useState(0);
  const url = urls[Math.min(i, urls.length - 1)] ?? "";

  useEffect(() => {
    setI(0);
  }, [urls]);

  const onError = useCallback(() => {
    setI((prev) => (prev + 1 < urls.length ? prev + 1 : prev));
  }, [urls.length]);

  const wrapClass = `gba-battle-sprite gba-battle-sprite--${role} ${className}`;

  if (!idle && shakeSignal === 0) {
    return (
      <div className={wrapClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          draggable={false}
          onError={onError}
          className={imgClass}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={wrapClass}
      animate={
        shakeSignal > 0
          ? {
              x: [0, -7, 7, -5, 5, 0],
              filter: [
                "brightness(1)",
                "brightness(1.45)",
                "brightness(1)",
              ],
            }
          : idle
            ? { x: 0, y: [0, -2, 0] }
            : { x: 0, y: 0 }
      }
      transition={
        shakeSignal > 0
          ? { duration: 0.38, ease: "easeOut" }
          : { repeat: Infinity, duration: 2.8, ease: "easeInOut" }
      }
      initial={{ x: 0, y: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        draggable={false}
        onError={onError}
        className={imgClass}
      />
    </motion.div>
  );
}
