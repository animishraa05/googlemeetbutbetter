# Proxima Agent System — Quick Reference

## 🎯 One-Page Cheat Sheet

---

## Workflow in 30 Seconds

```
┌─────────────────────────────────────────────────────────────────┐
│  USER: "Create [feature]"                                       │
│           ↓                                                     │
│  🎨 DESIGN AGENT: Creates DESIGN_SPEC.md                        │
│           ↓                                                     │
│  ⛔ STOP: Wait for user approval                                │
│           ↓                                                     │
│  💻 FRONTEND AGENT: Implements code                             │
│           ↓                                                     │
│  ✅ COMPLETE: Test with backend                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Golden Rule:** Design FIRST → Approval → Code SECOND

---

## Neobrutalism in 10 Seconds

```css
/* Borders: THICK */
border: 3px solid #1A1A1A;

/* Colors: BOLD */
#FF6B6B (red)  #4ECDC4 (teal)  #FFE66D (yellow)

/* Shadows: HARD (no blur) */
box-shadow: 4px 4px 0px #1A1A1A;

/* Typography: HEAVY */
font-weight: 700-900;

/* Corners: SHARP */
border-radius: 0-4px;
```

**If it looks subtle, you're doing it wrong.**

---

## Agent Files at a Glance

| File | Read When... |
|------|--------------|
| **AGENTS.md** | You want overview of entire system |
| **workflow.md** | Starting a new feature (START HERE) |
| **design.agent.md** | You are Design Agent creating UI specs |
| **frontend.agent.md** | You are Frontend Agent implementing code |

---

## Design Agent Checklist

```
☐ Analyze requirements
☐ Create ASCII wireframe
☐ Define color palette (hex codes)
☐ Specify typography (font, size, weight)
☐ List all components needed
☐ Define all states (hover, active, disabled, loading, error)
☐ Specify responsive behavior (desktop/tablet/mobile)
☐ Output: DESIGN_SPEC.md
☐ WAIT for user approval
```

---

## Frontend Agent Checklist

```
☐ Read DESIGN_SPEC.md completely
☐ Check existing components
☐ Verify API endpoints exist
☐ Implement components EXACTLY as designed
☐ Add TypeScript types (NO any)
☐ Integrate with backend API
☐ Handle loading/error/success states
☐ Add Socket.IO if real-time needed
☐ Test with backend running
☐ Output: Working React/TypeScript code
```

---

## File Locations

```
.agents/
├── AGENTS.md                 ← System overview
├── workflow.md               ← START HERE for new features
├── design.agent.md           ← Design specifications
├── frontend.agent.md         ← Implementation rules
└── designs/
    ├── DESIGN_SPEC.md        ← Current active design
    └── archive/              ← Past designs

frontend/
├── src/
│   ├── api.ts                ← API client (USE THIS)
│   ├── socket.ts             ← Socket client (USE THIS)
│   ├── app/
│   │   ├── pages/            ← Page components
│   │   ├── components/       ← Reusable components
│   │   └── context/          ← React context
│   └── types/                ← TypeScript types
```

---

## API Integration Pattern

```typescript
// 1. Import
import { authAPI, classAPI } from '@/api';

// 2. Call
const response = await authAPI.login({ email, password });

// 3. Handle
if (response.data.user) {
  // Success
} else {
  // Error
}
```

**Always use existing API functions. Don't create new fetch calls.**

---

## Component Template (Neobrutalism)

```tsx
<button className="
  bg-neo-primary text-neo-black font-bold
  border-3 border-neo-black
  px-6 py-3
  shadow-neo-md
  hover:-translate-y-0.5 hover:shadow-neo-lg
  active:translate-y-0 active:shadow-neo-sm
  transition-all duration-150
">
  Click Me
</button>
```

**Key classes:**
- `border-3` or `border-4` (thick borders)
- `shadow-neo-*` (hard shadows)
- `font-bold` or `font-black` (heavy weights)
- `bg-neo-*` (vibrant colors)

---

## Common Tailwind Classes

```
Colors:
  bg-neo-primary    bg-neo-secondary    bg-neo-accent
  text-neo-black    text-neo-white      text-neo-gray

