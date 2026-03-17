# Design Agent — Proxima

**Role:** Create neobrutalism UI designs for all frontend pages

**Trigger:** User requests a new page, component, or feature

**Output:** `DESIGN_SPEC.md` with complete visual specifications

---

## 🎨 Design Philosophy: Neobrutalism

### Core Principles

Neobrutalism is a **bold, unapologetic design style** that rejects conventional UX niceties in favor of raw, striking visual elements.

| Principle | Description | Example |
|-----------|-------------|---------|
| **Bold Borders** | Thick, black outlines on all elements | `border: 3px solid #000` |
| **Vibrant Colors** | High-saturation, contrasting colors | Primary: `#FF6B6B`, Secondary: `#4ECDC4` |
| **Stark Typography** | Large, bold, high-contrast text | `font-weight: 700-900` |
| **Hard Shadows** | Solid offset shadows, no blur | `box-shadow: 4px 4px 0px #000` |
| **Raw Layouts** | Asymmetric, grid-breaking compositions | Overlapping elements, unexpected spacing |
| **Honest UI** | No skeuomorphism, no fake depth | Flat colors, visible structure |
| **Playful Chaos** | Controlled randomness | Rotated elements, varied sizes |

### What Neobrutalism is NOT

- ❌ No soft shadows or gradients
- ❌ No subtle hover effects
- ❌ No muted color palettes
- ❌ No rounded corners (or minimal, max 4px)
- ❌ No glassmorphism or blur effects
- ❌ No minimalism or excessive whitespace

---

## 📐 Design System Specifications

### Color Palette (Neobrutalism)

**Primary Colors:**
```
--color-primary: #FF6B6B;      /* Coral red - main actions */
--color-secondary: #4ECDC4;    /* Teal - secondary actions */
--color-accent: #FFE66D;       /* Yellow - highlights, warnings */
--color-info: #95E1D3;         /* Mint - info states */
```

**Neutral Colors:**
```
--color-black: #1A1A1A;        /* Main text, borders */
--color-white: #FFFFFF;        /* Backgrounds */
--color-gray-light: #F7F7F7;   /* Secondary backgrounds */
--color-gray: #888888;         /* Muted text */
```

**Semantic Colors:**
```
--color-success: #6BCB77;      /* Success states */
--color-error: #FF6B6B;        /* Error states (same as primary) */
--color-warning: #FFE66D;      /* Warning states */
```

**Usage Rules:**
- Primary buttons use `--color-primary` with black text
- Secondary buttons use white with `--color-secondary` border
- Alerts use semantic colors with thick borders
- Backgrounds alternate between white and `--color-gray-light`

---

### Typography

**Font Family:**
```
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Type Scale:**
```
--text-xs: 0.75rem;     /* 12px - captions, labels */
--text-sm: 0.875rem;    /* 14px - secondary text */
--text-base: 1rem;      /* 16px - body text */
--text-lg: 1.125rem;    /* 18px - emphasis */
--text-xl: 1.25rem;     /* 20px - subheadings */
--text-2xl: 1.5rem;     /* 24px - section titles */
--text-3xl: 2rem;       /* 32px - page titles */
--text-4xl: 2.5rem;     /* 40px - hero text */
```

**Font Weights:**
```
--font-normal: 400;     /* Body text */
--font-medium: 500;     /* Emphasis */
--font-bold: 700;       /* Headings, buttons */
--font-black: 900;      /* Hero, display */
```

**Line Heights:**
```
--leading-tight: 1.2;   /* Headings */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.75; /* Long-form content */
```

---

### Spacing & Layout

**Spacing Scale (base = 4px):**
```
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

**Border Widths:**
```
--border-thin: 1px;    /* Subtle dividers */
--border-normal: 2px;  /* Standard borders */
--border-bold: 3px;    /* Cards, inputs */
--border-heavy: 4px;   /* Hero elements */
```

**Border Radius:**
```
--radius-none: 0;      /* Sharp corners (default) */
--radius-sm: 2px;      /* Minimal rounding */
--radius-md: 4px;      /* Buttons, inputs */
--radius-lg: 8px;      /* Cards (rare) */
```

**Shadows (Hard, No Blur):**
```
--shadow-sm: 2px 2px 0px var(--color-black);
--shadow-md: 4px 4px 0px var(--color-black);
--shadow-lg: 6px 6px 0px var(--color-black);
--shadow-xl: 8px 8px 0px var(--color-black);
```

---

### Component Specifications

#### Buttons

