# How to Use the .agents Folder with AI Coding Assistants

Complete guide for using the agent system with Cursor, Claude Code, GitHub Copilot, or any AI coding assistant.

---

## 🎯 Quick Start (30 seconds)

### For ANY AI Coding Assistant:

**Step 1: Reference the agents folder**
```
@.agents/workflow.md
```

**Step 2: Make your request**
```
@.agents/workflow.md Create the login page for Proxima. Follow the design-first workflow.
```

**Step 3: AI will:**
1. Read workflow.md
2. Start Design Agent (create design spec)
3. Wait for your approval
4. Then Frontend Agent implements

---

## 📋 Platform-Specific Instructions

### Cursor IDE

#### Method 1: Chat with Context

1. Open Cursor Chat (`Cmd+L` or `Ctrl+L`)
2. Type:
   ```
   @.agents/AGENTS.md Read this agent system. I want to create the login page.
   Start with the Design Agent workflow.
   ```
3. Cursor will read the agent files and follow the workflow

#### Method 2: Composer Mode (Recommended)

1. Open Composer (`Cmd+I` or `Ctrl+I`)
2. Type:
   ```
   @.agents/workflow.md 
   Follow this workflow to create the login page.
   Start with Design Agent phase.
   ```
3. Composer will create all necessary files

#### Method 3: Inline Edit

1. Select code or empty space
2. `Cmd+K` or `Ctrl+K`
3. Type:
   ```
   Using @.agents/frontend.agent.md guidelines, implement this component
   ```

#### Pro Tips for Cursor:
- Use `.cursorrules` file (see below)
- Add agents folder to always-indexed paths
- Use `@` mentions to reference specific agent files

---

### Claude Code (CLI)

#### Basic Usage:

```bash
# Start a new feature
claude "@.agents/workflow.md Create the login page following the design-first workflow"

# Review design
claude "@.agents/designs/login-page-design.md Review this design. What do you think?"

# Implement after approval
claude "@.agents/frontend.agent.md Implement the login page from the approved design spec"
```

#### Interactive Session:

```bash
# Start claude in project directory
claude

# Then in conversation:
> @.agents/AGENTS.md I want to use this agent system
> Start with creating the login page design
```

#### Pro Tips for Claude Code:
- Use `@` to reference files
- Claude will read entire agent folder on first mention
- Keep conversation in same session for context

---

### GitHub Copilot Chat

#### In VS Code:

1. Open Copilot Chat panel
2. Type:
   ```
   #reference: .agents/workflow.md
   Follow this workflow to create the login page
   ```

3. Or use inline chat (`Cmd+I`):
   ```
   @.agents/frontend.agent.md Implement this following neobrutalism design
   ```

#### Pro Tips for Copilot:
- Use `#reference:` to add context files
- Copilot can't read entire folders, reference specific files
- Break tasks into smaller chunks

---

### Generic AI Assistant (Any LLM)

#### Copy-Paste Method:

1. Copy relevant agent file content
2. Paste into chat with your request:
   ```
   Here are my agent guidelines:
   
   [Paste content from .agents/design.agent.md]
   
   Now create a neobrutalism design for the login page following these rules.
   ```

3. For implementation:
   ```
   Here is the approved design:
   
   [Paste content from DESIGN_SPEC.md]
   
   Here are my implementation guidelines:
   
   [Paste content from .agents/frontend.agent.md]
   
   Implement this login page following these rules exactly.
   ```

---

## ⚙️ Configuration Files

### For Cursor: `.cursorrules`

Create `.cursorrules` in project root:

```markdown
# Proxima Project Rules

## Agent System
This project uses a design-first AI agent workflow.

ALWAYS:
1. Read @.agents/workflow.md before starting any new feature
2. Start with Design Agent to create DESIGN_SPEC.md
3. WAIT for user approval before implementing
4. Follow neobrutalism design principles
5. Integrate with existing backend API (src/api.ts)

## Design System
- Style: Neobrutalism (bold borders, vibrant colors, hard shadows)
- Reference: @.agents/design.agent.md for full specifications
- Colors: #FF6B6B (primary), #4ECDC4 (secondary), #1A1A1A (black)
- Borders: 3px minimum, solid black
- Shadows: Hard shadows only (no blur)

## Code Quality
- TypeScript: Strict mode, NO `any` types
- Backend: Always integrate with existing API
- Testing: Test with backend running
- States: Handle loading, error, success, empty

## File Structure
- Pages: frontend/src/app/pages/
- Components: frontend/src/app/components/
- Types: frontend/src/types/
- Hooks: frontend/src/hooks/

## When Uncertain
ASK the user before:
- Changing design without approval
- Skipping error handling
- Making assumptions about requirements
```

