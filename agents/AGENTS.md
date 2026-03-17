# Proxima AI Agents

Multi-agent system for design-first frontend development with neobrutalism design system.

---

## 📁 Agent Files

| File | Purpose | When to Use |
|------|---------|-------------|
| [`workflow.md`](./workflow.md) | **START HERE** - Workflow orchestration and agent handoff | Every new feature request |
| [`design.agent.md`](./design.agent.md) | Design Agent guardrails and neobrutalism specifications | Creating new UI designs |
| [`frontend.agent.md`](./frontend.agent.md) | Frontend Agent implementation rules and patterns | Implementing approved designs |

---

## 🚀 Quick Start

**To create a new feature:**

1. **User Request:** "Create [feature name]"

2. **System:** Read `workflow.md` → Invoke Design Agent

3. **Design Agent:** Creates design specification in `.agents/designs/`

4. **User:** Reviews and approves (or requests changes)

5. **System:** Invoke Frontend Agent

6. **Frontend Agent:** Implements and integrates with backend

7. **User:** Tests and provides feedback

---

## 🎯 Core Principles

### 1. Design First, Code Second

```
✅ CORRECT WORKFLOW:
User Request → Design Agent → User Approval → Frontend Agent → Done

❌ WRONG WORKFLOW:
User Request → Frontend Agent → Done (SKIPS DESIGN)
```

**Never skip the design phase.** Frontend Agent MUST have approved DESIGN_SPEC.md before coding.

### 2. Neobrutalism Always

All UI must follow neobrutalism design principles:
- Bold borders (3px minimum)
- Vibrant, high-contrast colors
- Hard shadows (no blur)
- Stark typography (700+ weight)
- Sharp corners (0-4px radius)

**No exceptions.** This is a core brand identity.

### 3. Backend Integration Required

Frontend is not complete until:
- ✅ All API endpoints integrated
- ✅ Socket.IO events connected (if real-time)
- ✅ Error states handled
- ✅ Loading states implemented
- ✅ Tested with backend running

---

## 📊 Agent Responsibilities

### Design Agent

| Responsibility | Description |
|----------------|-------------|
| **Create mockups** | ASCII wireframes with labeled sections |
| **Define colors** | Exact hex codes for all elements |
| **Specify typography** | Font, size, weight, line-height |
| **List components** | All UI components needed |
| **Define states** | Hover, active, disabled, loading, error |
| **Responsive design** | Desktop, tablet, mobile layouts |

**Deliverable:** `DESIGN_SPEC.md`

### Frontend Agent

| Responsibility | Description |
|----------------|-------------|
| **Implement design** | Match DESIGN_SPEC.md exactly |
| **Write TypeScript** | No `any` types, proper interfaces |
| **Integrate backend** | Use `src/api.ts` for all API calls |
| **Handle states** | Loading, error, success, empty |
| **Add Socket.IO** | Real-time features where needed |
| **Test integration** | Verify with backend running |

**Deliverable:** Production-ready React/TypeScript components

---

## 🛡️ Guardrails Summary

### Design Agent Guardrails

1. ✅ ALWAYS use neobrutalism style
2. ✅ ALWAYS produce visual mockups (ASCII minimum)
3. ✅ ALWAYS specify exact values (hex, px, rem)
4. ✅ NEVER say "style as appropriate"
5. ✅ ALWAYS consider mobile responsiveness
6. ✅ WAIT for user approval before handoff

### Frontend Agent Guardrails

1. ✅ NEVER start without DESIGN_SPEC.md
2. ✅ ALWAYS follow design exactly
3. ✅ ALWAYS integrate with backend
4. ✅ ALWAYS add TypeScript types (no `any`)
5. ✅ ALWAYS handle errors and loading
6. ✅ ALWAYS test before marking complete

---

## 📁 File Structure

```
.agents/
├── AGENTS.md                  # This file - agent system overview
├── workflow.md                # Workflow orchestration (START HERE)
├── design.agent.md            # Design Agent guardrails
├── frontend.agent.md          # Frontend Agent guardrails
└── designs/
    ├── DESIGN_SPEC.md         # Current active design specification
    └── archive/
        ├── login-page-design.md
        ├── dashboard-design.md
        └── ...
```

---

## 🎨 Design System Quick Reference

### Colors

```css
--color-primary: #FF6B6B;      /* Coral red */
--color-secondary: #4ECDC4;    /* Teal */
--color-accent: #FFE66D;       /* Yellow */
--color-black: #1A1A1A;        /* Text, borders */
--color-white: #FFFFFF;        /* Backgrounds */
--color-gray: #F7F7F7;         /* Secondary backgrounds */
```

