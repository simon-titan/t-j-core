# Gradients — T&J Consulting Design System

> 20 Gradient-Varianten in 4 Familien. Default ist flat — Gradients sind Ausnahme.

---

## Grundregel

- **Default:** Flat Colors. Gradients nur für Hero-Sektionen, Premium-Surfaces, Akzente.
- **Nie:** Bunte Multi-Color-Gradients. Alles bleibt monochromatisch innerhalb einer Farbfamilie.
- **Kombinieren:** Gradient-Background + flat Card = Editorial. Nie zwei Gradients schichten.

---

## Familie 1 — Forest (7 Varianten)

### `--gradient-forest-hero`
Für Hero-Sections, dunkle Marketing-Blöcke, Founder-Statements.

```css
--gradient-forest-hero: linear-gradient(135deg, #122620 0%, #1F3A2E 55%, #2D5443 100%);
```
**Einsatz:** Full-bleed Hero-Background, dunkle CTA-Sektionen  
**Text darauf:** `--paper` (#FCFCFD)

---

### `--gradient-forest-card`
Für dunkle Card-Backgrounds (Pricing, Featured, Voice/Stimme).

```css
--gradient-forest-card: linear-gradient(180deg, #1F3A2E 0%, #122620 100%);
```
**Einsatz:** Dunkle Card-Variante, Pricing Highlight  
**Text darauf:** `--paper` (#FCFCFD)

---

### `--gradient-forest-spotlight`
Für Founder Spotlight, radiale Bühne auf dunklem Background. Erzeugt "Lichtquelle von oben".

```css
--gradient-forest-spotlight: radial-gradient(ellipse 80% 60% at 50% 0%, #2D5443 0%, #1F3A2E 40%, #122620 100%);
```
**Einsatz:** Founder Spotlight Section, Premium-Moments  
**Effekt:** Hellerer Bereich oben-mitte, dunkler werdend nach unten

---

### `--gradient-forest-vignette`
Filmischer Darkroom-Vignetten-Effekt. Quelle seitlich links.

```css
--gradient-forest-vignette: radial-gradient(ellipse 120% 80% at 30% 50%, #1F3A2E 0%, #122620 60%, #0E0E0C 100%);
```
**Einsatz:** "The Chase" Cinemascope-Section, Widescreen-Heroes  
**Effekt:** Warmes Grün links, fast schwarz rechts — wie 35mm Filmkader

---

### `--gradient-forest-cinemascope`
21:9 Widescreen-Hintergrund mit vertikaler Tiefenstaffelung.

```css
--gradient-forest-cinemascope: linear-gradient(
  180deg,
  #0E0E0C  0%,
  #122620 30%,
  #1F3A2E 60%,
  #122620 85%,
  #0E0E0C 100%
);
```
**Einsatz:** "The Chase" Banner, Widescreen-Elemente  
**Proportion:** Aspect-Ratio 21:9

---

### `--gradient-forest-overlay`
Scrim/Overlay über Fotos und Hintergrundbilder.

```css
--gradient-forest-overlay: linear-gradient(
  180deg,
  transparent                    0%,
  rgba(18, 38, 32, 0.70)        60%,
  rgba(18, 38, 32, 0.95)       100%
);
```
**Einsatz:** Über Fotos in Cards, Hero-Images, Duo Portrait  
**Funktion:** Text-Lesbarkeit über Bildinhalten sicherstellen

---

### `--gradient-forest-text-mask`
Für Gradient-Text (CSS `-webkit-background-clip: text`).

```css
--gradient-forest-text-mask: linear-gradient(135deg, #4A7C5C 0%, #2D5443 50%, #1F3A2E 100%);
```

**CSS-Verwendung:**
```css
.heading-gradient {
  background: var(--gradient-forest-text-mask);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```
**Einsatz:** Einzelne Wörter in Headlines auf weißem Background als Alternative zu `color: var(--forest)`

---

## Familie 2 — Neutral (5 Varianten)

### `--gradient-paper-wash`
Subtiler Page-Background. Kaum sichtbar, gibt leichte Tiefe.

```css
--gradient-paper-wash: linear-gradient(180deg, #FCFCFD 0%, #F8F8FA 100%);
```
**Einsatz:** `body` Background, Page-Level-Gradient  
**Effekt:** Leicht wärmer oben, minimal kühler unten

---

### `--gradient-mist-fade`
Section-Transition von Paper zu Frost. Für Zwischensektionen.

```css
--gradient-mist-fade: linear-gradient(180deg, #FCFCFD 0%, #EEEEF1 100%);
```
**Einsatz:** Zwischen zwei Light-Sections als visuelles Atemholen

---

### `--gradient-frost-card`
Default Card Background mit minimaler Tiefe.

```css
--gradient-frost-card: linear-gradient(180deg, #FCFCFD 0%, #F8F8FA 100%);
```
**Einsatz:** Default Card Background wenn keine flat `--frost` gewünscht

---

### `--gradient-ink-premium`
Dunkle Premium-Surface. Fast schwarz mit leichtem Forest-Unterton.

```css
--gradient-ink-premium: linear-gradient(135deg, #0E0E0C 0%, #122620 100%);
```
**Einsatz:** Pricing-Karten, Featured-Elemente, Founder-Statements  
**Text darauf:** `--paper`

---

### `--gradient-ink-fade`
Footer und schließende Sections. Vertikaler Übergang zu Forest-Deep.

```css
--gradient-ink-fade: linear-gradient(180deg, #0E0E0C 0%, #122620 100%);
```
**Einsatz:** Footer Background, Page-Abschlüsse, Closing CTA

---

## Familie 3 — Leaf / Glow (4 Varianten)

### `--gradient-leaf-glow`
Für Stat-Block Akzente, Badge Highlights, aktive Elemente.

```css
--gradient-leaf-glow: linear-gradient(135deg, #2D5443 0%, #4A7C5C 100%);
```
**Einsatz:** Aktive Buttons, Progress Bars, Completion Badges  
**Auf hellem Background:** erzeugt Forest-Shine-Effekt

---

### `--gradient-leaf-subtle`
Kaum sichtbarer Hintergrund-Tint für aktive Cards oder Hover.

```css
--gradient-leaf-subtle: linear-gradient(
  135deg,
  rgba(45, 84, 67, 0.06)  0%,
  rgba(74, 124, 92, 0.06) 100%
);
```
**Einsatz:** Card-Hover auf Light-Background, aktiver Nav-Item Background  
**Transparenz:** Sehr dezent — nur bei direktem Vergleich sichtbar

---

### `--gradient-leaf-radial`
Radialer Glow für Badges und runde Elemente.

```css
--gradient-leaf-radial: radial-gradient(
  circle at 50% 50%,
  rgba(74, 124, 92, 0.15) 0%,
  transparent 70%
);
```
**Einsatz:** Badge-Hintergrund, Focus-Indikator, Stat-Number Halo

---

### `--gradient-leaf-shine`
Shimmer-Effekt für Hover auf Forest-Buttons (Speed Lines Variante).

```css
--gradient-leaf-shine: linear-gradient(
  105deg,
  transparent             40%,
  rgba(74,124,92,0.18)    50%,
  transparent             60%
);
background-size: 200% 100%;
```

**Animation:**
```css
@keyframes leaf-shine {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.btn-secondary:hover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-leaf-shine);
  background-size: 200% 100%;
  animation: leaf-shine 600ms var(--ease-cartoon) forwards;
}
```

---

## Familie 4 — Overlay / Utility (4 Varianten)

### `--gradient-hover-glow`
Dezenter Radial-Glow auf Card-Hover. Nur sichtbar bei direktem Fokus.

```css
--gradient-hover-glow: radial-gradient(
  circle at 50% 0%,
  rgba(74, 124, 92, 0.08) 0%,
  transparent 60%
);
```
**Einsatz:** Card `::before` auf `:hover`  
**Pattern:**
```css
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-hover-glow);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-default);
  border-radius: inherit;
  pointer-events: none;
}
.card:hover::before { opacity: 1; }
```

---

### `--gradient-speed-lines`
Horizontaler Shimmer für den Speed-Lines Easter Egg auf Button-Hover.

```css
--gradient-speed-lines: linear-gradient(
  90deg,
  transparent                  0%,
  rgba(74, 124, 92, 0.12)     50%,
  transparent                 100%
);
```
**Einsatz:** `btn-primary::before` auf `:hover`

---

### `--gradient-scrim-bottom`
Bild-Overlay von unten für Cards mit Foto-Background.

```css
--gradient-scrim-bottom: linear-gradient(
  180deg,
  transparent              40%,
  rgba(14, 14, 12, 0.85) 100%
);
```
**Einsatz:** Image Cards, Duo Portrait, Testimonial-Bilder

---

### Noise Texture (SVG-Filter)

Subtiles Film-Grain. Als SVG-Filter inline oder als CSS `url()`.

```css
/* Inline SVG als Background */
.noise-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-repeat: repeat;
  opacity: 0.04;
  pointer-events: none;
  mix-blend-mode: overlay;
}
```
**Einsatz:** Über dunkle Hero-Sections für Film-Textur (max. opacity 0.05)

---

## Vollständige CSS-Variable Übersicht

```css
:root {
  /* Forest */
  --gradient-forest-hero:        linear-gradient(135deg, #122620 0%, #1F3A2E 55%, #2D5443 100%);
  --gradient-forest-card:        linear-gradient(180deg, #1F3A2E 0%, #122620 100%);
  --gradient-forest-spotlight:   radial-gradient(ellipse 80% 60% at 50% 0%, #2D5443 0%, #1F3A2E 40%, #122620 100%);
  --gradient-forest-vignette:    radial-gradient(ellipse 120% 80% at 30% 50%, #1F3A2E 0%, #122620 60%, #0E0E0C 100%);
  --gradient-forest-cinemascope: linear-gradient(180deg, #0E0E0C 0%, #122620 30%, #1F3A2E 60%, #122620 85%, #0E0E0C 100%);
  --gradient-forest-overlay:     linear-gradient(180deg, transparent 0%, rgba(18,38,32,0.70) 60%, rgba(18,38,32,0.95) 100%);
  --gradient-forest-text-mask:   linear-gradient(135deg, #4A7C5C 0%, #2D5443 50%, #1F3A2E 100%);

  /* Neutral */
  --gradient-paper-wash:         linear-gradient(180deg, #FCFCFD 0%, #F8F8FA 100%);
  --gradient-mist-fade:          linear-gradient(180deg, #FCFCFD 0%, #EEEEF1 100%);
  --gradient-frost-card:         linear-gradient(180deg, #FCFCFD 0%, #F8F8FA 100%);
  --gradient-ink-premium:        linear-gradient(135deg, #0E0E0C 0%, #122620 100%);
  --gradient-ink-fade:           linear-gradient(180deg, #0E0E0C 0%, #122620 100%);

  /* Leaf / Glow */
  --gradient-leaf-glow:          linear-gradient(135deg, #2D5443 0%, #4A7C5C 100%);
  --gradient-leaf-subtle:        linear-gradient(135deg, rgba(45,84,67,0.06) 0%, rgba(74,124,92,0.06) 100%);
  --gradient-leaf-radial:        radial-gradient(circle at 50% 50%, rgba(74,124,92,0.15) 0%, transparent 70%);
  --gradient-leaf-shine:         linear-gradient(105deg, transparent 40%, rgba(74,124,92,0.18) 50%, transparent 60%);

  /* Overlay / Utility */
  --gradient-hover-glow:         radial-gradient(circle at 50% 0%, rgba(74,124,92,0.08) 0%, transparent 60%);
  --gradient-speed-lines:        linear-gradient(90deg, transparent 0%, rgba(74,124,92,0.12) 50%, transparent 100%);
  --gradient-scrim-bottom:       linear-gradient(180deg, transparent 40%, rgba(14,14,12,0.85) 100%);
}
```

---

## Kombinationsregeln

| Kontext | Gradient | Text | Zusatz |
|---|---|---|---|
| Hero dark | `forest-hero` | `--paper` | Noise Texture optional |
| Founder Spotlight | `forest-spotlight` | `--paper` | Kicker in leaf-color |
| "The Chase" | `forest-vignette` | `--paper` | 21:9, Cinemascope |
| Pricing Card (dark) | `ink-premium` | `--paper` | Kein weiterer Gradient |
| Default Page | `paper-wash` | `--ink` | Flat, kaum sichtbar |
| Card hover | `hover-glow` über flat | `--ink` | Als ::before Overlay |
| Stat Akzent | `leaf-glow` | `--paper` | Für Zahl-Background |
| Button Speed Lines | `speed-lines` | — | Als ::before auf hover |