---

### For Claude Code: `.clinerules`

Create `.clinerules` in project root:

```markdown
# Proxima Project Rules

## CRITICAL: Agent Workflow
BEFORE writing any code:
1. READ: .agents/workflow.md
2. FOLLOW: Design-first approach (design → approval → code)
3. NEVER skip design phase

## Design System: Neobrutalism
- Bold borders (3px+)
- Vibrant colors (#FF6B6B, #4ECDC4, #FFE66D)
- Hard shadows (4px 4px 0px #000)
- Sharp corners (0-4px radius)
- Heavy typography (700-900 weight)

## Implementation Rules
- Always use existing API (frontend/src/api.ts)
- Always use Socket.IO client (frontend/src/socket.ts)
- TypeScript strict mode (no `any`)
- Handle all states (loading, error, success, empty)
- Test with backend running

## File Locations
- Design specs: .agents/designs/
- Pages: frontend/src/app/pages/
- Components: frontend/src/app/components/

## Ask Before
- Changing approved designs
- Creating new API endpoints
- Skipping tests
- Making assumptions
```

---

## 🚀 Complete Workflow Examples

### Example 1: Creating Login Page

**User:**
```
@.agents/workflow.md Create the login page for Proxima.
```

**AI (reads workflow, starts Design Agent):**
```
🎨 Starting Design Agent phase...

Creating neobrutalism design for login page...

📄 Created: .agents/designs/login-page-design.md

Design includes:
- Email + password form fields
- Primary login button (#FF6B6B)
- Links to Register and Join Class
- Error and loading states
- Responsive mobile-first design

Please review the design spec. Reply "approved" to proceed to implementation.
```

**User:**
```
approved
```

**AI (starts Frontend Agent):**
```
💻 Starting Frontend Agent phase...

Reading DESIGN_SPEC.md...
Checking existing components...
Verifying API endpoints...

Implementing LoginPage.tsx...
✅ Applied neobrutalism styles
✅ Integrated authAPI.login()
✅ Added loading/error states
✅ Made responsive

📄 Created: frontend/src/app/pages/LoginPage.tsx

Test at: http://localhost:5173/
Backend required: http://localhost:3001
```

---

### Example 2: Creating Dashboard

**User:**
```
@.agents/design.agent.md Create a neobrutalism design for the teacher dashboard showing all their classes.
```

**AI:**
```
🎨 Creating dashboard design...

[Creates DESIGN_SPEC.md with:
- Grid of class cards
- "Create Class" button
- Live session indicators
- Neobrutalism styling]

📄 Design complete: .agents/designs/dashboard-design.md

Review and reply "approved" to implement.
```

**User:**
```
Looks good, but make the Create Class button more prominent
```

**AI:**
```
✅ Updated design with larger, more prominent Create Class button
✅ Changed to primary color (#FF6B6B) with XL shadow

Updated: .agents/designs/dashboard-design.md

Ready for approval.
```

**User:**
```
approved
```

**AI:**
```
💻 Implementing DashboardPage.tsx...

[Creates full implementation]

✅ Complete! Test at http://localhost:5173/dashboard
```

---

### Example 3: Full Feature (Class Feed)

**User:**
```
@.agents/workflow.md Build the complete class feed page with posts, file uploads, and live session integration.
```

**AI:**
```
🎨 Starting Design Agent...

This is a complex feature. I'll create designs for:
1. Main feed page layout
2. Create post modal
3. Feed item components (announcement, file, session recap)
4. Live session banner

📄 Created: .agents/designs/class-feed-design.md

Please review all sections. Reply "approved" when ready.
```

**User:**
```
approved
```

