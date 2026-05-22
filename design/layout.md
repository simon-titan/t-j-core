# Layout — T&J Consulting Design System

> Spacing · Radii · Shadows · Grid · Breakpoints · Z-Index

---

## Spacing — 4px Grid

Basis-Einheit: **4px**. Alle Abstände sind Vielfache dieser Einheit.

| Token | Variable | px | rem | Einsatz |
|---|---|---|---|---|
| space-1 | `--space-1` | 2 | 0.125 | Hairline-Gaps, Icon-Abstand minimal |
| space-2 | `--space-2` | 4 | 0.25 | Icon-Text-Gap, Inline-Trenner |
| space-3 | `--space-3` | 8 | 0.5 | Inline Elements, Badge-Padding |
| space-4 | `--space-4` | 12 | 0.75 | Compact Stack, Button-Icon-Gap |
| space-5 | `--space-5` | 16 | 1 | Default-Gap zwischen Elementen |
| space-6 | `--space-6` | 24 | 1.5 | Component-Padding (Cards small) |
| space-7 | `--space-7` | 32 | 2 | Card-Padding standard |
| space-8 | `--space-8` | 48 | 3 | Section-Inner-Padding |
| space-9 | `--space-9` | 64 | 4 | Abstand zwischen Sections |
| space-10 | `--space-10` | 96 | 6 | Section-Padding (large screens) |
| space-11 | `--space-11` | 128 | 8 | Hero-Padding, maximale Abstände |

**Verboten:** `padding: 15px`, `margin: 7px`, `gap: 10px` — immer auf das nächste Grid-Multiple runden.

---

## Radii — 6 Stufen

| Token | Variable | px | Semantik |
|---|---|---|---|
| radius-1 | `--radius-1` | 2px | Inputs, Badges minimal |
| radius-2 | `--radius-2` | 4px | Buttons (sharp, editorial) · Inputs standard |
| radius-3 | `--radius-3` | 8px | Cards default · Module Cards |
| radius-4 | `--radius-4` | 14px | Cards raised · Stacked Cards · Pain/Case/Voice |
| radius-5 | `--radius-5` | 20px | Modals · Hero-Surfaces · Widget Cards |
| radius-full | `--radius-full` | 9999px | Pills · Badges · Avatars · Icon-Buttons |

### Semantische Zuordnung

| Komponente | Token | px |
|---|---|---|
| Buttons | `--radius-2` | 4px |
| Inputs | `--radius-2` | 4px |
| Badges / Tags | `--radius-full` | pill |
| Avatare | `--radius-full` | round |
| Cards (default) | `--radius-3` | 8px |
| Cards (raised/dark) | `--radius-4` | 14px |
| Modals | `--radius-5` | 20px |
| Widget-Cards | `--radius-5` | 20px |
| Hero-Surfaces | `--radius-5` | 20px |
| Tooltips | `--radius-2` | 4px |
| Progress Bars | `--radius-full` | pill |
| Sidebar-Items | `--radius-3` | 8px |

---

## Shadows — 4 Level + Cool-Cast

### Standard Shadows

```css
/* Level 1 — Subtle lift, Default Card */
--shadow-1: 0 1px 2px rgba(14, 14, 12, 0.04),
            0 1px 1px rgba(14, 14, 12, 0.03);

/* Level 2 — Card Hover, Dropdown */
--shadow-2: 0 4px 8px rgba(14, 14, 12, 0.06),
            0 2px 4px rgba(14, 14, 12, 0.04);

/* Level 3 — Modal, Floating Panel */
--shadow-3: 0 12px 24px rgba(14, 14, 12, 0.08),
            0 4px 8px rgba(14, 14, 12, 0.05);

/* Level 4 — Hero-Element, maximale Elevation */
--shadow-4: 0 24px 48px rgba(14, 14, 12, 0.10),
            0 8px 16px rgba(14, 14, 12, 0.06);
```

### Cool-Cast Shadows (Editorial-Touch)

Forest-Ink-Anteil statt reinem Schwarz — Editorial-Feeling:

