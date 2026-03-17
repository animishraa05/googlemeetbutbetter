# Proxima AI Agent Workflow

Multi-agent system for design-first frontend development with neobrutalism design system.

---

## 🎯 Overview

This project uses a **two-agent workflow** with strict guardrails:

1. **Design Agent** (`design.agent.md`) - Creates neobrutalism UI designs FIRST
2. **Frontend Agent** (`frontend.agent.md`) - Implements code AFTER design approval

**Critical Rule:** Frontend agent NEVER starts coding until Design Agent produces approved mockups.

---

## 🔄 Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REQUEST                                 │
│  (e.g., "Create the login page")                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: DESIGN AGENT                                          │
│  ─────────────────────────────────────────────────────────────  │
│  1. Analyze requirements                                        │
│  2. Create neobrutalism design mockup (ASCII/wireframe)         │
│  3. Define color palette, typography, spacing                   │
│  4. Specify all components needed                               │
│  5. Output: DESIGN_SPEC.md                                      │
│                                                                 │
│  ⛔ STOP - Wait for user approval                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (After user approves)
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: FRONTEND AGENT                                        │
│  ─────────────────────────────────────────────────────────────  │
│  1. Read DESIGN_SPEC.md                                         │
│  2. Implement components EXACTLY as specified                   │
│  3. Integrate with backend API                                  │
│  4. Add TypeScript types, error handling, loading states        │
│  5. Test integration                                            │
│  6. Output: Working React components                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DELIVERABLE                                  │
│  - Production-ready TypeScript/React code                       │
│  - Fully integrated with backend                                │
│  - Matches approved neobrutalism design                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Agent Files

| File | Purpose |
|------|---------|
| `.agents/design.agent.md` | Design Agent guardrails and specifications |
| `.agents/frontend.agent.md` | Frontend Agent guardrails and implementation rules |
| `.agents/workflow.md` | This file - workflow orchestration |

---

## 🚨 Critical Guardrails

### For ALL Agents

1. **NEVER break the workflow order** - Design FIRST, then code
2. **ALWAYS wait for user approval** before proceeding to next phase
3. **NEVER assume** - Ask clarifying questions when requirements are ambiguous
4. **ALWAYS check existing files** before creating new ones
5. **NEVER overwrite** approved designs or working code without explicit permission

### Design-Specific Guardrails

1. **ALWAYS use neobrutalism** - No exceptions
2. **ALWAYS produce visual mockups** - ASCII wireframes minimum
3. **ALWAYS specify exact values** - Colors (hex), sizes (px), spacing (rem)
4. **NEVER say "style as appropriate"** - Be explicit
5. **ALWAYS consider mobile responsiveness** in design

### Frontend-Specific Guardrails

1. **NEVER start without DESIGN_SPEC.md** - Request it if missing
2. **ALWAYS follow design exactly** - No creative deviations
3. **ALWAYS integrate with backend** - Use existing `src/api.ts`
4. **ALWAYS add TypeScript types** - No `any` types
5. **ALWAYS handle errors** - Loading, error, success states
6. **ALWAYS test before marking complete** - Verify API integration works

---

## 📁 File Conventions

### Design Deliverables

```
.agents/designs/
├── DESIGN_SPEC.md           # Current design specification
├── archive/
│   ├── login-page-design.md
│   ├── dashboard-design.md
│   └── ...
```

### Frontend Deliverables

```
frontend/src/
├── app/
│   ├── pages/               # Page components
│   ├── components/          # Reusable components
│   ├── context/             # React context
│   └── routes.tsx           # Route definitions
├── api.ts                   # API client (existing)
├── socket.ts                # Socket client (existing)
└── styles/
    └── index.css            # Global styles + design tokens
```

---

## ✅ Quality Checklists

### Design Approval Checklist

- [ ] Neobrutalism style applied (bold borders, vibrant colors, stark typography)
- [ ] All UI elements positioned and sized
- [ ] Color palette specified with hex codes
- [ ] Typography defined (font, size, weight, line-height)
- [ ] All interactive states described (hover, active, disabled)
- [ ] Mobile responsive behavior specified
- [ ] All components listed
- [ ] User flow described

### Frontend Completion Checklist

- [ ] All components from DESIGN_SPEC.md implemented
- [ ] Design matches mockup exactly
- [ ] TypeScript types defined (no `any`)
- [ ] API integration complete (using `src/api.ts`)
- [ ] Socket integration (if real-time features needed)
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Success states implemented
- [ ] Mobile responsive (Tailwind classes)
- [ ] No console errors or warnings
- [ ] Tested with backend

---

## 🔄 Handoff Protocol

### Design → Frontend Handoff

**Design Agent outputs:**
```markdown
# Design Specification: [Page Name]

## Overview
[Description]

## Color Palette
- Primary: #FF6B6B
- Secondary: #4ECDC4
...

## Typography
- Headings: Inter, 700, 2.5rem
- Body: Inter, 400, 1rem
...

## Layout
[ASCII wireframe or detailed description]

## Components
- Button (primary, secondary, outline)
- Input (text, email, password)
...

## States
- Hover: ...
- Active: ...
- Disabled: ...
...

## Responsive
- Mobile (< 768px): ...
- Tablet (768px - 1024px): ...
- Desktop (> 1024px): ...
```

**Frontend Agent acknowledges:**
```
✅ Received DESIGN_SPEC.md
✅ Understanding requirements
✅ Ready to implement

Starting implementation now...
```

---

## 🛠️ Tools & Technologies

### Design Agent Tools
- ASCII wireframing
- Color palette generation (neobrutalism style)
- Typography specification
- Component library reference

### Frontend Agent Tools
- React 18.3.1
- TypeScript 5.9.3
- Tailwind CSS 4.1.12
- Material UI 7.3.5 (base)
- Radix UI primitives
- LiveKit SDK
- Socket.IO Client
- Axios

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Design approval rate | 90%+ first iteration |
| Design-to-code fidelity | 95%+ match |
| API integration success | 100% endpoints working |
| Mobile responsiveness | 100% pages responsive |
| TypeScript strictness | 0 `any` types |
| Error handling | 100% user-facing errors handled |

---

## 🚀 Quick Start

**To start a new feature:**

1. User: "Create [feature name]"
2. System: Invoke Design Agent
3. Design Agent: Creates DESIGN_SPEC.md
4. User: Reviews and approves (or requests changes)
5. System: Invokes Frontend Agent
6. Frontend Agent: Implements and integrates
7. User: Tests and provides feedback

**Example:**
```
User: "Create the login page"

→ Design Agent creates .agents/designs/login-page-design.md
→ User: "Looks good, add a forgot password link"
→ Design Agent: Updates spec
→ User: "Approved"
→ Frontend Agent: Implements LoginPage.tsx
→ User: Tests login flow
```

---

## 📞 Escalation

**If blocked:**
1. Design Agent unsure about style → Ask user for reference
2. Frontend Agent can't match design → Propose alternative, wait for approval
3. API endpoint missing → Create stub, notify user
4. Backend integration fails → Debug, check backend, report issue

**Never:**
- Guess the design
- Skip approval steps
- Commit untested code
- Ignore type errors

---

## 📖 References

- [Neobrutalism Design Principles](https://v3.neobrutalism.dev/docs)
- [Multi-Agent Workflow Best Practices](https://www.vellum.ai/blog/agentic-workflows-emerging-architectures-and-design-patterns)
- [FRONTEND_IMPLEMENTATION_PLAN.md](./FRONTEND_IMPLEMENTATION_PLAN.md) - Complete page specifications
