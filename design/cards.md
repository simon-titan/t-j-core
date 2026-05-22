# Cards — T&J Consulting Design System

> 12 Card-Varianten. Stacked Cards sind das Signature-Element.

---

## Übersicht

| Gruppe | Variante | Context |
|---|---|---|
| **Marketing** | Default Light, Dark Ink, Stacked, Featured/Pricing, Stat | Light & Dark Sections |
| **Editorial** | Pain, Case, Voice/Stimme | Hero-Sections, Proof-Sections |
| **Plattform** | Module, Dashboard Widget, Event, Quiz Answer | App-Shell |

---

## Shared Base Styles

```css
/* Alle Cards haben diese Basis */
.card-base {
  position: relative;
  overflow: hidden;
  transition:
    box-shadow var(--duration-base) var(--ease-default),
    border-color var(--duration-base) var(--ease-default),
    transform var(--duration-base) var(--ease-default);
}
```

---

## Marketing Cards

### 1. Default Light Card

Frost-Background, Mist-Border, subtiler Schatten.

```css
.card {
  background: var(--frost);
  border: 1px solid var(--mist);
  border-radius: var(--radius-3);   /* 8px */
  padding: var(--space-7);          /* 32px */
  box-shadow: var(--shadow-1);
}

.card:hover {
  box-shadow: var(--shadow-2);
  border-color: var(--mute);
  transform: translateY(-2px);
}

/* Hover Glow Overlay */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-hover-glow);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-default);
  pointer-events: none;
  border-radius: inherit;
}
.card:hover::before { opacity: 1; }
```

**Chakra UI:**
```tsx
<Box
  bg="frost"
  border="1px solid"
  borderColor="mist"
  borderRadius="md"
  p={8}
  shadow="sm"
  _hover={{ shadow: 'md', borderColor: 'mute', transform: 'translateY(-2px)' }}
  transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
>
```

---

### 2. Dark Ink Card

Für dunkle Testimonials, Voice-Cards, Premium-Aussagen.

```css
.card-dark {
  background: var(--gradient-ink-premium);
  border: none;
  border-radius: var(--radius-4);   /* 14px */
  padding: var(--space-7);          /* 32px */
  box-shadow: var(--shadow-3);
  color: var(--paper);
}

.card-dark .card-kicker {
  color: rgba(252, 252, 253, 0.50);
}

.card-dark .card-body {
  color: rgba(252, 252, 253, 0.80);
}
```

---

### 3. Stacked Cards — Signature Element

Das wichtigste visuelle Element des Systems. Drei Cards leicht gestapelt, Fan-Out bei Hover.

**HTML-Struktur:**
```html
<div class="card-stack">
  <div class="card card-stack__item card-stack__item--light">
    <span class="label-kicker">Pain 02</span>
    <h3>20 Nachrichten. Null Termine.</h3>
    <p>Outreach ohne System ...</p>
  </div>
  <div class="card card-stack__item card-stack__item--dark">
    <span class="label-kicker">Stimme</span>
    <blockquote>"Mehr Termine in zwei Wochen ..."</blockquote>
  </div>
  <div class="card card-stack__item card-stack__item--light">
    <span class="label-kicker">Case 03</span>
    <h3>Empfehlung war Glück. Jetzt ist's System.</h3>
    <div class="stat-inline">+12<sup>k</sup></div>
  </div>
</div>
```

**CSS:**
```css
.card-stack {
  position: relative;
  width: 320px;
  height: 280px;
}

.card-stack__item {
  position: absolute;
  width: 100%;
  border-radius: var(--radius-4);   /* 14px */
  padding: var(--space-6);          /* 24px */
  box-shadow: var(--shadow-2);
  transition: transform var(--duration-slow) var(--ease-cartoon);
  will-change: transform;
}

.card-stack__item--light {
  background: var(--frost);
  border: 1px solid var(--mist);
  color: var(--ink);
}

.card-stack__item--dark {
  background: var(--gradient-ink-premium);
  color: var(--paper);
  border: none;
}

/* Default gestapelt */
.card-stack__item:nth-child(1) { transform: rotate(-2deg) translateY(0);   z-index: 1; }
.card-stack__item:nth-child(2) { transform: rotate(0deg)  translateY(4px);  z-index: 2; }
.card-stack__item:nth-child(3) { transform: rotate(2deg)  translateY(8px);  z-index: 3; }

/* Fan-Out on Hover */
.card-stack:hover .card-stack__item:nth-child(1) {
  transform: rotate(-7deg) translate(-36px, -16px);
  z-index: 3;
}
.card-stack:hover .card-stack__item:nth-child(2) {
  transform: rotate(0deg) translateY(-8px);
  z-index: 2;
}
.card-stack:hover .card-stack__item:nth-child(3) {
  transform: rotate(7deg) translate(36px, -16px);
  z-index: 1;
}
```

