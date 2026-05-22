# Components — T&J Consulting Design System

> Buttons · Badges · Inputs · Navigation · Modals · Icons · Chase Trail

---

## Buttons

### Hierarchie

| Stufe | Variante | Farbe | Einsatz |
|---|---|---|---|
| Primary | `.btn-primary` | Ink (black) → Forest Deep | Haupt-CTA: "Termin buchen →" |
| Secondary | `.btn-secondary` | Forest → Glow | Sekundär-CTA: "Beratung sichern →" |
| Tertiary | `.btn-tertiary` | Transparent + Underline | Soft-CTA: "Mehr erfahren" |

### Shared Base

```css
.btn {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
  padding: 12px 20px;
  border-radius: var(--radius-2);    /* 4px — sharp, editorial */
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-default);
  position: relative;
  overflow: hidden;
  border: none;
  text-decoration: none;
}

/* Scale-Down on Press — via Framer Motion oder CSS */
.btn:active { transform: scale(0.97); }

/* Arrow-Suffix Hover-Animation */
.btn .btn-arrow {
  display: inline-block;
  transition: transform var(--duration-fast) var(--ease-cartoon);
}
.btn:hover .btn-arrow { transform: translateX(2px); }
```

### Primary Button

```css
.btn-primary {
  background: var(--ink);
  color: var(--paper);
}

.btn-primary:hover {
  background: var(--forest-deep);
}

/* Speed Lines Easter Egg */
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-speed-lines);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-default);
}

.btn-primary:hover::before {
  opacity: 1;
  animation: speed-lines 600ms var(--ease-cartoon) forwards;
}

@keyframes speed-lines {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
```

### Secondary Button

```css
.btn-secondary {
  background: var(--forest);
  color: var(--paper);
}

.btn-secondary:hover { background: var(--glow); }
```

### Tertiary Button

```css
.btn-tertiary {
  background: transparent;
  color: var(--ink);
  border-bottom: 1px solid var(--ink);
  border-radius: 0;
  padding: 4px 0;
  font-size: 14px;
}

.btn-tertiary:hover {
  color: var(--forest);
  border-color: var(--forest);
}
```

### Framer Motion Integration

```tsx
import { motion } from 'framer-motion';

function Button({ variant = 'primary', children, ...props }) {
  return (
    <motion.button
      className={`btn btn-${variant}`}
      whileTap={{ scale: 0.97 }}
      whileHover={variant === 'primary' ? { backgroundColor: '#122620' } : undefined}
      {...props}
    >
      {children}
      {variant !== 'tertiary' && (
        <motion.span
          className="btn-arrow"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
        >
          →
        </motion.span>
      )}
    </motion.button>
  );
}
```

### Chakra UI Button Variants

```typescript
// theme/index.ts → components.Button.variants
Button: {
  variants: {
    primary: {
      bg: 'ink',
      color: 'paper',
      borderRadius: 'sm',           // 4px
      fontFamily: 'body',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      _hover: { bg: 'forest.deep' },
      _active: { transform: 'scale(0.97)' },
    },
    secondary: {
      bg: 'forest.DEFAULT',
      color: 'paper',
      borderRadius: 'sm',
      fontFamily: 'body',
      fontWeight: 500,
      _hover: { bg: 'forest.glow' },
      _active: { transform: 'scale(0.97)' },
    },
    ghost: {
      bg: 'transparent',
      color: 'ink',
      borderBottom: '1px solid',
      borderColor: 'ink',
      borderRadius: 0,
      px: 0,
      py: 1,
      fontFamily: 'body',
      _hover: { color: 'forest.DEFAULT', borderColor: 'forest.DEFAULT' },
    },
  },
}
```

### Button States

| State | CSS | Visuell |
|---|---|---|
| Default | — | Normal |
| Hover | Farbe tiefer, Speed Lines | Forest-Deep oder Glow |
| Active/Press | `transform: scale(0.97)` | Leicht verkleinert |
| Disabled | `opacity: 0.38; pointer-events: none` | Ausgeblendet |
| Loading | `opacity: 0.65; cursor: wait` | Mit Spinner |

---

## Badges & Tags

### Label-Kicker (Abschnitts-Bezeichnung)

Für Section-Header wie `— PAIN 02`, `— CASE 03`.

```css
.label-kicker {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mute);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.label-kicker::before {
  content: '—';
  font-size: 0.9em;
  letter-spacing: 0;
}

/* Auf dunklem Hintergrund */
.label-kicker--light { color: rgba(252, 252, 253, 0.50); }
```

