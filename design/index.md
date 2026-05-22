# T&J Consulting — Design System

> **Brand:** T&J Consulting  
> **Direction:** Editorial-Premium with a cartoon wink.  
> **Version:** v3 · 2026-05 · Working Document  
> **Stack:** Next.js App Router · Chakra UI v2 · Framer Motion 11 · Lucide React

---

## Sub-Dokumente

| Datei | Inhalt |
|---|---|
| [colors.md](./colors.md) | 9 Color Tokens, Semantic Mapping, Palette |
| [typography.md](./typography.md) | Fonts, Type Scale, 4 Type Moments |
| [gradients.md](./gradients.md) | 20+ Gradient-Varianten, Einsatzregeln |
| [cards.md](./cards.md) | Alle Card-Varianten (Marketing + Plattform) |
| [components.md](./components.md) | Buttons, Badges, Inputs, Icons, Trail |
| [motion.md](./motion.md) | Easings, Durations, Framer Motion Variants, Easter Eggs |
| [layout.md](./layout.md) | Spacing, Radii, Shadows, Grid, Breakpoints |

---

## System-Inventar

| Token-Gruppe | Anzahl |
|---|---|
| Farben | 9 |
| Type Moments | 4 |
| Spacing Steps | 11 |
| Radii | 6 |
| Shadow Levels | 4 |
| Easings | 3 |
| Gradient-Varianten | 20+ |
| Card-Varianten | 12 |

---

## Brand-Philosophie

**Editorial-Premium als Default. Cartoon-Akzent als Spice.**

Das System lebt von Zurückhaltung in Farbe und Layout, kombiniert mit gezielten, fast filmischen Akzenten (Chase Trail, Speed Lines, Onomatopoeia). Default ist ruhig, präzise, redaktionell — die Cartoon-Referenz blitzt selten auf, dafür mit Wirkung.

**Drei Farben. Zwei Schriften. Ein paar gut platzierte Cartoon-Echos. Editorial-Premium gegen den Funnel-Schwulst.**

---

## CSS Custom Properties (globals.css)

