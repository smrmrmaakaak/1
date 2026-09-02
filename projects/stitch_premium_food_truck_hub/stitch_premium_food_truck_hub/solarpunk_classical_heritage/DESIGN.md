---
name: Solarpunk Classical Heritage
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e3e2e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#414846'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#717976'
  outline-variant: '#c1c8c4'
  surface-tint: '#43655c'
  primary: '#01261f'
  on-primary: '#ffffff'
  primary-container: '#1a3c34'
  on-primary-container: '#83a69c'
  inverse-primary: '#aacec3'
  secondary: '#4a6545'
  on-secondary: '#ffffff'
  secondary-container: '#c9e8bf'
  on-secondary-container: '#4f6a49'
  tertiary: '#21211b'
  on-tertiary: '#ffffff'
  tertiary-container: '#373630'
  on-tertiary-container: '#a19f96'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5eadf'
  primary-fixed-dim: '#aacec3'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#2b4d44'
  secondary-fixed: '#ccebc2'
  secondary-fixed-dim: '#b1cfa7'
  on-secondary-fixed: '#082007'
  on-secondary-fixed-variant: '#334d2f'
  tertiary-fixed: '#e5e2d9'
  tertiary-fixed-dim: '#c9c6bd'
  on-tertiary-fixed: '#1c1c16'
  on-tertiary-fixed-variant: '#484740'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system embodies a synthesis of ecological stewardship and classical refinement. It targets a sophisticated audience that values both the permanence of heritage and the promise of sustainable technology.

The design style is **Organic-Futurism**. It blends the structural elegance of classical architecture with the translucency of modern glassmorphism. This is achieved through high-contrast typography, delicate line work, and a tactile "Parchment" base that suggests historical continuity, overlaid with "Glass" components that signal advanced tech. The emotional response should be one of calm optimism—feeling grounded in history yet propelled by innovation.

## Colors
The palette is rooted in the natural world with a sharp digital edge.

- **Primary (Deep Forest Green):** Used for primary text, deep backgrounds, and grounding elements. It provides the "Classical" weight.
- **Secondary (Soft Sage):** Used for decorative elements, subtle backgrounds, and natural transitions.
- **Tertiary (Warm Parchment):** The foundation color for the UI canvas, providing a tactile, organic feel compared to pure white.
- **Accent (Electric Teal):** Used sparingly for interactive states, progress indicators, and futuristic highlights. It should "glow" against the organic tones.

Use **Neutral Tones** derived from the Primary color (desaturated Forest Green) for utility states to maintain a cohesive natural appearance.

## Typography
The typographic hierarchy creates a tension between the past and future.

- **Headlines:** Use **Playfair Display**. Its high contrast and elegant serifs evoke the "Heritage" aspect. Use tighter tracking for large display sizes to emphasize its editorial quality.
- **Body & Labels:** Use **Inter**. Set with slightly generous tracking (0.01em - 0.05em) to provide a clean, technical "Futuristic" legibility that balances the ornate headlines.
- **Utility:** Labels should be set in uppercase Inter with wide tracking to mimic technical architectural annotations.

## Layout & Spacing
The layout follows a **Fluid Grid** model influenced by classical proportions (the Golden Ratio).

- **Grid:** A 12-column system on desktop with generous 64px outer margins to create a high-end, spacious feel.
- **Rhythm:** Use an 8px baseline grid. Elements should be spaced with large "breathing room" (LG and XL units) to reflect the openness of sustainable urban planning.
- **Responsive:** On mobile, margins reduce to 16px, and the grid collapses to 4 columns. Components should maintain height but adjust horizontal padding to fit the tighter viewport.

## Elevation & Depth
This design system uses **Tonal Glassmorphism** rather than traditional shadows.

- **Surfaces:** The base layer is the solid "Warm Parchment."
- **Overlays:** Secondary panels and modals use "Glass" surfaces—semi-transparent Soft Sage or white with a 20px backdrop blur and a 1px "Thin Elegant Border" (#1A3C34 at 10% opacity).
- **Shadows:** Avoid heavy black shadows. Use soft, diffused "Ambient Glows" in the Primary color (opacity 5-8%) to suggest objects are resting gently on the parchment surface.
- **Texture:** Apply a very subtle noise/grain texture to the Parchment base to mimic organic paper fibers.

## Shapes
Shapes are **Organic and Sophisticated**. 

The "Rounded" (0.5rem) standard reflects the soft curves found in nature. However, specific display containers should use asymmetric "Organic" curves (e.g., `border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%`) for decorative masks of imagery (lush greenery) to break the rigidity of the digital grid. Interactive elements like buttons should remain consistent at the `rounded-lg` (1rem) level.

## Components
- **Buttons:** Primary buttons use Deep Forest Green with White or Electric Teal text. Use a 1px border. Hover states should introduce a "glow" using the Electric Teal.
- **Input Fields:** Use a "Ghost" style with only a bottom border (1px) in Deep Forest Green, reminiscent of classical stationery, but with a Soft Sage glass background when focused.
- **Cards:** Combine a subtle paper texture background with "Glass" headers. Use thin 1px borders.
- **Chips/Badges:** Pill-shaped with Soft Sage backgrounds and Forest Green text.
- **Progress Indicators:** Use Electric Teal for the "active" portion of bars or rings to signify the high-tech power source of the interface.
- **Imagery:** All photos should have a slightly warm, classical tint. Frame architectural shots with organic, rounded-corner masks.