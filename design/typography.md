# Typography — T&J Consulting Design System

> Zwei Schriften. Vier Momente. Eine Mono-Familie für Daten.

---

## Schriftfamilien

| Rolle | Familie | Variable | Einsatz |
|---|---|---|---|
| **Display / Headline** | Fraunces (Variable) | `--font-display` | Hero, Pull-Quotes, Stats, Brand Moments |
| **Body / UI** | Geist Sans | `--font-sans` | Running Text, Labels, Buttons, Forms, Navigation |
| **Mono / Data** | Geist Mono | `--font-mono` | Meta, Kicker-Labels, Timestamps, Daten-Tabellen |

---

## Font Einbindung

### Google Fonts (Next.js `app/layout.tsx`)

```tsx
import { Fraunces } from 'next/font/google';
import localFont from 'next/font/local';

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK'],
  variable: '--font-display',
  display: 'swap',
});

// Geist als lokale Schrift (Vercel stellt sie bereit)
// oder via npm: @vercel/font
```

### Alternativ via CSS `@import`

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&display=swap');
```

---

## Fraunces — OpenType Variable Axes

Fraunces ist eine Variable Font mit drei Axes:

| Axis | Kürzel | Wertebereich | Bedeutung |
|---|---|---|---|
| Optical Size | `opsz` | 9–144 | Automatisch (Display vs. Text) |
| **Soft** | `SOFT` | 0–100 | 0 = kantig/klassisch · 100 = weich/rund |
| **Wonk** | `WONK` | 0–1 | 0 = normal · 1 = unregelmäßig/handschriftlich |

```css
/* Beispiele */
.display-sharp   { font-variation-settings: 'SOFT' 0, 'WONK' 0; }
.display-soft    { font-variation-settings: 'SOFT' 100, 'WONK' 0; }
.wonk-italic     { font-variation-settings: 'SOFT' 0, 'WONK' 1; font-style: italic; }
.soft-wonk       { font-variation-settings: 'SOFT' 100, 'WONK' 1; font-style: italic; }
```

**Einsatzregel:**
- `WONK 1` + italic → **nur für Emphasis-Wörter im Hero** (z.B. das letzte Wort: "antwortet.")
- `SOFT 100` + italic → Pull-Quotes, Testimonials (wärmer, persönlicher)
- `SOFT 0`, `WONK 0` → Headlines, Stats (schärfer, editorial)

---

## Die 4 Type Moments

### 1. Hero

Das Aushängeschild. Sehr groß, sehr präsent. Nur auf Hero-Sections.

```css
.type-hero {
  font-family: var(--font-display);
  font-size: clamp(72px, 9vw, 132px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-weight: 400;
  font-style: normal;
  font-feature-settings: "wonk" off;
}

.type-hero em {
  font-style: italic;
  font-variation-settings: 'WONK' 1;
  color: var(--forest);
}
```

**Verwendung:**
- Maximaler Satz: Weiß auf Dark, oder Ink auf Paper
- Italic + WONK für einzelne Emphasis-Wörter (nie ganze Zeile)
- Nie mehr als 3–4 Wörter pro Zeile

---

### 2. Pull-Quote / Voice

Für Testimonials, Zitate, starke Statements.

```css
.type-pull-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(28px, 3vw, 38px);
  line-height: 1.25;
  font-weight: 400;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
  color: var(--ink);
}

.type-pull-quote::before {
  content: '"';
  font-size: 1.5em;
  line-height: 0;
  vertical-align: -0.3em;
  margin-right: 0.1em;
  color: var(--forest);
}
```

---

### 3. Stat-Block

Für Ergebnis-Zahlen, KPIs, Proof-Points.

```css
.type-stat {
  font-family: var(--font-display);
  font-size: clamp(120px, 16vw, 240px);
  line-height: 0.85;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.02em;
  font-feature-settings: "wonk" off;
}

.type-stat sup {
  font-size: 0.28em;
  vertical-align: 0.65em;
  font-style: italic;
  letter-spacing: -0.02em;
}
```

**HTML-Struktur:**
```html
<span class="type-stat">+12<sup>k</sup></span>
<p class="type-stat-caption">MRR-Lift in 60 Tagen.</p>
<span class="type-stat-source">— Case 03 · Titan Development</span>
```

---

### 4. Running Text

Für Fließtext, Absätze, Beschreibungen.

```css
.type-body {
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.6;
  font-weight: 400;
  color: var(--ink);
}