```css
:root {
  /* === COLORS === */
  --ink:          #0E0E0C;
  --paper:        #FCFCFD;
  --frost:        #F8F8FA;
  --mist:         #EEEEF1;
  --mute:         #8B867E;
  --forest-deep:  #122620;
  --forest:       #1F3A2E;
  --glow:         #2D5443;
  --leaf:         #4A7C5C;

  /* === GRADIENTS === */
  --gradient-forest-hero:       linear-gradient(135deg, #122620 0%, #1F3A2E 55%, #2D5443 100%);
  --gradient-forest-card:       linear-gradient(180deg, #1F3A2E 0%, #122620 100%);
  --gradient-forest-spotlight:  radial-gradient(ellipse 80% 60% at 50% 0%, #2D5443 0%, #1F3A2E 40%, #122620 100%);
  --gradient-forest-vignette:   radial-gradient(ellipse 120% 80% at 30% 50%, #1F3A2E 0%, #122620 60%, #0E0E0C 100%);
  --gradient-forest-cinemascope:linear-gradient(180deg, #0E0E0C 0%, #122620 30%, #1F3A2E 60%, #122620 85%, #0E0E0C 100%);
  --gradient-forest-overlay:    linear-gradient(180deg, transparent 0%, rgba(18, 38, 32, 0.7) 60%, rgba(18, 38, 32, 0.95) 100%);
  --gradient-forest-text-mask:  linear-gradient(135deg, #4A7C5C 0%, #2D5443 50%, #1F3A2E 100%);
  --gradient-paper-wash:        linear-gradient(180deg, #FCFCFD 0%, #F8F8FA 100%);
  --gradient-mist-fade:         linear-gradient(180deg, #FCFCFD 0%, #EEEEF1 100%);
  --gradient-frost-card:        linear-gradient(180deg, #FCFCFD 0%, #F8F8FA 100%);
  --gradient-ink-premium:       linear-gradient(135deg, #0E0E0C 0%, #122620 100%);
  --gradient-ink-fade:          linear-gradient(180deg, #0E0E0C 0%, #122620 100%);
  --gradient-leaf-glow:         linear-gradient(135deg, #2D5443 0%, #4A7C5C 100%);
  --gradient-leaf-subtle:       linear-gradient(135deg, rgba(45,84,67,0.06) 0%, rgba(74,124,92,0.06) 100%);
  --gradient-leaf-radial:       radial-gradient(circle at 50% 50%, rgba(74,124,92,0.15) 0%, transparent 70%);
  --gradient-leaf-shine:        linear-gradient(105deg, transparent 40%, rgba(74,124,92,0.18) 50%, transparent 60%);
  --gradient-hover-glow:        radial-gradient(circle at 50% 0%, rgba(74,124,92,0.08) 0%, transparent 60%);
  --gradient-speed-lines:       linear-gradient(90deg, transparent 0%, rgba(74,124,92,0.12) 50%, transparent 100%);
  --gradient-scrim-bottom:      linear-gradient(180deg, transparent 40%, rgba(14,14,12,0.85) 100%);

  /* === SPACING (4px grid) === */
  --space-1:  2px;
  --space-2:  4px;
  --space-3:  8px;
  --space-4:  12px;
  --space-5:  16px;
  --space-6:  24px;
  --space-7:  32px;
  --space-8:  48px;
  --space-9:  64px;
  --space-10: 96px;
  --space-11: 128px;

  /* === RADII === */
  --radius-1:    2px;
  --radius-2:    4px;
  --radius-3:    8px;
  --radius-4:    14px;
  --radius-5:    20px;
  --radius-full: 9999px;

  /* === SHADOWS === */
  --shadow-1: 0 1px 2px rgba(14,14,12,0.04), 0 1px 1px rgba(14,14,12,0.03);
  --shadow-2: 0 4px 8px rgba(14,14,12,0.06), 0 2px 4px rgba(14,14,12,0.04);
  --shadow-3: 0 12px 24px rgba(14,14,12,0.08), 0 4px 8px rgba(14,14,12,0.05);
  --shadow-4: 0 24px 48px rgba(14,14,12,0.10), 0 8px 16px rgba(14,14,12,0.06);
  --shadow-cool-2: 0 4px 8px rgba(18,38,32,0.08), 0 2px 4px rgba(18,38,32,0.05);
  --shadow-cool-3: 0 12px 24px rgba(18,38,32,0.10), 0 4px 8px rgba(18,38,32,0.07);

  /* === TYPOGRAPHY === */
  --font-display: 'Fraunces', Georgia, serif;
  --font-sans:    'Geist Sans', system-ui, sans-serif;
  --font-mono:    'Geist Mono', 'JetBrains Mono', monospace;

  /* === MOTION === */
  --ease-default:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-editorial: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-cartoon:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast:      120ms;
  --duration-base:      200ms;
  --duration-slow:      400ms;
  --duration-cinematic: 800ms;

  /* === LAYOUT === */
  --nav-height:          64px;
  --sidebar-width:       240px;
  --sidebar-collapsed:   64px;
  --content-max-width:   1280px;
  --module-max-width:    860px;
  --admin-max-width:     1440px;
}
```

---

## Chakra UI Theme (theme/index.ts)

