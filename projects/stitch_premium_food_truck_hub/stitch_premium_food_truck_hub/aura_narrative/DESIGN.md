---
name: Aura Narrative
colors:
  surface: '#f9f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f9f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f5'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e4'
  on-surface: '#1a1c1d'
  on-surface-variant: '#414753'
  inverse-surface: '#2f3132'
  inverse-on-surface: '#f0f0f2'
  outline: '#727784'
  outline-variant: '#c1c6d5'
  surface-tint: '#005cba'
  primary: '#004e9f'
  on-primary: '#ffffff'
  primary-container: '#0066cc'
  on-primary-container: '#dfe8ff'
  inverse-primary: '#aac7ff'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfe1'
  on-secondary-container: '#636264'
  tertiary: '#4f5054'
  on-tertiary: '#ffffff'
  tertiary-container: '#68686d'
  on-tertiary-container: '#e9e8ed'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458e'
  secondary-fixed: '#e4e2e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1b1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#e3e2e7'
  tertiary-fixed-dim: '#c7c6cb'
  on-tertiary-fixed: '#1a1b1f'
  on-tertiary-fixed-variant: '#46464b'
  background: '#f9f9fb'
  on-background: '#1a1c1d'
  surface-variant: '#e2e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.05'
    letterSpacing: -0.015em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.005em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 21px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.011em
  body-md:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.47'
    letterSpacing: -0.022em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
  section-gap-lg: 160px
  section-gap-md: 80px
---

## Brand & Style

The design system is built upon a philosophy of "Precision through Reduction." It targets a gourmet, high-end audience that values clarity, quality, and the quiet confidence of premium craftsmanship. 

The visual style is a blend of **High-End Minimalism** and **Glassmorphism**. It prioritizes extreme breathing room, allowing content to sit center-stage without the distraction of unnecessary UI ornamentation. The emotional response is one of calm, luxury, and meticulous attention to detail. Interaction should feel effortless, utilizing smooth transitions and a logical hierarchy that mirrors the experience of a high-end physical gallery.

## Colors

The palette is strictly curated to maintain a sophisticated and neutral environment. 

- **Primary**: A precise, vibrant blue used sparingly for interactive cues and essential calls to action.
- **Secondary (Onyx)**: The primary typographic color. It is a deep, off-black that provides high contrast against white without the harshness of pure hex #000.
- **Tertiary (Slate)**: Used for secondary text, metadata, and subtle borders.
- **Surface**: Pure white (#FFFFFF) is the primary canvas. A very light grey (#F5F5F7) is used for section differentiation and container backgrounds to create a soft "layered" effect.

## Typography

Typography in this design system is systematic and editorial. It relies on the **Inter** typeface for its exceptional legibility and neutral, modern character.

- **Scale**: Use dramatic contrast between display headlines and body copy.
- **Leading**: Generous line-height is applied to body text to ensure a comfortable, premium reading experience.
- **Tracking**: Tighten letter-spacing slightly for large headlines to create a "locked-in" professional look, while slightly increasing it for small labels to improve legibility.
- **Hierarchy**: Headlines should be bold and assertive. Product names and key features should use `display-lg` to command attention.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model with strict maximum widths to maintain readability on ultra-wide displays.

- **The 8px Rule**: All spacing (padding, margins, gaps) must be a multiple of 8px.
- **Vertical Rhythm**: Use significant vertical padding between sections (`section-gap-lg`) to create "breathing room." This intentional emptiness is a core brand pillar.
- **Grid**: A 12-column grid is used for desktop layouts. On mobile, transition to a 4-column grid with reduced margins.
- **Alignment**: Content is generally centered for landing pages and high-impact marketing sections, while functional SaaS-like views should use a left-aligned, systematic layout.

## Elevation & Depth

Depth is achieved through high-fidelity effects rather than heavy shadows.

- **Glassmorphism**: Navigation bars and floating controls use a `background-blur` (minimum 20px) and a semi-transparent white fill (approx 80% opacity). This allows colors from the content to bleed through subtly.
- **Ambient Shadows**: Use extremely diffused, soft shadows for cards. Shadows should have a large blur radius (30px+) and very low opacity (5-8%) to feel like natural ambient light rather than a digital drop shadow.
- **Tonal Layering**: Use `#F5F5F7` for secondary background containers to suggest depth without the need for elevation.

## Shapes

The shape language is defined by large, organic radii that feel friendly yet engineered.

- **Large Radius**: Standard containers and cards should use `rounded-xl` (1.5rem/24px) to mimic modern hardware aesthetics.
- **Buttons**: Use pill-shaped (fully rounded) buttons for primary actions to maximize distinctiveness against rectangular grid elements.
- **Interactive States**: Subtle scale-down transforms (e.g., scale 0.98) should be applied on click/tap to provide tactile feedback.

## Components

- **Buttons**:
    - *Primary*: Pill-shaped, solid `#0066CC` with white text.
    - *Secondary*: Pill-shaped, light grey background with primary blue text.
    - *Tertiary*: Text-only with a trailing chevron (`>`).
- **Cards**: Large corner radii (24px), pure white or light gray background, with no border. Use soft ambient shadows to lift them off the background.
- **Input Fields**: Minimalist design with a subtle border that darkens on focus. Labels should be small and placed above the field.
- **Navigation**: Persistent top bar with a glassmorphic blur. Text links are small (`label-md`) and use the Tertiary color, shifting to Secondary on hover.
- **Chips/Badges**: Small, capsule-shaped elements with light backgrounds and neutral text for category tagging.
- **Imagery**: Photography is the most important component. Use "Hero-centric" layouts where images span the full width of the container, featuring clean, monochromatic or studio-lit backgrounds.