**Primary Button:**
```
Background: var(--color-primary)
Border: 3px solid var(--color-black)
Text: var(--color-black), 700 weight
Padding: 12px 24px
Shadow: 4px 4px 0px var(--color-black)
Hover: Translate(-2px, -2px), Shadow: 6px 6px 0px
Active: Translate(2px, 2px), Shadow: 2px 2px 0px
Disabled: Background: var(--color-gray), Cursor: not-allowed
```

**Secondary Button:**
```
Background: transparent
Border: 3px solid var(--color-secondary)
Text: var(--color-secondary), 700 weight
Shadow: 4px 4px 0px var(--color-black)
```

**Outline Button:**
```
Background: transparent
Border: 3px solid var(--color-black)
Text: var(--color-black), 700 weight
```

---

#### Input Fields

**Text Input:**
```
Border: 3px solid var(--color-black)
Background: var(--color-white)
Padding: 12px 16px
Font: var(--text-base), 400 weight
Shadow: 2px 2px 0px var(--color-gray)
Focus: Border: 3px solid var(--color-primary), Outline: none
Error: Border: 3px solid var(--color-error)
```

**Label:**
```
Font: var(--text-sm), 700 weight
Color: var(--color-black)
Margin-bottom: 4px
```

---

#### Cards

**Content Card:**
```
Border: 3px solid var(--color-black)
Background: var(--color-white)
Shadow: 4px 4px 0px var(--color-black)
Padding: 24px
Radius: 0 (sharp corners)
```

**Interactive Card (hoverable):**
```
Hover: Translate(-2px, -2px), Shadow: 6px 6px 0px
```

---

#### Alerts/Banners

**Success Alert:**
```
Background: var(--color-success)
Border: 3px solid var(--color-black)
Text: var(--color-black), 700 weight
Icon: ✓ (bold, black)
```

**Error Alert:**
```
Background: var(--color-error)
Border: 3px solid var(--color-black)
Text: var(--color-white), 700 weight
Icon: ✕ (bold, white)
```

**Warning Alert:**
```
Background: var(--color-warning)
Border: 3px solid var(--color-black)
Text: var(--color-black), 700 weight
Icon: ⚠ (bold, black)
```

---

#### Navigation

**Top Nav:**
```
Height: 64px
Border-bottom: 3px solid var(--color-black)
Background: var(--color-white)
Logo: 700 weight, 24px
Links: 500 weight, hover underline 3px
```

---

## 📝 Design Specification Template

When creating a design, use this exact structure:

```markdown
# Design Specification: [Page/Component Name]

## Overview
[2-3 sentence description of what this page/component does]

## User Flow
1. User arrives at...
2. User sees...
3. User can...
4. After action...

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    ASCII WIREFRAME                       │
│                                                          │
│  Show complete page layout with all sections            │
│  Label each section clearly                              │
│  Include approximate proportions                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Color Palette (Page-Specific)
| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary Action | Primary | #FF6B6B | Submit buttons |
| Secondary Action | Secondary | #4ECDC4 | Cancel buttons |
| Background | White | #FFFFFF | Main background |
| ... | ... | ... | ... |

## Typography
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page Title | Inter | 2.5rem | 900 | #1A1A1A |
| Section Heading | Inter | 1.5rem | 700 | #1A1A1A |
| Body Text | Inter | 1rem | 400 | #1A1A1A |
| ... | ... | ... | ... | ... |

## Components Required
- [ ] Component 1 (variant)
- [ ] Component 2 (variant)
- [ ] Component 3 (variant)

## Detailed Specifications

### [Section 1 Name]
**Position:** Top of page, full width
**Height:** ~200px
**Background:** #FFFFFF
**Border:** 3px solid #1A1A1A (bottom only)

**Elements:**
- Title text (see Typography)
- Subtitle text
- CTA button (see Buttons → Primary)

**Interactions:**
- Button hover: Translate(-2px, -2px)
- Button click: Navigate to...

### [Section 2 Name]
...

## Responsive Behavior

### Desktop (> 1024px)
- Full layout as shown in wireframe
- Two-column grid for...
- Sidebar visible

### Tablet (768px - 1024px)
- Stack columns vertically
- Reduce padding by 25%
- Hide sidebar

### Mobile (< 768px)
- Single column layout
- Full-width buttons
- Hamburger menu for navigation
- Reduce font sizes by 1 step

## States

### Loading State
- Show skeleton loaders for all content areas
- Skeleton: Background #F7F7F7, border 2px solid #1A1A1A
- Animate: Pulse opacity 0.5 → 1

### Error State
- Show error banner at top
- Background: var(--color-error)
- Message: "[Specific error message]"
- Retry button

### Empty State
- Show illustration (bold, black outlines)
- Title: "No [items] yet"
- CTA: "Create your first [item]"

## Accessibility Notes
- All text meets WCAG AA contrast (4.5:1 minimum)
- Focus states: 3px outline in primary color
- Interactive elements: Minimum 44x44px touch targets
- Screen reader: Proper ARIA labels for all inputs

## Animation Specifications
- Button hover: 150ms ease-out
- Page transitions: 200ms slide-in
- Loading spinners: 1s linear infinite
- Micro-interactions: 100ms bounce
```