**AI:**
```
💻 Starting Frontend Agent...

Creating components:
- ClassFeedPage.tsx (main page)
- FeedItem.tsx (reusable component)
- CreatePost.tsx (modal)
- FileUpload.tsx (drag & drop)
- SessionBanner.tsx (live indicator)

Integrating APIs:
- feedAPI.getFeed()
- feedAPI.createPost()
- uploadAPI.uploadFile()
- sessionAPI.start()

📄 All files created!
✅ Test with backend running
```

---

## 🎯 Best Practices

### DO:

✅ Always reference `.agents/workflow.md` for new features
✅ Let Design Agent create spec FIRST
✅ Wait for user approval before coding
✅ Follow neobrutalism design exactly
✅ Use existing API functions
✅ Test with backend running
✅ Handle all states (loading, error, success, empty)

### DON'T:

❌ Skip design phase
❌ Start coding without DESIGN_SPEC.md
❌ Change design without approval
❌ Use `any` types in TypeScript
❌ Create new API calls (use existing)
❌ Forget error handling
❌ Commit untested code

---

## 🔧 Troubleshooting

### AI Not Following Workflow?

**Try:**
```
Stop. Read @.agents/workflow.md first.
We use design-first workflow: design → approval → code.
Start over with Design Agent phase.
```

### AI Skipping Design?

**Try:**
```
You skipped the design phase.
Please create DESIGN_SPEC.md first following @.agents/design.agent.md
Then wait for my approval before implementing.
```

### AI Not Using Neobrutalism?

**Try:**
```
This doesn't match neobrutalism style.
Review @.agents/design.agent.md neobrutalism section.
Use: bold borders (3px), vibrant colors, hard shadows, heavy typography.
```

### AI Not Integrating Backend?

**Try:**
```
This needs backend integration.
Use existing API functions from frontend/src/api.ts
Test with backend running on http://localhost:3001
```

---

## 📁 Complete File Reference

When starting, tell AI to read these files:

```
Required Reading:
1. @.agents/workflow.md - Process overview
2. @.agents/design.agent.md - Design rules
3. @.agents/frontend.agent.md - Implementation rules
4. @.agents/QUICK_REFERENCE.md - Cheat sheet

Backend Context:
5. @server/src/routes/ - All API endpoints
6. @frontend/src/api.ts - API client functions
7. @frontend/src/socket.ts - Socket.IO client

Frontend Context:
8. @frontend/src/app/App.tsx - App structure
9. @frontend/src/app/routes.tsx - Route definitions
10. @FRONTEND_IMPLEMENTATION_PLAN.md - Page specs
```

---

## 🎓 Advanced Usage

### Multi-Step Features

For complex features, break into steps:

```
Step 1: @.agents/workflow.md Design the class feed page
[Get approval]
Step 2: @.agents/frontend.agent.md Implement the feed page
[Test and verify]
Step 3: @.agents/workflow.md Now add file upload modal
[Get approval]
Step 4: @.agents/frontend.agent.md Implement file upload
```

### Design Iterations

```
User: "Make the buttons bigger"
AI: "✅ Updated button specs in DESIGN_SPEC.md"
User: "Now change the color to blue"
AI: "⚠️ Blue doesn't match neobrutalism palette. Suggest #4ECDC4 (teal)?"
User: "Fine, use teal"
AI: "✅ Updated. Ready for approval."
```

### Context Management

For long conversations, periodically re-reference:

```
@.agents/workflow.md Continuing from where we left off.
Next step: Implement the approved design.
```

---

## 📊 Success Checklist

Before marking task complete, verify:

```
Design Phase:
☐ DESIGN_SPEC.md created
☐ Neobrutalism style applied
☐ All states defined
☐ Responsive behavior specified
☐ User approved design

Implementation Phase:
☐ Design followed exactly
☐ TypeScript types defined (no any)
☐ Backend API integrated
☐ All states handled
☐ Tested with backend
☐ No console errors
☐ Mobile responsive
```

---

## 🚀 Quick Commands

### Start New Feature:
```
@.agents/workflow.md Create [feature name]
```

### Review Design:
```
@.agents/designs/[feature]-design.md Review this design
```

### Approve & Continue:
```
approved - proceed to implementation
```

### Request Changes:
```
Change [X] to [Y] because [reason]
```

### Test Integration:
```
Test with backend running. Verify all API calls work.
```

---

**Remember:** The agent system exists to ensure quality. Follow the workflow, and you'll get consistent, professional results every time. 🎯
