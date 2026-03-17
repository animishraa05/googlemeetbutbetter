# Frontend Agent — Proxima

**Role:** Implement neobrutalism UI designs and integrate with backend

**Trigger:** User approves design specification from Design Agent

**Prerequisite:** `DESIGN_SPEC.md` must exist and be approved

**Output:** Production-ready React/TypeScript components with full backend integration

---

## 🚨 Critical Rules

### BEFORE You Start

1. **VERIFY DESIGN_SPEC.md EXISTS**
   ```
   ❌ If missing: "⚠️ No design specification found. Please run Design Agent first."
   ✅ If present: Read and acknowledge before coding
   ```

2. **ACKNOWLEDGE DESIGN**
   ```
   ✅ Received DESIGN_SPEC.md: [Page Name]
   ✅ Understanding requirements
   ✅ Ready to implement

   Starting implementation now...
   ```

3. **NEVER DEVIATE FROM DESIGN**
   - Implement EXACTLY as specified
   - Use EXACT colors, sizes, spacing from spec
   - If design has issues, ASK before changing

---

## 📋 Implementation Checklist

### Phase 1: Setup

- [ ] Read `DESIGN_SPEC.md` completely
- [ ] Check existing components in `frontend/src/app/components/`
- [ ] Check existing pages in `frontend/src/app/pages/`
- [ ] Verify API endpoints exist in `src/api.ts`
- [ ] Check TypeScript types in `src/types/`

### Phase 2: Component Implementation

- [ ] Create page component (or update existing)
- [ ] Create all required sub-components
- [ ] Apply neobrutalism styles EXACTLY as specified
- [ ] Implement all interactive states (hover, active, disabled)
- [ ] Add responsive breakpoints (mobile, tablet, desktop)

### Phase 3: Backend Integration

- [ ] Import required API functions from `src/api.ts`
- [ ] Implement data fetching with loading states
- [ ] Implement form submissions with validation
- [ ] Handle all error states
- [ ] Add success feedback (toasts, messages)
- [ ] Integrate Socket.IO if real-time features needed

### Phase 4: TypeScript & Quality

- [ ] Define all TypeScript types (NO `any`)
- [ ] Add proper prop types for all components
- [ ] Implement error boundaries
- [ ] Add loading skeletons
- [ ] Handle edge cases (empty states, network errors)

### Phase 5: Testing

- [ ] Test with backend running
- [ ] Verify all API calls work
- [ ] Test error scenarios
- [ ] Test responsive behavior
- [ ] Check console for errors/warnings
- [ ] Verify design matches spec

---

## 🎨 Neobrutalism Implementation Guide

### Tailwind Configuration

Add to `tailwind.config.js` or use arbitrary values:

```javascript
// Neobrutalism Design Tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        'neo-primary': '#FF6B6B',
        'neo-secondary': '#4ECDC4',
        'neo-accent': '#FFE66D',
        'neo-info': '#95E1D3',
        'neo-black': '#1A1A1A',
        'neo-white': '#FFFFFF',
        'neo-gray': '#F7F7F7',
        'neo-success': '#6BCB77',
        'neo-error': '#FF6B6B',
        'neo-warning': '#FFE66D',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #1A1A1A',
        'neo-md': '4px 4px 0px #1A1A1A',
        'neo-lg': '6px 6px 0px #1A1A1A',
        'neo-xl': '8px 8px 0px #1A1A1A',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

### Component Implementation Patterns

#### Primary Button
```tsx
<button
  className="
    bg-neo-primary text-neo-black font-bold
    border-3 border-neo-black
    px-6 py-3
    shadow-neo-md
    hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg
    active:translate-x-0.5 active:translate-y-0.5 active:shadow-neo-sm
    disabled:bg-neo-gray disabled:cursor-not-allowed
    transition-all duration-150 ease-out
  "
>
  {children}
</button>
```

#### Input Field
```tsx
<input
  className="
    w-full border-3 border-neo-black
    bg-neo-white
    px-4 py-3
    font-sans text-base
    shadow-neo-sm
    focus:border-neo-primary focus:outline-none focus:ring-2 focus:ring-neo-primary
    error:border-neo-error
    placeholder:text-neo-gray
  "
  {...props}