```css
/* Cool Level 2 */
--shadow-cool-2: 0 4px 8px rgba(18, 38, 32, 0.08),
                 0 2px 4px rgba(18, 38, 32, 0.05);

/* Cool Level 3 */
--shadow-cool-3: 0 12px 24px rgba(18, 38, 32, 0.10),
                 0 4px 8px rgba(18, 38, 32, 0.07);
```

### Shadow-Zuordnung

| Komponente | Shadow | Hover |
|---|---|---|
| Card (default) | `--shadow-1` | `--shadow-2` |
| Card (featured) | `--shadow-3` | `--shadow-4` |
| Dropdown | `--shadow-2` | — |
| Modal | `--shadow-4` | — |
| Topbar | `--shadow-1` (cool) | — |
| Widget | `--shadow-cool-2` | — |
| Stacked Cards | `--shadow-2` | `--shadow-3` |

---

## Grid & Layout

### 12-Spalten Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);        /* 24px */
  max-width: var(--content-max-width);  /* 1280px */
  margin: 0 auto;
  padding: 0 var(--space-7);  /* 32px horizontal padding */
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-5);      /* 16px */
    padding: 0 var(--space-5);
  }
}
```

### Breakpoints

| Name | Breite | Anwendung |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large Desktop |
| `2xl` | 1536px | Wide Screen |

```css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Layout-Templates

**Marketing Page:**
```
┌─────────────────────────────────────────┐
│  Topbar (sticky, blur)                  │
├─────────────────────────────────────────┤
│  Hero (full-bleed, dark gradient)       │
├─────────────────────────────────────────┤
│  Content Sections (max-width: 1280px)   │
├─────────────────────────────────────────┤
│  Footer (ink-fade gradient)             │
└─────────────────────────────────────────┘
```

**Plattform (App Shell):**
```
┌────────┬────────────────────────────────┐
│        │  Topbar (64px, blur)           │
│Sidebar │────────────────────────────────┤
│ 240px  │                                │
│        │  Content Area                  │
│        │  max-width: 860–1280px         │
│        │  padding: 40px 24px            │
└────────┴────────────────────────────────┘
```

**Admin (Full Width):**
```
┌─────────────────────────────────────────┐
│  Admin Topbar                           │
├─────────────────────────────────────────┤
│  Content (max-width: 1440px)            │
│  padding: 32px 24px                     │
└─────────────────────────────────────────┘
```

---

## Layout-Konstanten

```css
:root {
  --nav-height:          64px;
  --sidebar-width:       240px;
  --sidebar-collapsed:   64px;
  --content-max-width:   1280px;
  --module-max-width:    860px;
  --admin-max-width:     1440px;
  --page-padding-x:      32px;
  --page-padding-x-sm:   20px;
  --section-gap:         80px;
  --section-gap-sm:      48px;
}
```

---

## Z-Index Stack

| Ebene | Z-Index | Elemente |
|---|---|---|
| base | 0 | Normal-Flow Elemente |
| card | 1 | Cards, raised Elemente |
| dropdown | 10 | Dropdowns, Select Menus |
| sticky | 20 | Sticky Topbar, Sidebar |
| overlay | 50 | Backdrop, Drawer |
| modal | 100 | Modale, Dialoge |
| toast | 200 | Toast-Notifications |
| tooltip | 300 | Tooltips |
| codex | 9999 | Onboarding-Gates, Pflicht-Modals |

---

## Content Width Guidelines

| Kontext | Max-Width | Padding |
|---|---|---|
| Marketing Hero | 100% (full-bleed) | 0 |
| Marketing Content | `1280px` | `32px` |
| Narrow Editorial | `720px` | `32px` |
| Module/Kurs | `860px` | `40px 24px` |
| Admin Tabellen | `1440px` | `32px 24px` |

---

## Chakra UI Layout-Theme

```typescript
// theme/index.ts
sizes: {
  container: {
    sm:   '640px',
    md:   '768px',
    lg:   '1024px',
    xl:   '1280px',
    '2xl': '1440px',
  },
},
space: {
  // Mapped 1:1 auf --space-*
  '1':  '2px',
  '2':  '4px',
  '3':  '8px',
  '4':  '12px',
  '5':  '16px',
  '6':  '24px',
  '7':  '32px',
  '8':  '48px',
  '9':  '64px',
  '10': '96px',
  '11': '128px',
},
```
