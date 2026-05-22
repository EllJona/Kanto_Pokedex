"use client";

import { useEffect, useState } from "react";

/** Floresta/rota — mesma arte da arena (`public/battle/fundo-batalha.jpg`). */
const SITE_BG_PHOTO = "/site/site-bg.jpg";
/** Tile relva FRLG — pret/pokefirered (MIT), só se a foto falhar. */
const SITE_BG_TILE = "/site/frlg-grass-terrain.png";

export function PokemonSiteBackground() {
  const [photoOk, setPhotoOk] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = SITE_BG_PHOTO;
    img.onload = () => setPhotoOk(true);
    img.onerror = () => setPhotoOk(false);
  }, []);

  return (
    <div className="site-bg" aria-hidden>
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
      <div className="site-bg-overlay" />
    </div>
  );
}