**Framer Motion Variante:**
```tsx
const stackVariants = {
  default: (i: number) => ({
    rotate: [-2, 0, 2][i],
    y: [0, 4, 8][i],
    zIndex: [1, 2, 3][i],
  }),
  hover: (i: number) => ({
    rotate: [-7, 0, 7][i],
    x: [-36, 0, 36][i],
    y: [-16, -8, -16][i],
    zIndex: [3, 2, 1][i],
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  }),
};

function CardStack() {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      position="relative"
      w="320px"
      h="280px"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {cards.map((card, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={stackVariants}
          animate={hovered ? 'hover' : 'default'}
          style={{ position: 'absolute', width: '100%' }}
        >
          <CardContent {...card} />
        </motion.div>
      ))}
    </Box>
  );
}
```

---

### 4. Featured / Pricing Card

Für Pricing-Highlight, Premium-Mitgliedschaft.

```css
.card-featured {
  background: var(--gradient-ink-premium);
  color: var(--paper);
  border-radius: var(--radius-4);   /* 14px */
  padding: var(--space-8);          /* 48px */
  box-shadow: var(--shadow-4);
  border: none;
  position: relative;
  overflow: hidden;
}

/* Dezenter Glow am oberen Rand */
.card-featured::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(74,124,92,0.40) 50%, transparent 100%);
}

.card-featured .price {
  font-family: var(--font-display);
  font-size: 64px;
  line-height: 1;
  font-style: italic;
  letter-spacing: -0.03em;
}

.card-featured .price-period {
  font-family: var(--font-sans);
  font-size: 14px;
  color: rgba(252,252,253,0.60);
  letter-spacing: 0.05em;
}
```

---

### 5. Stat Card

Für Kennzahlen, KPI-Beweise.

```html
<div class="card card-stat">
  <span class="label-kicker">Ergebnis</span>
  <div class="stat-number">+12<sup>k</sup></div>
  <p class="stat-caption">MRR-Lift in 60 Tagen. Nicht das Maximum, was Kunden bei uns rausholen — aber ein typischer Verlauf in den ersten zwei Monaten Zusammenarbeit.</p>
  <span class="stat-source">— Case 03 · Titan Development</span>
</div>
```

```css
.card-stat {
  background: var(--frost);
  border: 1px solid var(--mist);
  border-radius: var(--radius-3);
  padding: var(--space-7);
}

.stat-number {
  font-family: var(--font-display);
  font-size: clamp(96px, 12vw, 180px);
  font-style: italic;
  line-height: 0.85;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.stat-number sup {
  font-size: 0.28em;
  vertical-align: 0.65em;
  font-style: italic;
  color: var(--forest);
}

.stat-caption {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.55;
  color: var(--ink);
  margin-top: var(--space-5);
}

.stat-source {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mute);
  margin-top: var(--space-4);
  display: block;
}
```

---

## Editorial Content Cards

### 6. Pain Card

Für Problem-Statements ("20 Nachrichten. Null Termine.").

```css
.card-pain {
  background: var(--frost);
  border: 1px solid var(--mist);
  border-radius: var(--radius-4);
  padding: var(--space-6) var(--space-7);
}

.card-pain .card-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mute);
  margin-bottom: var(--space-3);
}

.card-pain .card-headline {
  font-family: var(--font-display);
  font-size: clamp(22px, 2.5vw, 28px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: var(--space-4);
}

.card-pain .card-body {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.55;
  color: var(--mute);
}
```

---

### 7. Case Card

Für Ergebnisse, Social Proof ("Empfehlung war Glück. Jetzt ist's System.").

```css
.card-case {
  background: var(--frost);
  border: 1px solid var(--mist);
  border-radius: var(--radius-4);
  padding: var(--space-6) var(--space-7);
  position: relative;
}

.card-case .stat-inline {
  font-family: var(--font-display);
  font-size: 64px;
  font-style: italic;
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: var(--forest);
  margin-top: var(--space-4);
}

.card-case .stat-inline sup {
  font-size: 0.4em;
  vertical-align: 0.5em;
  font-style: italic;
}
```

---

### 8. Voice / Stimme Card

