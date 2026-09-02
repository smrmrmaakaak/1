import { Color } from 'three';

/**
 * Final look pass (runs after tone mapping, in display space).
 * Features authentic Marineford Ep 484 High-Contrast Red & Cyan Anime Impact Frame.
 */
export const GradeShader = {
  name: 'GradeShader',

  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAberration: { value: 0.35 },
    uVignette: { value: 0.4 },
    uContrast: { value: 1.05 },
    uSaturation: { value: 1.1 },
    uTemperature: { value: 0.05 },
    uLift: { value: 0.0 },
    uGain: { value: 1.0 },
    uGrain: { value: 0.03 },
    uFlashColor: { value: new Color(1, 1, 1) },
    uFlashStrength: { value: 0 },
    uNegativeInvert: { value: 0.0 }
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAberration;
    uniform float uVignette;
    uniform float uContrast;
    uniform float uSaturation;
    uniform float uTemperature;
    uniform float uLift;
    uniform float uGain;
    uniform float uGrain;
    uniform vec3  uFlashColor;
    uniform float uFlashStrength;
    uniform float uNegativeInvert;

    varying vec2 vUv;

    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      vec2 uv = vUv;
      vec2 centered = uv - 0.5;
      float r2 = dot(centered, centered);

      // Extreme radial chromatic aberration burst during negative invert
      float aberrationScale = uAberration + uNegativeInvert * 6.0;

      // ---- chromatic aberration (radial) ------
      vec3 color;
      if (aberrationScale > 0.001) {
        vec2 offset = centered * r2 * aberrationScale * 0.03;
        color.r = texture2D(tDiffuse, uv + offset).r;
        color.g = texture2D(tDiffuse, uv).g;
        color.b = texture2D(tDiffuse, uv - offset).b;
      } else {
        color = texture2D(tDiffuse, uv).rgb;
      }

      // ---- grading -------------------------------------------------------
      color = (color - 0.5) * uContrast + 0.5;
      color = color * uGain + uLift;

      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, uSaturation);

      // Temperature
      color.r += uTemperature * 0.12;
      color.b -= uTemperature * 0.12;

      // ---- Marineford Ep 484 Impact Frame (Pure Black / Cyan / Crimson Red) ----
      if (uNegativeInvert > 0.001) {
        // High contrast posterized comic inversion
        vec3 cyanElectric = vec3(0.0, 0.95, 1.4);
        vec3 crimsonRed = vec3(1.2, 0.02, 0.05);
        vec3 pureWhite = vec3(1.8, 1.8, 2.0);
        vec3 voidBlack = vec3(0.02, 0.01, 0.04);

        vec3 animeFrame = voidBlack;
        if (luma > 0.65) {
          animeFrame = mix(cyanElectric, pureWhite, (luma - 0.65) / 0.35);
        } else if (luma > 0.35) {
          animeFrame = cyanElectric * 0.8;
        } else if (luma > 0.12) {
          animeFrame = crimsonRed;
        }

        // Radial speedline rim shading
        animeFrame = mix(animeFrame, crimsonRed * 1.5, smoothstep(0.12, 0.55, r2) * 0.8);

        color = mix(color, animeFrame, clamp(uNegativeInvert * 1.4, 0.0, 1.0));
      }

      // ---- vignette ------------------------------------------------------
      color *= 1.0 - uVignette * smoothstep(0.15, 0.72, r2 * 1.9);

      // ---- impact flash --------------------------------------------------
      if (uFlashStrength > 0.001) {
        color = mix(color, uFlashColor, clamp(uFlashStrength, 0.0, 1.0) * 0.75);
      }

      // ---- grain ---------------------------------------------------------
      if (uGrain > 0.0005) {
        float grain = hash12(uv * vec2(1920.0, 1080.0) + fract(uTime) * 137.0) - 0.5;
        color += grain * uGrain;
      }

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }
  `
};