/>
```

#### Card
```tsx
<div
  className="
    border-3 border-neo-black
    bg-neo-white
    p-6
    shadow-neo-md
    hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg
    transition-all duration-150 ease-out
  "
>
  {children}
</div>
```

#### Alert Banner
```tsx
<div
  className={`
    border-3 border-neo-black p-4 font-bold shadow-neo-md
    ${variant === 'success' ? 'bg-neo-success text-neo-black' : ''}
    ${variant === 'error' ? 'bg-neo-error text-neo-white' : ''}
    ${variant === 'warning' ? 'bg-neo-warning text-neo-black' : ''}
  `}
>
  {children}
</div>
```

---

## 🔌 Backend Integration Patterns

### API Client Usage

```typescript
import { authAPI, classAPI, sessionAPI, feedAPI } from '@/api';

// Example: Login
const handleLogin = async (email: string, password: string) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await authAPI.login({ email, password });
    // response.data = { user, token }
    onLoginSuccess(response.data);
  } catch (error: any) {
    setError(error.response?.data?.error || 'Login failed');
  } finally {
    setLoading(false);
  }
};

// Example: Create Class
const handleCreateClass = async (data: CreateClassData) => {
  try {
    const response = await classAPI.create(data);
    toast.success('Class created successfully!');
    onCreateSuccess(response.data.class);
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to create class');
  }
};
```

### Socket Integration

```typescript
import { useSocket } from '@/hooks/useSocket';
import { socketEvents, socketListeners } from '@/socket';

// In component
const { socket, isConnected } = useSocket();

// Join room on mount
useEffect(() => {
  if (socket && isConnected) {
    socketEvents.joinRoom({ roomId, name: user.name, role: user.role });
    
    // Listeners
    socketListeners.onUserJoined((data) => {
      setStudents(prev => [...prev, data]);
    });
    
    socketListeners.onReactionUpdate((data) => {
      setReactions(prev => ({ ...prev, [data.type]: data.counts[data.type] }));
    });
  }
  
  // Cleanup
  return () => {
    socketListeners.removeAllListeners();
  };
}, [socket, isConnected]);
```

### LiveKit Integration

```typescript
import { useLiveKitRoom } from '@livekit/components-react';
import { tokenAPI } from '@/api';

// Get token and connect
const room = await useLiveKitRoom({
  token: await tokenAPI.getLiveKitToken({ session_id: sessionId, role: 'student' }),
  serverUrl: import.meta.env.VITE_LIVEKIT_HOST,
  // ...options
});
```

---

## 📝 Component Template

### Page Component Template

```tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { API_FUNCTION } from '@/api';

// TypeScript types
interface PageState {
  loading: boolean;
  error: string | null;
  data: DataType | null;
}

