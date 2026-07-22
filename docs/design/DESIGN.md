---
name: Aniversariantes Hub
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#ddb7ff'
  on-secondary: '#490080'
  secondary-container: '#6f00be'
  on-secondary-container: '#d6a9ff'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
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
  unit: 4px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The brand personality is professional, sophisticated, and focused. It targets corporate environments where managing team milestones needs to feel integrated and premium rather than festive and cluttered.

This design system utilizes a **Minimalist Glassmorphism** style. It leans into the depth of dark mode by using translucent layers and high-precision borders to create a "command center" aesthetic. The goal is to evoke a sense of calm reliability through heavy whitespace, sharp execution, and a limited, purposeful color palette.

## Colors
The palette is rooted in a "near-black" foundation to avoid the harshness of pure hex #000. 

- **Foundation:** Zinc-950 (`#09090b`) serves as the base canvas. Slate-900 (`#0f172a`) is used for elevated surface layers to provide a cooling, professional undertone.
- **Accents:** A sophisticated gradient transitioning from Indigo-500 to Purple-500 is reserved exclusively for "Active Milestones" (current birthdays) and primary calls to action.
- **Foreground:** Primary data uses "Ice White" (#f8fafc) for maximum legibility. Secondary labels and metadata use muted Slate grays to maintain visual hierarchy.

## Typography
The system uses a dual-font pairing for a modern corporate feel. **Outfit** is used for headings to provide a clean, geometric, and slightly more expressive personality. **Inter** is used for all functional body text and UI labels due to its exceptional legibility in dark mode and its systematic, neutral tone.

Scale headings down for mobile devices to ensure that long names or dates do not break the layout. Always use `label-sm` for non-interactive metadata to keep the interface uncluttered.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop to maintain a sense of structured "hub" density, centering the content within a 1200px container. 

A strict 4px spacing scale is applied. Layouts should prioritize "Stack" patterns (vertical rhythm) over complex floating grids. Use generous margins (`40px`) on desktop to allow the glassmorphic elements to breathe against the deep background. On mobile, margins tighten to `16px` to maximize screen real estate for list-based data.

## Elevation & Depth
Depth is not achieved through shadows, but through **Tonal Layering** and **Translucency**.

- **Level 0 (Base):** Zinc-950 background.
- **Level 1 (Cards/Panels):** Slate-900 at 70% opacity with a `12px` backdrop-blur. 
- **Level 2 (Modals/Popovers):** Slate-800 at 80% opacity with a `20px` backdrop-blur.

Every elevated element must feature a `1px` solid border using `rgba(255, 255, 255, 0.08)`. This "inner glow" border mimics a light-catching glass edge and is the primary method of separating elements from the background.

## Shapes
This design system utilizes a **Rounded** shape language (`0.5rem` or `8px` base). This provides a professional yet modern appearance that feels more approachable than sharp corners but more serious than pill-shaped elements.

- **Standard Elements (Buttons, Inputs):** 8px radius.
- **Large Elements (Cards, Containers):** 16px radius.
- **Interactive States:** Maintain the same radius but increase border contrast on focus.

## Components

### Buttons
- **Primary:** Gradient background (Indigo to Purple), white text, no border.
- **Secondary/Outline:** Transparent background, `1px` border (White at 20% opacity), white text.
- **Ghost:** No background or border, Slate-400 text, turns White on hover.

### Inputs
Fields should use a slightly darker fill than the surface they sit on. On focus, the border color should shift to Indigo-500 with a subtle `0px 0px 0px 2px rgba(99, 102, 241, 0.2)` outer ring.

### Cards (Birthday Cards)
Cards are the heart of the system. They feature the glassmorphism effect. For active birthdays, the left border should be replaced with a `4px` gradient stripe to provide a high-visibility indicator without breaking the minimalist aesthetic.

### Chips
Used for departments or status. Small, 4px radius, with a Slate-800 background and Slate-300 text. Use uppercase `label-sm` typography.

### Empty States
Use "Wire-style" illustrations with thin 1px lines. Text should be centered, using `headline-md` for the title and `body-md` in Slate-500 for the description. Primary actions should be placed directly below.