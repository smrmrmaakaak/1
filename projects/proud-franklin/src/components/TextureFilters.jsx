import React from "react";

export default function TextureFilters() {
  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        {/* 1. Heavy Morocco Leather Pebble Grain & Aging Cracks */}
        <filter id="leather-bump" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.55 0.55"
            numOctaves="5"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0    0    0    1 0"
            in="noise"
            result="grayNoise"
          />
          <feDiffuseLighting
            in="grayNoise"
            lightingColor="#ffffff"
            surfaceScale="3.2"
            diffuseConstant="0.9"
            result="light"
          >
            <feDistantLight azimuth="55" elevation="45" />
          </feDiffuseLighting>
          <feBlend mode="multiply" in="SourceGraphic" in2="light" result="blend" />
        </filter>

        {/* 2. Vintage Leather Distress & Tactile Fissure Displacement */}
        <filter id="vintage-leather-distress" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.04 0.08"
            numOctaves="4"
            seed="7"
            result="coarseNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="coarseNoise"
            scale="3.5"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feDiffuseLighting
            in="coarseNoise"
            lightingColor="#ffe8cc"
            surfaceScale="2.0"
            diffuseConstant="0.75"
            result="leatherLight"
          >
            <feDistantLight azimuth="45" elevation="55" />
          </feDiffuseLighting>
          <feBlend mode="multiply" in="displaced" in2="leatherLight" />
        </filter>

        {/* 3. True 3D Hot-Stamped Gold Embossing Relief */}
        <filter id="vintage-emboss-relief" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="4.5"
            specularConstant="1.4"
            specularExponent="20"
            lightingColor="#fff5d0"
            result="specOut"
          >
            <fePointLight x="-200" y="-300" z="400" />
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litGraphic" />
          <feOffset dx="2" dy="2" in="SourceAlpha" result="offsetShadow" />
          <feGaussianBlur stdDeviation="2" in="offsetShadow" result="blurShadow" />
          <feComponentTransfer in="blurShadow" result="shadowAlpha">
            <feFuncA type="linear" slope="0.8" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="shadowAlpha" />
            <feMergeNode in="litGraphic" />
          </feMerge>
        </filter>

        {/* 4. Ancient Calfskin Parchment / Vellum Fiber & Foxing */}
        <filter id="parchment-fiber" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.04"
            numOctaves="5"
            result="paperNoise"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.88
                    0 0 0 0 0.78
                    0 0 0 0 0.62
                    0 0 0 0.5 0"
            in="paperNoise"
            result="tintedFibers"
          />
          <feComposite in2="SourceGraphic" in="tintedFibers" operator="over" />
        </filter>

        {/* 5. Metallic Gold Leaf Shimmer Micro-Grain */}
        <filter id="gold-shimmer" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.8 0.8"
            numOctaves="3"
            result="fineNoise"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 0.9 0 0 0
                    0 0 0.5 0 0
                    0 0 0 0.35 0"
            in="fineNoise"
            result="goldTint"
          />
          <feBlend mode="overlay" in="SourceGraphic" in2="goldTint" />
        </filter>

        {/* 6. Realistic Drop Shadow with Ambient Occlusion */}
        <filter id="ao-book-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="blur1" />
          <feOffset dx="0" dy="28" result="offset1" />
          <feComponentTransfer in="offset1" result="dark1">
            <feFuncA type="linear" slope="0.65" />
          </feComponentTransfer>

          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur2" />
          <feOffset dx="0" dy="10" result="offset2" />
          <feComponentTransfer in="offset2" result="dark2">
            <feFuncA type="linear" slope="0.85" />
          </feComponentTransfer>

          <feMerge>
            <feMergeNode in="dark1" />
            <feMergeNode in="dark2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