### Status Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  border-radius: var(--radius-full);
  padding: 3px 10px;
  border: 1px solid transparent;
}

.badge--default {
  background: var(--frost);
  color: var(--mute);
  border-color: var(--mist);
}

.badge--forest {
  background: rgba(74, 124, 92, 0.12);
  color: var(--forest);
  border-color: rgba(74, 124, 92, 0.25);
}

.badge--new {
  background: rgba(74, 124, 92, 0.18);
  color: var(--forest);
  border-color: rgba(74, 124, 92, 0.35);
}

.badge--success {
  background: rgba(34, 197, 94, 0.10);
  color: #166534;
  border-color: rgba(34, 197, 94, 0.20);
}

.badge--error {
  background: rgba(239, 68, 68, 0.08);
  color: #991B1B;
  border-color: rgba(239, 68, 68, 0.18);
}

.badge--warning {
  background: rgba(234, 179, 8, 0.10);
  color: #854D0E;
  border-color: rgba(234, 179, 8, 0.22);
}

.badge--locked {
  background: var(--mist);
  color: var(--mute);
  opacity: 0.60;
}
```

---

## Inputs & Forms

```css
.input {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--ink);
  background: var(--frost);
  border: 1px solid var(--mist);
  border-radius: var(--radius-2);   /* 4px */
  padding: 10px 14px;
  height: 44px;
  width: 100%;
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-default),
              box-shadow var(--duration-fast) var(--ease-default);
}

.input::placeholder { color: var(--mute); opacity: 0.65; }
.input:hover  { border-color: var(--mute); }
.input:focus  {
  border-color: var(--leaf);
  box-shadow: 0 0 0 3px rgba(74, 124, 92, 0.12);
}
.input:invalid { border-color: rgba(239, 68, 68, 0.50); }
.input:disabled { opacity: 0.38; cursor: not-allowed; }

.input--error {
  border-color: rgba(239, 68, 68, 0.50);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
}

.input--success {
  border-color: rgba(74, 124, 92, 0.50);
  box-shadow: 0 0 0 3px rgba(74, 124, 92, 0.08);
}

/* Label */
.input-label {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: var(--space-2);
  display: block;
}

/* Helper Text */
.input-helper {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--mute);
  margin-top: var(--space-2);
}

/* Error Text */
.input-error {
  font-family: var(--font-sans);
  font-size: 12px;
  color: #991B1B;
  margin-top: var(--space-2);
}
```

**Chakra Input Override:**
```typescript
Input: {
  variants: {
    editorial: {
      field: {
        bg: 'frost',
        border: '1px solid',
        borderColor: 'mist',
        borderRadius: 'sm',
        fontFamily: 'body',
        fontSize: '15px',
        color: 'ink',
        _placeholder: { color: 'mute', opacity: 0.65 },
        _hover: { borderColor: 'mute' },
        _focus: {
          borderColor: 'forest.leaf',
          boxShadow: '0 0 0 3px rgba(74,124,92,0.12)',
        },
      },
    },
  },
  defaultProps: { variant: 'editorial' },
}
```

---

## Navigation

### Plattform Sidebar

```css
.sidebar {
  width: var(--sidebar-width);         /* 240px */
  background: var(--frost);
  border-right: 1px solid var(--mist);
  padding: var(--space-5) var(--space-4);
  height: 100vh;
  position: fixed;
  left: 0; top: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-3);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  color: var(--mute);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
  text-decoration: none;
}

.sidebar-item:hover {
  background: rgba(14, 14, 12, 0.04);
  color: var(--ink);
}

.sidebar-item--active {
  background: var(--forest);
  color: var(--paper);
  font-weight: 500;
}

.sidebar-item--active:hover { background: var(--glow); }

