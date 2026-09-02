import React from "react";

export default function ParchmentTexture() {
  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        {/* 1. Photorealistic Heavy Vellum Grain & Aging Texture */}
        <filter id="real-vellum-texture" x="0%" y="0%" width="100%" height="100%">
          {/* Base Paper Fiber Turbulence */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.04"
            numOctaves="6"
            result="paperFibers"
          />
          {/* Micro Crinkles & Surface Noise */}
          <feTurbulence
            type="turbulence"
            baseFrequency="0.45 0.45"
            numOctaves="3"
            result="microNoise"
          />
          <feComposite in="paperFibers" in2="microNoise" operator="arithmetic" k1="0" k2="0.8" k3="0.2" k4="0" result="combinedNoise" />
          
          {/* Diffuse Lighting to create genuine paper bump / tactile relief */}
          <feDiffuseLighting
            in="combinedNoise"
            lightingColor="#faf0d7"
            surfaceScale="2.8"
            diffuseConstant="0.92"
            result="lightPaper"
          >
            <feDistantLight azimuth="55" elevation="48" />
          </feDiffuseLighting>
          
          <feBlend mode="multiply" in="SourceGraphic" in2="lightPaper" result="blendedPaper" />
        </filter>

        {/* 2. Gold Leaf Foil Dynamic Specular Glint */}
        <filter id="gold-leaf-relief" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="4" result="goldNoise" />
          <feDiffuseLighting in="goldNoise" lightingColor="#fff6cc" surfaceScale="3" diffuseConstant="1.2" result="goldLight">
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          <feBlend mode="overlay" in="SourceGraphic" in2="goldLight" />
        </filter>

        {/* 3. Authentic Jagged Deckle Paper Edge Path */}
        <clipPath id="deckle-page-left" clipPathUnits="objectBoundingBox">
          <path d="M 0.02,0.01 
                   C 0.05,0.008 0.15,0.012 0.35,0.008 
                   C 0.55,0.011 0.75,0.007 0.98,0.01
                   L 0.99,0.01
                   L 0.99,0.99
                   C 0.75,0.993 0.55,0.988 0.35,0.992
                   C 0.15,0.988 0.05,0.992 0.02,0.99
                   C 0.012,0.85 0.018,0.70 0.012,0.50
                   C 0.018,0.30 0.012,0.15 0.02,0.01 Z" />
        </clipPath>

        <clipPath id="deckle-page-right" clipPathUnits="objectBoundingBox">
          <path d="M 0.01,0.01 
                   C 0.25,0.008 0.55,0.012 0.75,0.008 
                   C 0.88,0.011 0.96,0.007 0.98,0.01
                   C 0.988,0.15 0.982,0.30 0.988,0.50
                   C 0.982,0.70 0.988,0.85 0.98,0.99
                   C 0.96,0.992 0.88,0.988 0.75,0.992
                   C 0.55,0.988 0.25,0.992 0.01,0.99
                   L 0.01,0.01 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