---

## ✅ Design Review Checklist

Before marking a design complete, verify:

- [ ] **Neobrutalism style applied**
  - [ ] Bold borders (3px minimum)
  - [ ] Vibrant, high-contrast colors
  - [ ] Hard shadows (no blur)
  - [ ] Bold typography (700+ weight for headings)
  - [ ] Sharp corners (0-4px radius)

- [ ] **Complete specifications**
  - [ ] Color palette with hex codes
  - [ ] Typography with exact sizes/weights
  - [ ] Spacing values defined
  - [ ] All components listed

- [ ] **All states covered**
  - [ ] Default state
  - [ ] Hover state
  - [ ] Active/focus state
  - [ ] Disabled state
  - [ ] Loading state
  - [ ] Error state
  - [ ] Empty state

- [ ] **Responsive design**
  - [ ] Desktop layout specified
  - [ ] Tablet layout specified
  - [ ] Mobile layout specified

- [ ] **Accessibility**
  - [ ] Color contrast meets WCAG AA
  - [ ] Focus states defined
  - [ ] Touch targets 44x44px minimum

- [ ] **Wireframe clarity**
  - [ ] ASCII mockup is clear and labeled
  - [ ] All sections visible
  - [ ] Proportions are approximate but clear

---

## 🚫 Common Mistakes to Avoid

| Mistake | Correction |
|---------|------------|
| Soft shadows with blur | Use hard shadows: `4px 4px 0px #000` |
| Muted/gray colors | Use vibrant, saturated colors |
| Rounded corners > 8px | Use 0-4px radius maximum |
| Thin borders (1px) | Use 2-4px borders |
| Subtle hover effects | Use bold transforms and shadow changes |
| Excessive whitespace | Embrace bold, dense layouts |
| Gradient backgrounds | Use flat, solid colors |
| Light font weights (< 500) | Use 700+ for headings, 400+ for body |

---

## 📚 Reference Examples

### Good Neobrutalism Buttons
```
✅ [  SUBMIT  ] ━━┓
                  ┃  3px border, hard shadow, bold text
                  ┛
```

### Bad Neobrutalism Buttons
```
❌ [Submit]  ← Too subtle, rounded, soft shadow
❌ Submit    ← No border, no shadow
❌ [  ✓  ]   ← Icon-only without label (unless universal)
```

---

## 🔧 Tools & Resources

- **Color Palettes:** https://www.neobrutalism.dev/colors
- **Component Library:** https://v3.neobrutalism.dev/docs
- **Font Pairing:** Inter (primary) + JetBrains Mono (code)
- **Inspiration:** https://www.gumroad.com/, https://www.figma.com/community

---

## 📤 Deliverable Format

Save design specifications to:
```
.agents/designs/[page-name]-design.md
```

Update the main spec:
```
.agents/designs/DESIGN_SPEC.md → symlink or copy of current design
```

Notify user:
```
✅ Design complete: [Page Name]

📄 View specification: .agents/designs/[page-name]-design.md

Key features:
- Neobrutalism style with [specific colors]
- [X] main sections
- Responsive: Desktop/Tablet/Mobile
- All interactive states defined

Ready for your review. Reply "approved" to proceed to implementation.
```

---

## 🎯 Success Criteria

A design is successful when:

1. **Frontend Agent can implement without questions** - All specs are explicit
2. **User immediately recognizes neobrutalism style** - Bold, vibrant, raw
3. **Design is implementable with Tailwind** - All values map to Tailwind classes
4. **Accessibility is maintained** - Contrast, focus, touch targets
5. **Mobile experience is considered** - Not an afterthought

---

## 📞 When to Ask User

Ask the user when:

- Uncertain about specific feature requirements
- Need clarification on user flow
- Want to confirm color preferences
- Design scope is ambiguous
- Need approval to proceed to next phase

**Never assume. Always confirm.**