### Typography

```css
--font-primary: 'Inter', sans-serif;
--text-base: 1rem;
--text-2xl: 1.5rem;
--text-3xl: 2rem;
--font-bold: 700;
--font-black: 900;
```

### Borders & Shadows

```css
border: 3px solid #1A1A1A;
box-shadow: 4px 4px 0px #1A1A1A;  /* Hard shadow, no blur */
```

---

## 🔄 Workflow States

```
┌─────────────┐
│   IDLE      │ ← User makes request
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   DESIGN    │ ← Design Agent creates spec
│   PHASE     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   WAITING   │ ← ⛔ STOP: Wait for user approval
│   APPROVAL  │
└──────┬──────┘
       │
       ▼ (User approves)
┌─────────────┐
│   FRONTEND  │ ← Frontend Agent implements
│   PHASE     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   TESTING   │ ← Verify backend integration
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   COMPLETE  │ ← Ready for user review
└─────────────┘
```

---

## ✅ Quality Standards

### Design Quality

- [ ] Neobrutalism style clearly visible
- [ ] All colors specified with hex codes
- [ ] All typography defined (size, weight)
- [ ] All interactive states described
- [ ] Responsive behavior specified
- [ ] Accessibility considered (contrast, focus)

### Code Quality

- [ ] Design fidelity ≥ 95%
- [ ] Zero TypeScript errors
- [ ] No `any` types
- [ ] All API endpoints integrated
- [ ] All error states handled
- [ ] Mobile responsive
- [ ] No console errors

---

## 📞 Escalation & Questions

### Design Agent Should Ask When:

- Uncertain about feature requirements
- Need clarification on user flow
- Want to confirm color preferences
- Design scope is ambiguous

### Frontend Agent Should Ask When:

- Design spec is unclear
- API endpoint missing
- Backend integration fails
- Design has accessibility issues
- Scope is ambiguous

### Never:

- Guess the design intent
- Change design without approval
- Skip error handling
- Leave `any` types
- Commit broken code

---

## 📚 Additional Resources

| Resource | Purpose |
|----------|---------|
| [FRONTEND_IMPLEMENTATION_PLAN.md](./FRONTEND_IMPLEMENTATION_PLAN.md) | Complete page specifications |
| [test.md](./test.md) | Backend API testing guide |
| [implement.md](./implement.md) | Original implementation guide |
| [neobrutalism.dev](https://v3.neobrutalism.dev/docs) | Neobrutalism component library |

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Design approval rate | 90%+ first iteration |
| Design-to-code fidelity | 95%+ match |
| API integration success | 100% endpoints working |
| Mobile responsiveness | 100% pages responsive |
| TypeScript strictness | 0 `any` types |
| Error handling | 100% user-facing errors handled |

---

## 🚀 Example Session

```
User: "Create the login page"

System: 
  ✅ Starting Design Agent...
  
Design Agent:
  📄 Created: .agents/designs/login-page-design.md
  
  Key features:
  - Neobrutalism style with #FF6B6B primary
  - Email + password form
  - Login/Register/Join Class buttons
  - Responsive mobile-first design
  
  Ready for your review. Reply "approved" to proceed.

User: "approved"

System:
  ✅ Design approved
  ✅ Starting Frontend Agent...

Frontend Agent:
  📝 Implementing LoginPage.tsx...
  🔌 Integrating with authAPI.login()
  ✅ Testing with backend...
  
  ## ✅ Implementation Complete: Login Page
  
  Files Created:
  - frontend/src/app/pages/LoginPage.tsx
  
  Features:
  ✅ Email/password form with validation
  ✅ Login API integration
  ✅ Error handling with toast notifications
  ✅ Links to Register and Join Class
  ✅ Responsive design (mobile/tablet/desktop)
  
  🌐 Preview: http://localhost:5173/
  ⚠️ Backend must be running on http://localhost:3001
  
  Ready for your review!

User: "Looks great, thanks!"

✅ Task complete
```

---

## 📖 Agent Invocation

To invoke an agent, use the task tool with the appropriate agent type:

```
task:
  description: "Design login page"
  subagent_type: "design"
  prompt: "Create neobrutalism design for login page"
```

```
task:
  description: "Implement login page"
  subagent_type: "frontend"
  prompt: "Implement login page from DESIGN_SPEC.md"
```

---

**Remember:** Good design + clean code + working integration = Happy users 🚀