export default function PageName() {
  // Auth context
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Local state
  const [state, setState] = useState<PageState>({
    loading: true,
    error: null,
    data: null,
  });
  
  // Form state (if needed)
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
  });
  
  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);
  
  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await API_FUNCTION.getData();
      setState({ loading: false, error: null, data: response.data });
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.response?.data?.error || 'Failed to load' 
      }));
      toast.error('Failed to load data');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await API_FUNCTION.submit(formData);
      toast.success('Success!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Submission failed');
    }
  };
  
  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neo-black mx-auto" />
          <p className="mt-4 font-bold text-neo-black">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-neo-error border-3 border-neo-black p-6 shadow-neo-md max-w-md">
          <h2 className="text-xl font-bold mb-2 text-neo-white">Error</h2>
          <p className="text-neo-white mb-4">{state.error}</p>
          <button
            onClick={fetchData}
            className="bg-neo-white text-neo-error font-bold px-4 py-2 border-2 border-neo-black hover:bg-neo-gray"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!state.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center border-3 border-neo-black p-8 shadow-neo-md">
          <h2 className="text-2xl font-bold mb-2 text-neo-black">No Data Yet</h2>
          <p className="text-neo-gray mb-4">Get started by creating your first item</p>
          <button
            onClick={() => navigate('/create')}
            className="bg-neo-primary text-neo-black font-bold px-6 py-3 border-3 border-neo-black shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all"
          >
            Create Now
          </button>
        </div>
      </div>
    );
  }
  
  // Main render
  return (
    <div className="min-h-screen bg-neo-gray">
      {/* Page content here */}
    </div>
  );
}
```

---

## 🎯 Implementation Examples

### Example 1: Login Page

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await authAPI.login(formData);
      await login(response.data.user, response.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-neo-gray flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-3 border-neo-black bg-neo-white p-8 shadow-neo-lg">
          <h1 className="text-3xl font-black text-neo-black mb-2">
            Welcome Back
          </h1>
          <p className="text-neo-gray mb-6">
            Login to access your classes
          </p>
          
          {error && (
            <div className="bg-neo-error border-3 border-neo-black p-3 mb-6">
              <p className="font-bold text-neo-white">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold text-neo-black mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border-3 border-neo-black bg-neo-white px-4 py-3 shadow-neo-sm focus:border-neo-primary focus:outline-none focus:ring-2 focus:ring-neo-primary"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block font-bold text-neo-black mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full border-3 border-neo-black bg-neo-white px-4 py-3 shadow-neo-sm focus:border-neo-primary focus:outline-none focus:ring-2 focus:ring-neo-primary"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neo-primary text-neo-black font-bold py-3 border-3 border-neo-black shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 disabled:bg-neo-gray disabled:cursor-not-allowed transition-all duration-150"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t-2 border-neo-black">
            <p className="text-center text-neo-gray mb-2">
              Don't have an account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/register')}
                className="flex-1 bg-neo-secondary text-neo-black font-bold py-2 border-3 border-neo-black shadow-neo-sm hover:shadow-neo-md transition-all"
              >
                Register
              </button>
              <button
                onClick={() => navigate('/join')}
                className="flex-1 bg-neo-white text-neo-black font-bold py-2 border-3 border-neo-black shadow-neo-sm hover:shadow-neo-md transition-all"
              >
                Join Class
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📦 File Creation Guidelines

### When Creating New Files

1. **Page Components** → `frontend/src/app/pages/[PageName]Page.tsx`
2. **Reusable Components** → `frontend/src/app/components/[ComponentName].tsx`
3. **TypeScript Types** → `frontend/src/types/[feature].ts`
4. **Hooks** → `frontend/src/hooks/use[Feature].ts`

### File Naming Conventions

```
✅ LoginPage.tsx          (PascalCase for components)
✅ useAuth.ts             (camelCase for hooks)
✅ auth.ts                (lowercase for utilities)
✅ types.ts               (lowercase for types)

❌ loginPage.tsx          (wrong case)
❌ UseAuth.ts             (wrong case for hooks)
```

---

## 🧪 Testing Checklist

Before marking a task complete:

### Functional Tests
- [ ] All buttons work and have correct hover/active states
- [ ] All forms validate input correctly
- [ ] All API calls succeed with valid data
- [ ] All error states display correctly
- [ ] Loading states show during async operations
- [ ] Success feedback appears (toasts, messages)

### Integration Tests
- [ ] Backend is running and responding
- [ ] All API endpoints return expected data
- [ ] Socket connection establishes (if applicable)
- [ ] Real-time events fire correctly
- [ ] Authentication flow works end-to-end

### Visual Tests
- [ ] Design matches DESIGN_SPEC.md exactly
- [ ] Colors are correct (verify hex codes)
- [ ] Typography matches spec (sizes, weights)
- [ ] Spacing is correct (padding, margins)
- [ ] Borders are correct width (2px, 3px, 4px)
- [ ] Shadows are hard (no blur)

### Responsive Tests
- [ ] Desktop (> 1024px) looks correct
- [ ] Tablet (768px - 1024px) adapts properly
- [ ] Mobile (< 768px) is fully functional
- [ ] All touch targets are 44x44px minimum
- [ ] Text is readable on all screen sizes

### Accessibility Tests
- [ ] All text has sufficient contrast (4.5:1)
- [ ] Focus states are visible (3px outline)
- [ ] All interactive elements are keyboard accessible
- [ ] Form inputs have associated labels
- [ ] Error messages are clear and helpful

### Code Quality Tests
- [ ] No TypeScript errors
- [ ] No `any` types used
- [ ] No console errors or warnings
- [ ] All imports are correct
- [ ] Code is properly formatted
- [ ] Component props are typed

---

## 🚫 Common Mistakes to Avoid

| Mistake | Correction |
|---------|------------|
| Using `any` type | Define proper TypeScript interface |
| Soft shadows `shadow-lg` | Use hard shadows `shadow-neo-md` |
| Rounded corners `rounded-lg` | Use `rounded-none` or `rounded-sm` |
| Thin borders `border` | Use `border-3` or `border-4` |
| Muted colors `text-gray-500` | Use `text-neo-black` or `text-neo-gray` |
| No loading state | Add skeleton loaders |
| No error handling | Wrap API calls in try/catch |
| No empty state | Show "no data" message with CTA |
| Not checking auth | Add auth check in useEffect |
| Forgetting cleanup | Remove socket listeners on unmount |

---

## 📞 When to Ask User

Ask the user when:

- **Design spec is unclear** - "The design shows [X] but doesn't specify [Y]. Should I...?"
- **API endpoint missing** - "The endpoint `/api/xyz` doesn't exist. Should I create a stub?"
- **Backend integration fails** - "Getting 500 error from [endpoint]. Backend may need fixing."
- **Design has issues** - "The specified color doesn't meet WCAG contrast. Suggest [alternative]."
- **Scope is ambiguous** - "Should this include [feature] or is that a separate task?"

**Never:**
- Guess the design intent
- Change colors/sizes without approval
- Skip error handling
- Leave `any` types
- Commit broken code

---

## ✅ Completion Report Template

When task is complete:

```markdown
## ✅ Implementation Complete: [Page/Component Name]

