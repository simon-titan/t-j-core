# Motion — T&J Consulting Design System

> Framer Motion 11 · 3 Easings · 4 Durations · Cartoon-Akzente sparsam.

---

## Grundprinzip

Motion verstärkt Editorial-Ruhe, sie durchbricht sie nicht. Hover-Transitions sind kaum spürbar. Cartoon-Akzente (Chase Trail, Speed Lines) sind seltene Ausrufezeichen.

**Regel:** Nie mehr als 2 Animationen gleichzeitig auf einer Seite sichtbar.

---

## Easings

```css
/* Default — UI-Transitions, Hover, Dropdowns */
--ease-default:   cubic-bezier(0.4, 0, 0.2, 1);

/* Editorial — Type-Reveals, Section-Entrances, langsame Inhalte */
--ease-editorial: cubic-bezier(0.65, 0, 0.35, 1);

/* Cartoon — Speed Lines, Chase Trail, Card Fan-Out, Pfeil-Hover */
--ease-cartoon:   cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Als Framer Motion Arrays:**
```typescript
export const easing = {
  default:   [0.4, 0, 0.2, 1],
  editorial: [0.65, 0, 0.35, 1],
  cartoon:   [0.34, 1.56, 0.64, 1],   // überschwingt leicht
} as const;
```

---

## Durations

```css
--duration-fast:      120ms;   /* Hover, Press, kleine State-Wechsel */
--duration-base:      200ms;   /* Default Transitions, Border-Color */
--duration-slow:      400ms;   /* Card Fan-Out, Modale Ein/Ausblenden */
--duration-cinematic: 800ms;   /* Chase Trail, Page Hero Entrance */
```

---

## Framer Motion Variants

### Fade In Up (Section Entry)

```typescript
export const fadeInUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easing.editorial },
  },
};

// Staggered List
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// Verwendung
<motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(item => (
    <motion.div key={item.id} variants={fadeInUp}>{item.content}</motion.div>
  ))}
</motion.div>
```

---

### Fade In (Einfaches Einblenden)

```typescript
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: easing.default },
  },
};
```

---

### Scale In (Modale, Dropdowns)

```typescript
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: easing.editorial },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.18 },
  },
};
```

---

### Page Transition

```typescript
export const pageTransition = {
  initial:   { opacity: 0, y: 6 },
  animate:   { opacity: 1, y: 0, transition: { duration: 0.30, ease: easing.editorial } },
  exit:      { opacity: 0, y: -4, transition: { duration: 0.18 } },
};

// In layout.tsx
<AnimatePresence mode="wait">
  <motion.div key={pathname} {...pageTransition}>
    {children}
  </motion.div>
</AnimatePresence>
```

---

### Hero Text Reveal

```typescript
export const heroReveal = {
  hidden:  { opacity: 0, y: 24, skewY: 1 },
  visible: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { duration: 0.7, ease: easing.editorial },
  },
};

// Wort-für-Wort Reveal
export const heroWordReveal = (delay = 0) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easing.editorial, delay },
  },
});
```

---

### Card Fan-Out (Stacked Cards)

```typescript
export const cardStackVariants = {
  default: (i: number) => ({
    rotate:   [-2, 0, 2][i],
    y:        [0, 4, 8][i],
    zIndex:   [1, 2, 3][i],
    transition: { duration: 0.4, ease: easing.cartoon },
  }),
  hover: (i: number) => ({
    rotate:   [-7, 0, 7][i],
    x:        [-36, 0, 36][i],
    y:        [-16, -8, -16][i],
    zIndex:   [3, 2, 1][i],
    transition: { duration: 0.4, ease: easing.cartoon },
  }),
};
```

---

### Skeleton Shimmer

```typescript
export const shimmerVariants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.8,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// CSS für Skeleton
const skeletonStyle = {
  background: `linear-gradient(90deg, #EEEEF1 0%, #F8F8FA 50%, #EEEEF1 100%)`,
  backgroundSize: '200% 100%',
};
```

---

### Chase Trail Animation

```typescript
export const chaseVariants = {
  initial: { backgroundPosition: '200% 0' },
  animate: {
    backgroundPosition: '-200% 0',
    transition: { duration: 0.8, ease: easing.cartoon },
  },
};