.sidebar-section-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--mist);
  padding: var(--space-5) var(--space-4) var(--space-2);
  margin-top: var(--space-3);
}
```

### Plattform Topbar

```css
.topbar {
  height: var(--nav-height);          /* 64px */
  background: rgba(252, 252, 253, 0.92);
  backdrop-filter: blur(16px) saturate(1.4);
  border-bottom: 1px solid var(--mist);
  padding: 0 var(--space-7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 20;
}
```

---

## Modals & Overlays

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 14, 12, 0.65);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  background: var(--paper);
  border: 1px solid var(--mist);
  border-radius: var(--radius-5);    /* 20px */
  box-shadow: var(--shadow-4);
  padding: var(--space-8);           /* 48px */
  max-width: 520px;
  width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  font-family: var(--font-display);
  font-size: 28px;
  font-style: italic;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: var(--space-6);
}
```

**Framer Motion Modal Animation:**
```tsx
const modalVariants = {
  hidden:  { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.65, 0, 0.35, 1] } },
  exit:    { opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.18 } },
};

<AnimatePresence>
  {open && (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal-container" variants={modalVariants} initial="hidden" animate="visible" exit="exit">
        {children}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## Icons (Lucide React)

### Stroke-Width Guidelines

| Kontext | Stroke-Width | Klasse |
|---|---|---|
| Editorial / Groß | 1.25 | `icon--thin` |
| Standard (Default) | 1.5 | — |
| UI / Navigation | 2.0 | `icon--bold` |

```tsx
import { ChevronRight, Lock, CheckCircle2 } from 'lucide-react';

// Standard
<ChevronRight size={20} strokeWidth={1.5} />

// Editorial (in Headings)
<ArrowRight size={24} strokeWidth={1.25} />

// UI-Buttons
<Lock size={16} strokeWidth={2} />
```

### Semantic Map

| Aktion / Bedeutung | Icon | strokeWidth |
|---|---|---|
| Navigation weiter | `ChevronRight` | 1.5 |
| Navigation zurück | `ChevronLeft` | 1.5 |
| CTA Pfeil | `ArrowRight` | 1.25 |
| Abschluss / Erfolg | `CheckCircle2` | 1.5 |
| Gesperrt | `Lock` | 2.0 |
| Video abspielen | `Play` | 1.5 |
| Quiz / Fragen | `HelpCircle` | 1.5 |
| Kurs / Modul | `BookOpen` | 1.5 |
| Fortschritt | `TrendingUp` | 1.5 |
| Dashboard | `LayoutDashboard` | 1.5 |
| Nutzer | `User` | 1.5 |
| Logout | `LogOut` | 1.5 |
| Suche | `Search` | 1.5 |
| Einstellungen | `Settings` | 1.5 |
| Benachrichtigung | `Bell` | 1.5 |
| Schließen | `X` | 2.0 |
| Menü | `Menu` | 1.5 |
| Kalender | `Calendar` | 1.5 |
| Extern / Link | `ExternalLink` | 1.25 |
| Info | `Info` | 1.5 |
| Warnung | `AlertTriangle` | 1.5 |
| Fehler | `XCircle` | 1.5 |
| Zertifikat | `Award` | 1.25 |
| Download | `Download` | 1.5 |
| Upload | `Upload` | 1.5 |
| Dokument | `FileText` | 1.25 |

---

## Chase Trail — Signature Divider

Vier statische + eine animierte Variante. Immer horizontal.

```css
/* SOLID — Default Trennlinie */
.trail-solid {
  width: 100%;
  height: 1px;
  background: var(--mist);
}

/* DASHED — Zwischen verwandten Sektionen */
.trail-dashed {
  width: 100%;
  height: 1px;
  border-top: 1px dashed var(--mist);
}

/* DOTTED — Footer, Meta-Bereiche */
.trail-dotted {
  width: 100%;
  height: 1px;
  border-top: 1px dotted var(--mute);
}

/* STATIC SIGNATURE — Kurzer Forest-Akzent */
.trail-signature {
  width: 40px;
  height: 2px;
  background: var(--forest);
  border-radius: var(--radius-full);
}

/* ANIMATED — 1× pro Page maximum */
.trail-animated {
  width: 100%;
  height: 1px;
  position: relative;
  overflow: hidden;
}

.trail-animated::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, var(--forest) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: chase 800ms var(--ease-cartoon) forwards;
}

@keyframes chase {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
```

**Framer Motion Variante:**
```tsx
function ChaseTrail({ animated = false }: { animated?: boolean }) {
  return (
    <Box position="relative" h="1px" w="100%" overflow="hidden">
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, #1F3A2E 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        initial={{ backgroundPosition: '200% 0' }}
        animate={animated ? { backgroundPosition: '-200% 0' } : {}}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </Box>
  );
}
```

### Chase Trail Einsatz

| Variante | Einsatz |
|---|---|
| Solid | Standard-Trenner zwischen Sections |
| Dashed | Zwischen inhaltlich verwandten Blöcken |
| Dotted | Footer-Bereich, Datums-Trenner |
| Signature | Über Headings als editoriales Akzent-Element |
| Animated | Hero-Section Entry / Founder Spotlight — **1× pro Page** |