/* Drop Cap für ersten Absatz */
.type-body--drop-cap::first-letter {
  font-family: var(--font-display);
  font-size: 3.8em;
  line-height: 0.8;
  float: left;
  margin-right: 0.08em;
  margin-top: 0.05em;
  font-style: italic;
  color: var(--forest);
}
```

---

## Erweiterte Type Scale

Für die gesamte Plattform über die 4 Momente hinaus:

| Token | Klasse | Größe | LH | LS | Font | Einsatz |
|---|---|---|---|---|---|---|
| `text-display` | `.t-display` | 132px | 0.95 | -4% | Fraunces | Hero |
| `text-h1` | `.t-h1` | 64px | 1.05 | -3% | Fraunces | Page Title |
| `text-h2` | `.t-h2` | 44px | 1.1 | -2.5% | Fraunces | Section Title |
| `text-h3` | `.t-h3` | 28px | 1.2 | -1.5% | Fraunces / Geist | Subsection |
| `text-h4` | `.t-h4` | 20px | 1.3 | -0.5% | Geist Sans | Card Title |
| `text-body` | `.t-body` | 17px | 1.6 | 0 | Geist Sans | Running Text |
| `text-sm` | `.t-sm` | 14px | 1.5 | 0 | Geist Sans | UI / Labels |
| `text-xs` | `.t-xs` | 12px | 1.4 | 0.02em | Geist Mono | Meta / Kicker |

```css
.t-display { font-family: var(--font-display); font-size: clamp(72px, 9vw, 132px); line-height: 0.95; letter-spacing: -0.04em; }
.t-h1      { font-family: var(--font-display); font-size: clamp(40px, 5vw, 64px);  line-height: 1.05; letter-spacing: -0.03em; }
.t-h2      { font-family: var(--font-display); font-size: clamp(28px, 3.5vw, 44px); line-height: 1.1;  letter-spacing: -0.025em; }
.t-h3      { font-family: var(--font-display); font-size: clamp(22px, 2.5vw, 28px); line-height: 1.2;  letter-spacing: -0.015em; }
.t-h4      { font-family: var(--font-sans);    font-size: 20px; line-height: 1.3;  letter-spacing: -0.005em; font-weight: 500; }
.t-body    { font-family: var(--font-sans);    font-size: 17px; line-height: 1.6;  letter-spacing: 0; }
.t-sm      { font-family: var(--font-sans);    font-size: 14px; line-height: 1.5;  letter-spacing: 0; }
.t-xs      { font-family: var(--font-mono);    font-size: 12px; line-height: 1.4;  letter-spacing: 0.02em; }
```

---

## Label / Kicker / Caption Styles

Für Abschnitts-Etiketten wie `— PAIN 02`, `— CASE 03`, `— FOUNDER SPOTLIGHT`:

```css
.label-kicker {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mute);
}

/* Mit Dash-Prefix */
.label-kicker::before {
  content: '— ';
  letter-spacing: 0;
}

/* Auf dunklem Hintergrund */
.label-kicker--light {
  color: rgba(252, 252, 253, 0.50);
}
```

**HTML-Pattern:**
```html
<span class="label-kicker">Pain 02</span>
<!-- Rendert als: — PAIN 02 -->
```

---

## Responsive Scaling

```css
/* Mobile first — alle Display-Größen mit clamp() */
:root {
  --size-hero:       clamp(64px, 9vw, 132px);
  --size-h1:         clamp(36px, 5vw, 64px);
  --size-h2:         clamp(26px, 3.5vw, 44px);
  --size-h3:         clamp(20px, 2.5vw, 28px);
  --size-stat:       clamp(96px, 15vw, 240px);
  --size-pull-quote: clamp(22px, 3vw, 38px);
}
```

---

## Chakra UI Typografie-Mapping

```typescript
// theme/index.ts
textStyles: {
  display: {
    fontFamily: 'heading',
    fontSize: ['72px', null, '132px'],
    lineHeight: '0.95',
    letterSpacing: '-0.04em',
  },
  h1: {
    fontFamily: 'heading',
    fontSize: ['40px', null, '64px'],
    lineHeight: '1.05',
    letterSpacing: '-0.03em',
  },
  h2: {
    fontFamily: 'heading',
    fontSize: ['28px', null, '44px'],
    lineHeight: '1.1',
    letterSpacing: '-0.025em',
  },
  pullQuote: {
    fontFamily: 'heading',
    fontSize: ['24px', null, '38px'],
    fontStyle: 'italic',
    lineHeight: '1.25',
  },
  kicker: {
    fontFamily: 'mono',
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'mute',
  },
  body: {
    fontFamily: 'body',
    fontSize: '17px',
    lineHeight: '1.6',
  },
},
```