Immer dark. Für Testimonials, direkte Zitate.

```css
.card-voice {
  background: var(--gradient-ink-premium);
  border: none;
  border-radius: var(--radius-4);
  padding: var(--space-6) var(--space-7);
  color: var(--paper);
}

.card-voice .voice-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(252,252,253,0.45);
  margin-bottom: var(--space-4);
}

.card-voice blockquote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(18px, 2vw, 24px);
  line-height: 1.3;
  color: var(--paper);
  font-variation-settings: 'SOFT' 60, 'WONK' 0;
}

.card-voice blockquote::before {
  content: '"';
  color: var(--leaf);
  font-size: 1.4em;
  line-height: 0;
  vertical-align: -0.25em;
}

.card-voice .voice-attribution {
  font-family: var(--font-sans);
  font-size: 13px;
  color: rgba(252,252,253,0.55);
  margin-top: var(--space-5);
}

.card-voice .voice-company {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--leaf);
}
```

---

## Plattform Cards

### 9. Module Card

```css
.card-module {
  background: var(--frost);
  border: 1px solid var(--mist);
  border-radius: var(--radius-3);
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-default);
}

.card-module:hover {
  border-color: var(--mute);
  box-shadow: var(--shadow-2);
  transform: translateY(-2px);
}

/* Locked State */
.card-module--locked {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

/* In-Progress State — Forest Akzentlinie links */
.card-module--in-progress {
  border-left: 2px solid var(--forest);
}

/* Completed State */
.card-module--completed {
  border-color: rgba(74, 124, 92, 0.25);
}

.card-module__progress-bar {
  height: 3px;
  background: var(--mist);
  border-radius: var(--radius-full);
  margin-top: var(--space-4);
  overflow: hidden;
}

.card-module__progress-fill {
  height: 100%;
  background: var(--gradient-leaf-glow);
  border-radius: var(--radius-full);
  transition: width 600ms var(--ease-editorial);
}
```

---

### 10. Dashboard Widget

Leicht glassmorphistisch — nur für Dashboard-Widgets.

```css
.card-widget {
  background: rgba(248, 248, 250, 0.85);
  backdrop-filter: blur(12px) saturate(1.4);
  border: 1px solid rgba(14, 14, 12, 0.08);
  border-radius: var(--radius-5);  /* 20px */
  padding: var(--space-6);
  box-shadow: var(--shadow-cool-2);
}

.card-widget .widget-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--mute);
}

.card-widget .widget-value {
  font-family: var(--font-display);
  font-size: 36px;
  font-style: italic;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--ink);
}
```

---

### 11. Event Card

```css
.card-event {
  background: var(--frost);
  border: 1px solid var(--mist);
  border-radius: var(--radius-3);
  padding: var(--space-6);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-5);
  align-items: start;
}

.card-event__date {
  background: var(--gradient-leaf-glow);
  color: var(--paper);
  border-radius: var(--radius-2);
  padding: var(--space-3) var(--space-4);
  text-align: center;
  min-width: 52px;
}

.card-event__date-day {
  font-family: var(--font-display);
  font-size: 28px;
  font-style: italic;
  line-height: 1;
}

.card-event__date-month {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.75;
}
```

---

### 12. Quiz Answer Card

```css
.card-quiz-answer {
  background: var(--frost);
  border: 1px solid var(--mist);
  border-radius: var(--radius-2);
  padding: var(--space-5) var(--space-6);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--ink);
}

.card-quiz-answer:hover {
  background: white;
  border-color: var(--mute);
  box-shadow: var(--shadow-1);
}

.card-quiz-answer--selected {
  background: rgba(74, 124, 92, 0.08);
  border-color: var(--leaf);
  color: var(--forest);
}

.card-quiz-answer--correct {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.40);
  color: #166534;
}

.card-quiz-answer--incorrect {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.30);
  color: #991B1B;
}
```

---

## Radii-Zuordnung

| Card-Typ | Radius-Token | px |
|---|---|---|
| Default Light | `--radius-3` | 8px |
| Dark Ink | `--radius-4` | 14px |
| Stacked | `--radius-4` | 14px |
| Featured/Pricing | `--radius-5` | 20px |
| Stat Card | `--radius-3` | 8px |
| Pain/Case/Voice | `--radius-4` | 14px |
| Module | `--radius-3` | 8px |
| Widget | `--radius-5` | 20px |
| Event | `--radius-3` | 8px |
| Quiz Answer | `--radius-2` | 4px |