```typescript
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },

  fonts: {
    heading: "'Fraunces', Georgia, serif",
    body:    "'Geist Sans', system-ui, sans-serif",
    mono:    "'Geist Mono', 'JetBrains Mono', monospace",
  },

  colors: {
    ink:    '#0E0E0C',
    paper:  '#FCFCFD',
    frost:  '#F8F8FA',
    mist:   '#EEEEF1',
    mute:   '#8B867E',
    forest: {
      deep:    '#122620',
      DEFAULT: '#1F3A2E',
      glow:    '#2D5443',
      leaf:    '#4A7C5C',
    },
    // Semantic aliases
    brand: {
      50:  '#F0F7F3',
      100: '#D6EBE0',
      200: '#A8D1BB',
      300: '#6EB495',
      400: '#4A7C5C',
      500: '#1F3A2E',  // primary accent
      600: '#1A3128',
      700: '#152820',
      800: '#122620',
      900: '#0D1D18',
    },
  },

  radii: {
    sm:   '4px',
    md:   '8px',
    lg:   '14px',
    xl:   '20px',
    '2xl':'24px',
    full: '9999px',
  },

  shadows: {
    sm:  '0 1px 2px rgba(14,14,12,0.04), 0 1px 1px rgba(14,14,12,0.03)',
    md:  '0 4px 8px rgba(14,14,12,0.06), 0 2px 4px rgba(14,14,12,0.04)',
    lg:  '0 12px 24px rgba(14,14,12,0.08), 0 4px 8px rgba(14,14,12,0.05)',
    xl:  '0 24px 48px rgba(14,14,12,0.10), 0 8px 16px rgba(14,14,12,0.06)',
    cool:'0 4px 8px rgba(18,38,32,0.08), 0 2px 4px rgba(18,38,32,0.05)',
  },

  styles: {
    global: {
      body: {
        bg:         'var(--paper)',
        color:      'var(--ink)',
        fontFamily: 'var(--font-sans)',
      },
      '::selection': {
        bg:    'rgba(74,124,92,0.20)',
        color: '#0E0E0C',
      },
    },
  },

  components: {
    Button: {
      baseStyle: {
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        borderRadius: 'var(--radius-2)',
        letterSpacing: '-0.01em',
        _active: { transform: 'scale(0.97)' },
      },
      variants: {
        primary: {
          bg: 'var(--ink)',
          color: 'var(--paper)',
          _hover: { bg: 'var(--forest-deep)' },
        },
        secondary: {
          bg: 'var(--forest)',
          color: 'var(--paper)',
          _hover: { bg: 'var(--glow)' },
        },
        ghost: {
          bg: 'transparent',
          color: 'var(--ink)',
          borderBottom: '1px solid var(--ink)',
          borderRadius: 0,
          px: 0,
          _hover: { color: 'var(--forest)', borderColor: 'var(--forest)' },
        },
      },
      defaultProps: { variant: 'primary' },
    },

    Input: {
      variants: {
        editorial: {
          field: {
            bg: 'var(--frost)',
            border: '1px solid var(--mist)',
            borderRadius: 'var(--radius-2)',
            _focus: {
              borderColor: 'var(--leaf)',
              boxShadow: '0 0 0 3px rgba(74,124,92,0.12)',
            },
          },
        },
      },
      defaultProps: { variant: 'editorial' },
    },

    Card: {
      baseStyle: {
        container: {
          bg: 'var(--frost)',
          border: '1px solid var(--mist)',
          borderRadius: 'var(--radius-3)',
          boxShadow: 'var(--shadow-1)',
        },
      },
    },
  },
});

export default theme;
```

---

## Easter Eggs — Übersicht

| Element | Einsatz | Frequenz |
|---|---|---|
| **Chase Trail Rail** | Section-Übergang (animiert) | 1× pro Page |
| **Speed Lines** | Button-Hover (Primary) | bei jedem Primary-Hover |
| **Onomatopoeia** | "BAM", "WHOOSH" — Fraunces Italic | max. 1× pro Page |
| **Mouse Hole** | 404-Page + Footer | nur dort |
| **Duo Portrait** | About-Page / Founder-Spotlight | nur dort |

---

## Do's & Don'ts

**Do**
- Editorial-Ruhe als Default. Cartoon-Akzente als Spice.
- Fraunces nur für Display, Pull-Quotes, Stats. Geist trägt das UI.
- Forest als einzige farbige Akzentfamilie. Innerhalb dieser Familie variieren.
- Stacked Cards mit Fan-Out-Hover als Signature.
- Italic & WONK-Features in Fraunces gezielt einsetzen — nicht flächig.
- `whileTap={{ scale: 0.97 }}` auf alle Buttons via Framer Motion.
- Lucide React für alle Icons, Stroke-Width 1.5 als Default.

**Don't**
- Keine bunten Multi-Color-Gradients.
- Kein Drop-Shadow mit warmem Cast (kein Braun, kein Rot-Anteil).
- Keine Cartoon-Effekte in Bulk (Speed Lines auf jeder Section = tot).
- Keine Emojis im UI.
- Keine Konkurrenz-Akzentfarbe zu Forest.
- Kein `initialColorMode: 'dark'` für das T&J-Brand — das ist ein Light-First-System.