function ChaseTrail({ trigger }: { trigger: boolean }) {
  return (
    <motion.div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, #1F3A2E 50%, transparent 100%)',
        backgroundSize: '200% 100%',
      }}
      variants={chaseVariants}
      initial="initial"
      animate={trigger ? 'animate' : 'initial'}
    />
  );
}
```

---

### Button Press

```typescript
// Direkt an jedem Button via whileTap
<motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.12, ease: easing.cartoon }}>
  Termin buchen →
</motion.button>
```

---

## Scroll-Triggered Animations

```typescript
// Für Section-Eintritte — Viewport-basiert
<motion.section
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>
  {/* Children mit fadeInUp variant */}
</motion.section>
```

---

## Easter Eggs

### 1. Speed Lines (Button Hover)

```css
/* Nur auf Primary Button */
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-speed-lines);
  background-size: 200% 100%;
  opacity: 0;
  pointer-events: none;
}

.btn-primary:hover::before {
  opacity: 1;
  animation: speed-lines 600ms var(--ease-cartoon) forwards;
}

@keyframes speed-lines {
  0%   { background-position: 200% 0; opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { background-position: -200% 0; opacity: 0; }
}
```

---

### 2. Onomatopoeia

Max. 1× pro Page. Fraunces Italic Display, groß, dezent.

```tsx
function Onomatopoeia({ word = 'BAM' }: { word?: string }) {
  return (
    <motion.span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(48px, 6vw, 96px)',
        fontStyle: 'italic',
        fontVariationSettings: "'WONK' 1",
        color: 'var(--forest)',
        opacity: 0.12,
        userSelect: 'none',
        pointerEvents: 'none',
        position: 'absolute',
        letterSpacing: '-0.03em',
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
      animate={{ opacity: 0.12, scale: 1, rotate: -3 }}
      transition={{ duration: 0.6, ease: easing.cartoon, delay: 0.4 }}
    >
      {word}
    </motion.span>
  );
}
```

**Wortliste:** BAM · ZOOM · WHOOSH · KAPOW · ZAP · SWOOSH

---

### 3. Mouse Hole (404 + Footer)

```tsx
// SVG-Komponente — immer am Boden der Seite platziert
function MouseHole() {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
      <ellipse cx="60" cy="40" rx="60" ry="40" fill="var(--ink)" />
      {/* Innen heller für Tiefeneffekt */}
      <ellipse cx="60" cy="44" rx="52" ry="34" fill="var(--forest-deep)" />
    </svg>
  );
}
```

---

### 4. Duo Portrait — Founder Spotlight

```tsx
// "The Chase" — Cinematic Widescreen mit den zwei Gründern
// Immer mit:
// - forest-vignette Gradient Background
// - 21:9 Aspect Ratio
// - Label "— FOUNDER SPOTLIGHT" in label-kicker--light
// - Fraunces Hero: "Two operators. One chase."
// - "chase" in forest-leaf Italic (WONK 1)
// - Chase Trail animated (1× per page budget hier aufbrauchen)

function FounderSpotlight() {
  return (
    <Box
      aspectRatio="21/9"
      background="var(--gradient-forest-vignette)"
      position="relative"
      overflow="hidden"
      borderRadius="var(--radius-5)"
    >
      <ChaseTrail trigger animated />
      <Box position="absolute" bottom={12} left={12}>
        <Text className="label-kicker label-kicker--light">Founder Spotlight</Text>
        <Heading className="t-h1" color="paper" mt={4}>
          Two operators.{' '}
          <Box as="span" color="forest.leaf" fontStyle="italic">
            One chase.
          </Box>
        </Heading>
      </Box>
    </Box>
  );
}
```

---

## Motion-Checkliste

| Check | Regel |
|---|---|
| Hover-Duration | max. `--duration-base` (200ms) |
| Section-Entrance | `whileInView` + `once: true` — nie loopend |
| Cartoon-Akzente | max. 2 pro Page gleichzeitig |
| Chase Trail (animated) | **1× pro Page** — budget bewusst einsetzen |
| `prefers-reduced-motion` | Immer berücksichtigen |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