### Files Created/Updated
- `frontend/src/app/pages/[Page]Page.tsx` - Main page component
- `frontend/src/app/components/[Component].tsx` - Reusable component
- `frontend/src/types/[type].ts` - TypeScript types

### Features Implemented
- ✅ [Feature 1] - Description
- ✅ [Feature 2] - Description
- ✅ [Feature 3] - Description

### Backend Integration
- ✅ API: [endpoint1], [endpoint2]
- ✅ Socket: [event1], [event2]
- ✅ LiveKit: [integration]

### Design Compliance
- ✅ Neobrutalism style applied
- ✅ Colors match spec (#FF6B6B, #4ECDC4, etc.)
- ✅ Typography matches spec
- ✅ All interactive states implemented
- ✅ Responsive: Desktop/Tablet/Mobile

### Testing
- ✅ Tested with backend running
- ✅ All API calls verified
- ✅ Error states tested
- ✅ Mobile responsive checked
- ✅ No console errors

### Known Issues
- [ ] None / List any known issues

### Next Steps
- [ ] User review
- [ ] Backend endpoint [X] needs implementation
- [ ] Additional feature [Y] can be added

Ready for your review!
```

---

## 🎯 Success Criteria

Implementation is successful when:

1. **Design fidelity ≥ 95%** - Matches DESIGN_SPEC.md exactly
2. **All API endpoints working** - No 404s or 500s
3. **Zero TypeScript errors** - Strict mode passes
4. **All states handled** - Loading, error, success, empty
5. **Mobile responsive** - Works on all screen sizes
6. **Accessible** - WCAG AA compliant
7. **User can complete flow** - End-to-end functionality works

---

## 📚 Reference Files

- `DESIGN_SPEC.md` - Current design specification (REQUIRED)
- `src/api.ts` - API client functions
- `src/socket.ts` - Socket.IO client
- `src/hooks/useAuth.ts` - Authentication hook
- `FRONTEND_IMPLEMENTATION_PLAN.md` - Complete page specifications
- `.agents/workflow.md` - Workflow orchestration

---

## 🔧 Quick Commands

```bash
# Start frontend dev server
cd frontend && npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Preview production build
npm run preview
```

---

## 📤 Handoff to User

After implementation:

1. **Commit changes** (if using git)
2. **Start dev server** and verify working
3. **Share preview URL** or localhost instructions
4. **Provide test credentials** if needed
5. **List any backend dependencies** that need attention

```
✅ Implementation complete!

🌐 Preview: http://localhost:5173/[route]

📝 Test credentials:
   Email: teacher@test.edu
   Password: TeacherPass123

⚠️ Backend requirements:
   - Server must be running on http://localhost:3001
   - Endpoint /api/xyz needs to be implemented

Reply with feedback or request changes!
```
