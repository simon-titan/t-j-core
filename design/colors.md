# Colors — T&J Consulting Design System

> 9 Tokens. Drei Gruppen. Monochromatisch innerhalb einer Akzentfamilie.

---

## Farbpalette

### Gruppe 1 — Neutrals (Paper / Ink Stack)

| Token | CSS-Variable | Hex | Chakra | Rolle |
|---|---|---|---|---|
| Ink | `--ink` | `#0E0E0C` | `ink` | Text primary · Buttons primary · Header |
| Paper | `--paper` | `#FCFCFD` | `paper` | Body Background · Default Surface |
| Frost | `--frost` | `#F8F8FA` | `frost` | Cards · Elevated Surfaces · Inputs |
| Mist | `--mist` | `#EEEEF1` | `mist` | Borders · Dividers · Subtle Lines |
| Mute | `--mute` | `#8B867E` | `mute` | Meta Text · Secondary Text · Captions |

### Gruppe 2 — Forest (Brand Accent)

| Token | CSS-Variable | Hex | Chakra | Rolle |
|---|---|---|---|---|
| Forest Deep | `--forest-deep` | `#122620` | `forest.deep` | Tiefster Akzent · Dark Hero-Backgrounds |
| Forest | `--forest` | `#1F3A2E` | `forest.DEFAULT` | Primary Accent · CTA Secondary · Links |
| Glow | `--glow` | `#2D5443` | `forest.glow` | Hover State · Sekundärer Akzent |
| Leaf | `--leaf` | `#4A7C5C` | `forest.leaf` | Highlight · Interaktive States · Focus Ring |

---

## Visuelle Palette

```
INK         FOREST      PAPER       FROST
#0E0E0C     #1F3A2E     #FCFCFD     #F8F8FA
████████    ████████    ████████    ████████

FOREST DEEP  GLOW        LEAF        MUTE
#122620      #2D5443     #4A7C5C     #8B867E
████████     ████████    ████████    ████████

MIST
#EEEEF1
████████
```

---

## Semantic Mapping

### Light Context (Marketing, Default)

| Anwendung | Token | Hex |
|---|---|---|
| Page Background | `--paper` | `#FCFCFD` |
| Card Background (default) | `--frost` | `#F8F8FA` |
| Card Background (elevated) | `#FFFFFF` | white |
| Border (default) | `--mist` | `#EEEEF1` |
| Border (hover) | `--mute` | `#8B867E` |
| Text primary | `--ink` | `#0E0E0C` |
| Text secondary | `--mute` | `#8B867E` |
| Accent / CTA button | `--forest` | `#1F3A2E` |
| Accent hover | `--glow` | `#2D5443` |
| Accent active / pressed | `--forest-deep` | `#122620` |
| Focus ring | `--leaf` | `#4A7C5C` |
| Italic emphasis in Headings | `--forest` | `#1F3A2E` |

### Dark Context (Hero, Founder Spotlight, Pricing)

| Anwendung | Token | Hex |
|---|---|---|
| Dark Section Background | `--forest-deep` | `#122620` |
| Dark Card Background | `--forest` | `#1F3A2E` |
| Dark Card Border (subtle) | `rgba(74,124,92,0.15)` | — |
| Text on dark | `--paper` | `#FCFCFD` |
| Text secondary on dark | `rgba(252,252,253,0.65)` | — |
| Accent on dark | `--leaf` | `#4A7C5C` |

### Platform Context (App-Shell)

| Anwendung | Token | Hex |
|---|---|---|
| App Background | `--paper` | `#FCFCFD` |
| Sidebar Background | `--frost` | `#F8F8FA` |
| Sidebar Active Item | `--forest` | `#1F3A2E` |
| Sidebar Active Text | `--paper` | `#FCFCFD` |
| Progress Bar Fill | `--leaf` | `#4A7C5C` |
| Module Card Locked | `--mist` (opacity 0.5) | — |

---

## Kontrast-Matrix

| Hintergrund | Text | Kontrast-Ratio | Bewertung |
|---|---|---|---|
| `#FCFCFD` (paper) | `#0E0E0C` (ink) | ~19:1 | AAA |
| `#F8F8FA` (frost) | `#0E0E0C` (ink) | ~18:1 | AAA |
| `#1F3A2E` (forest) | `#FCFCFD` (paper) | ~10:1 | AAA |
| `#122620` (forest-deep) | `#FCFCFD` (paper) | ~13:1 | AAA |
| `#2D5443` (glow) | `#FCFCFD` (paper) | ~8:1 | AAA |
| `#4A7C5C` (leaf) | `#0E0E0C` (ink) | ~6:1 | AA |
| `#8B867E` (mute) | `#FCFCFD` (paper) | ~4.5:1 | AA |

---

## Alpha-Varianten (für Overlays & Transparenz)

```css
/* Forest-Familie mit Transparenz */
--forest-deep-90:   rgba(18, 38, 32, 0.90);
--forest-deep-70:   rgba(18, 38, 32, 0.70);
--forest-deep-50:   rgba(18, 38, 32, 0.50);
--forest-10:        rgba(31, 58, 46, 0.10);
--forest-06:        rgba(31, 58, 46, 0.06);
--glow-12:          rgba(45, 84, 67, 0.12);
--glow-08:          rgba(45, 84, 67, 0.08);
--leaf-20:          rgba(74, 124, 92, 0.20);
--leaf-12:          rgba(74, 124, 92, 0.12);
--leaf-08:          rgba(74, 124, 92, 0.08);

/* Ink mit Transparenz */
--ink-80:           rgba(14, 14, 12, 0.80);
--ink-60:           rgba(14, 14, 12, 0.60);
--ink-40:           rgba(14, 14, 12, 0.40);
--ink-10:           rgba(14, 14, 12, 0.10);
--ink-06:           rgba(14, 14, 12, 0.06);
--ink-04:           rgba(14, 14, 12, 0.04);

/* Paper mit Transparenz */
--paper-90:         rgba(252, 252, 253, 0.90);
--paper-70:         rgba(252, 252, 253, 0.70);
--paper-50:         rgba(252, 252, 253, 0.50);
--paper-20:         rgba(252, 252, 253, 0.20);
```

---

## Erweiterte Platform-Tokens

Für die dunkle App-Shell (wenn Dark Mode für die Plattform aktiviert):

```css
/* Plattform Dark-Erweiterung */
--platform-bg:          #0E0E0C;
--platform-surface:     #141614;
--platform-surface-2:   #1A1C1A;
--platform-border:      rgba(255, 255, 255, 0.07);
--platform-border-strong: rgba(255, 255, 255, 0.14);
--platform-text:        #F4F4F4;
--platform-text-muted:  #7A7A7A;
```

---

## Einsatzregel

- **Gradient-Akzent** immer nur Forest → Leaf (monochromatisch). Nie Regenbogen-Gradients.
- **Overlay-Scrim** immer ink-basiert (`rgba(14,14,12,…)`), nie schwarz (`#000`).
- **Keine weiteren Akzentfarben** — kein Blau, kein Rot, kein Orange als Design-Farbe. Rot/Grün nur für System-Feedback (Error/Success).
