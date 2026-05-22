"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const SITE_BG_PHOTO = "/site/fundo.png";
const SITE_BG_TILE = "/site/frlg-grass-terrain.png";

export function PokemonSiteBackground() {
  const [photoOk, setPhotoOk] = useState(true);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const overlayDarken = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    [0, 0.18, 0.42]
  );

  useEffect(() => {
    const img = new Image();
    img.src = SITE_BG_PHOTO;
    img.onload = () => setPhotoOk(true);
    img.onerror = () => setPhotoOk(false);
  }, []);

  return (
    <div className="site-bg" aria-hidden>
      <motion.div
        className="site-bg-parallax"
        style={{ y: parallaxY, scale: parallaxScale }}
      >
        {photoOk ? (
          <>
            <div
              className="site-bg-blur"
              style={{ backgroundImage: `url(${SITE_BG_PHOTO})` }}
            />
            <div
              className="site-bg-photo"
              style={{ backgroundImage: `url(${SITE_BG_PHOTO})` }}
            />
          </>
        ) : (
          <div
            className="site-bg-pixel-fallback"
            style={{
              backgroundImage: `linear-gradient(180deg, #7ec8f0 0%, #b8e4fa 42%, #d8f0c8 72%, #6aad5a 100%), url(${SITE_BG_TILE})`,
              backgroundSize: "100% 100%, auto 38%",
              backgroundPosition: "0 0, center bottom",
            }}
          />
        )}
      </motion.div>
      <div className="site-bg-overlay" />
      <motion.div className="site-bg-scroll-veil" style={{ opacity: overlayDarken }} />
    </div>
  );
}