Borders:
  border-3 border-neo-black
  border-4 border-neo-black

Shadows:
  shadow-neo-sm     (2px 2px)
  shadow-neo-md     (4px 4px)
  shadow-neo-lg     (6px 6px)
  shadow-neo-xl     (8px 8px)

Spacing:
  p-4 p-6 p-8       (padding)
  m-4 m-6 m-8       (margin)
  gap-4 gap-6       (grid/flex gap)

Typography:
  font-bold         font-black
  text-xl text-2xl  text-3xl text-4xl

Effects:
  hover:-translate-y-0.5
  hover:shadow-neo-lg
  transition-all duration-150
```

---

## State Management Pattern

```typescript
const [state, setState] = useState({
  loading: false,
  error: null,
  data: null,
});

// Loading
if (state.loading) return <LoadingSkeleton />;

// Error
if (state.error) return <ErrorBanner message={state.error} />;

// Empty
if (!state.data) return <EmptyState />;

// Success
return <MainContent data={state.data} />;
```

**Always handle all 4 states.**

---

## Questions to Ask User

### Design Agent Asks:

- "Should [feature] use primary or secondary color?"
- "Do you want [layout] to be two-column or single-column?"
- "Should the CTA button say [X] or [Y]?"
- "Is this the right user flow: [describe flow]?"

### Frontend Agent Asks:

- "The design shows [X] but API endpoint doesn't exist. Create stub?"
- "Getting 500 error from [endpoint]. Backend needs fixing."
- "Specified color #XXX doesn't meet WCAG contrast. Use #YYY instead?"
- "Should this be a separate component or part of existing page?"

**Never guess. Always confirm.**

---

## Success Criteria

### Design Success:

1. ✅ Neobrutalism style obvious at first glance
2. ✅ All values explicit (no "appropriate" styling)
3. ✅ Frontend Agent can implement without questions
4. ✅ Mobile responsive behavior specified
5. ✅ All interactive states defined

### Code Success:

1. ✅ Matches design 95%+
2. ✅ Zero TypeScript errors
3. ✅ No `any` types
4. ✅ All API calls work
5. ✅ All states handled
6. ✅ Mobile responsive
7. ✅ No console errors

---

## Red Flags 🚩

### Design Red Flags:

- ❌ "Style as appropriate"
- ❌ No hex codes specified
- ❌ No wireframe/mockup
- ❌ No responsive behavior
- ❌ Missing interactive states

### Code Red Flags:

- ❌ Started without DESIGN_SPEC.md
- ❌ Design deviations without approval
- ❌ `any` types in TypeScript
- ❌ No error handling
- ❌ Untested with backend
- ❌ Console errors present

---

## Quick Commands

```bash
# Start backend
cd server && npm run dev

# Start frontend
cd frontend && npm run dev

# Type check
cd frontend && npx tsc --noEmit

# Test backend
cd server && ./test.sh

# View Prisma database
cd server && npx prisma studio
```

---

## Example: Login Page Flow

```
USER: "Create login page"

DESIGN AGENT:
  Creates .agents/designs/login-page-design.md
  - Email + password fields
  - Primary button: #FF6B6B
  - Links to Register and Join Class
  - ASCII wireframe included
  - All states defined
  → "Ready for review"

USER: "approved"

FRONTEND AGENT:
  Reads DESIGN_SPEC.md
  Creates frontend/src/app/pages/LoginPage.tsx
  - Implements form with validation
  - Integrates authAPI.login()
  - Adds loading/error states
  - Applies neobrutalism styles
  - Tests with backend
  → "Implementation complete"

USER: Tests at http://localhost:5173/
✅ Done
```

---

## Remember

> **Design without approval → ❌ Rework**
> **Code without design → ❌ Chaos**
> **Integration without testing → ❌ Bugs**

**Take your time. Do it right. Follow the workflow.** 🚀

---

## Need Help?

1. Check `workflow.md` for process questions
2. Check `design.agent.md` for design questions
3. Check `frontend.agent.md` for code questions
4. Check `FRONTEND_IMPLEMENTATION_PLAN.md` for page specs
5. Ask the user when uncertain

**When in doubt, ask. Never assume.**
