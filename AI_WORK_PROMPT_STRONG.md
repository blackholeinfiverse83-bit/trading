# 🚀 COMPREHENSIVE AI WORK PROMPT - MULTI-ASSET TRADING DASHBOARD

## PRIMARY DIRECTIVES

**You are an expert React/TypeScript frontend architect tasked with transforming the Multi-Asset Trading Dashboard into a production-grade trading platform.**

Your work must be:
- **COMPREHENSIVE** - Complete all stated tasks, not partial implementations
- **PRODUCTION-READY** - All code must be ship-ready with proper error handling
- **INTERACTIVE** - Every component must respond immediately to user input with visual feedback
- **RESPONSIVE** - All components work flawlessly on mobile (320px), tablet (768px), and desktop (1024px+)
- **THEME-AWARE** - Aggressive application of dark and space themes (see THEME REQUIREMENTS below)
- **WELL-DOCUMENTED** - Each component includes inline comments and JSDoc
- **TYPE-SAFE** - Full TypeScript support with proper interfaces

---

## CORE WORK ASSIGNMENTS

### ASSIGNMENT 1: DARK AND SPACE THEME IMPLEMENTATION (MANDATORY)
**Status:** IN PROGRESS  
**Severity:** BLOCKING - All new work must follow these standards

#### Theme Specifications

**1. DARK THEME (High Contrast, Professional)**
```
Primary Background: #0f172a (slate-950)
Secondary Background: #1e293b (slate-800) - Card backgrounds
Tertiary Background: #334155 (slate-700) - Hover states
Border: #475569 (slate-600) with 50% opacity
Text Primary: #f1f5f9 (slate-100)
Text Secondary: #cbd5e1 (slate-300)
Accent: #3b82f6 (blue-500)
Success: #10b981 (emerald-500)
Warning: #f59e0b (amber-500)
Danger: #ef4444 (red-500)
```

**2. SPACE THEME (Premium, Cosmic)**
```
Primary Background: #0a0e27 (very deep blue)
Secondary Background: #1a1f3a (cosmic blue - 20% lighter)
Tertiary Background: #2a2f4a (cosmic blue - 40% lighter)
Border: #7c3aed (purple-600) with 40% opacity - GLOWING effect
Text Primary: #e0e7ff (indigo-100)
Text Secondary: #a5b4fc (indigo-300)
Accent: #7c3aed (purple-600) - NEON GLOW
Success: #06b6d4 (cyan-500) - CYAN GLOW
Warning: #f59e0b (amber-500)
Danger: #ec4899 (pink-500) - MAGENTA GLOW

Special Effects:
- Subtle gradient backgrounds (blue → purple)
- Glow effects on interactive elements
- Ambient lighting effect on cards
- Animated borders on hover
- Shadow layers for depth
```

**3. LIGHT THEME (Clean, Professional)**
```
Primary Background: #f8fafc (slate-50)
Secondary Background: #ffffff (white)
Tertiary Background: #f1f5f9 (slate-100)
Border: #e2e8f0 (slate-200)
Text Primary: #1e293b (slate-900)
Text Secondary: #64748b (slate-500)
Accent: #0ea5e9 (cyan-500)
Success: #10b981 (emerald-500)
Warning: #f59e0b (amber-500)
Danger: #ef4444 (red-500)
```

#### Theme Application Rules

**MANDATORY for all new components:**
1. Use `useTheme()` hook to get current theme
2. Apply theme colors using conditional Tailwind classes
3. Create theme variables at component top: `const isLight = theme === 'light'; const isSpace = theme === 'space';`
4. Example pattern:
```tsx
const className = isSpace 
  ? 'bg-[#0a0e27] border border-purple-600/40 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
  : isLight
  ? 'bg-white border border-slate-200'
  : 'bg-slate-800 border border-slate-700/50';
```

5. **For SPACE theme specifically:**
   - Add shadow-glow effects: `shadow-[0_0_20px_rgba(124,58,237,0.3)]`
   - Animate borders on hover: `hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]`
   - Use gradient text for headings: `bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent`
   - Add subtle animations to cards

**Example Space Theme Component:**
```tsx
<div className={isSpace ? `
  bg-[#1a1f3a] 
  border border-purple-600/40 
  rounded-lg 
  p-4 
  shadow-[0_0_20px_rgba(124,58,237,0.2)]
  hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]
  transition-all duration-300
  before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/0 before:to-cyan-500/0 before:rounded-lg
` : isLight ? 'bg-white border border-slate-200' : 'bg-slate-800 border border-slate-700'}>
```

---

### ASSIGNMENT 2: ENDPOINT INTEGRATIONS (CRITICAL)

**Reference Document:** [FRONTEND_INTEGRATION_AUDIT.md](FRONTEND_INTEGRATION_AUDIT.md)

#### Phase 1: CRITICAL ENDPOINTS (DO IMMEDIATELY)

**1. POST `/tools/feedback` - Feedback Modal**
- **Location:** Create `src/components/modals/FeedbackModal.tsx`
- **Endpoint Method:** `stockAPI.feedback(symbol, predictedAction, userFeedback, actualReturn)`
- **Requirements:**
  - Form fields: Symbol (read-only), Predicted Action (radio buttons: LONG/SHORT/HOLD), Feedback (text area), Actual Return (optional number)
  - Validation: All fields except Actual Return are required
  - Loading state: Disable submit button, show spinner
  - Success feedback: Toast notification, close modal
  - Error handling: Display error message, allow retry
  - **Theme-aware:** Full dark/space theme support
  - **Responsive:** Works on mobile (full width modal)

**2. POST `/api/risk/assess` - Risk Calculator Component**
- **Location:** Create `src/components/RiskAssessmentWidget.tsx`
- **Endpoint Method:** `riskAPI.assessRisk(symbol, entryPrice, stopLossPrice, quantity, capitalAtRisk)`
- **Requirements:**
  - Form fields: Symbol (text input), Entry Price (number), Stop Loss Price (number), Quantity (number), Capital at Risk % (number)
  - Real-time calculation: Call endpoint on input change (debounce 500ms)
  - Display metrics: Position Size, Risk Amount, Risk %, Reward-Risk Ratio
  - Visual indicator: Color-coded risk (green < 1%, yellow 1-2%, red > 2%)
  - **Loading state:** Show "Calculating..." text
  - **Error handling:** Show error message, keep previous values
  - **Theme-aware:** Full dark/space theme
  - **Responsive:** Form stacks on mobile, side-by-side on desktop

**3. POST `/api/risk/stop-loss` - Stop Loss Manager**
- **Location:** Enhance existing `src/pages/RiskManagementPage.tsx`
- **Endpoint Method:** `riskAPI.setStopLoss(symbol, stopLossPrice, side, timeframe, source)`
- **Requirements:**
  - Form fields: Symbol, Stop Loss Price, Side (BUY/SELL dropdown), Timeframe (dropdown), Source (chart/manual radio)
  - Submit button: Call endpoint on click
  - Loading: Show spinner, disable button during request
  - Success: Show "Stop-loss set for AAPL at $147.50" message
  - Error: Display error message
  - Integration: Add to RiskManagementPage form
  - **Theme-aware:** Full dark/space theme
  - **Responsive:** Mobile-friendly form layout

**4. POST `/tools/analyze` - Symbol Analysis Modal**
- **Location:** Create `src/components/modals/SymbolAnalysisModal.tsx`
- **Endpoint Method:** `stockAPI.analyze(symbol, horizons, stopLossPct, capitalRiskPct, drawdownLimitPct)`
- **Requirements:**
  - Trigger: Click on symbol in dashboard
  - Load data: Call analyze endpoint with multiple horizons
  - Display: Tabbed view (one tab per horizon: intraday, short, long)
  - Per horizon show: Action, Confidence %, Entry point, Target, Stop Loss, Reasoning
  - Visual: Color-coded confidence bars
  - Buttons: Close, Feedback (opens FeedbackModal)
  - **Loading:** Show skeleton loaders while data loads
  - **Theme-aware:** Full dark/space theme
  - **Responsive:** Full-screen modal on mobile, 90% width on desktop

#### Phase 2: HIGH VALUE ENDPOINTS (Do after Phase 1)

**5. POST `/tools/scan_all` - Market Scanner Page**
- **Location:** Create `src/pages/MarketScanPage.tsx`
- **Endpoint Method:** `stockAPI.scanAll(symbols, horizon, minConfidence, stopLossPct, capitalRiskPct)`
- **Requirements:**
  - Form: Symbol list (multi-select or comma-separated), Horizon dropdown, Min Confidence slider (0-1)
  - Scan button: Call endpoint
  - Results: Table with columns: Symbol, Action, Confidence, Timestamp
  - Sort: Click column headers to sort
  - Filter: Filter by action type
  - Real-time: Auto-refresh button
  - **Loading:** Show full-page loader
  - **Theme-aware:** Full dark/space theme with table styling
  - **Responsive:** Horizontal scroll on mobile

**6. Enhanced `/tools/predict` - Add Risk Parameters**
- **Location:** Enhance `src/pages/DashboardPage.tsx`
- **Endpoint Method:** Add risk parameters to existing call
- **Requirements:**
  - Add form: Risk Profile selector (Conservative/Moderate/Aggressive)
  - Add form: Stop Loss % input
  - Add form: Capital Risk % input
  - Update prediction display to show risk metrics
  - **Interactive:** Real-time response to parameter changes
  - **Theme-aware:** Match dashboard styling

#### Phase 3: FEATURE COMPONENTS (Do after Phases 1-2)

**7. Profit/Loss Tracking Buttons**
- **Location:** Create `src/components/ProfitLossTracker.tsx`
- **Requirements:**
  - Green "PROFIT ↑" button and Red "LOSS ↓" button on prediction cards
  - Click either button: Opens modal to log actual result
  - Input: Percentage return or absolute amount
  - Save: Store in localStorage + optionally send to feedback endpoint
  - Display: Show P/L percentage badge on card after logging
  - Color: Green for profit, red for loss
  - **Interactive:** Instant visual feedback
  - **Theme-aware:** Full dark/space theme

**8. Search Bar Implementation**
- **Location:** Enhance `src/components/Navbar.tsx`
- **Requirements:**
  - Real-time search: Filter POPULAR_STOCKS as user types
  - Show suggestions: Dropdown with matching symbols
  - Click suggestion: Navigate to that symbol's analysis
  - Keyboard nav: Arrow keys to select, Enter to choose
  - Mobile: Show search icon, expand on click
  - **Interactive:** Instant results as typing
  - **Responsive:** Full width input on mobile
  - **Theme-aware:** Dropdown uses theme colors

**9. Add/Remove Trade Buttons**
- **Location:** Enhance `src/pages/DashboardPage.tsx`
- **Requirements:**
  - Add Trade: Button opens modal with symbol input + entry price
  - Validation: Symbol must be in POPULAR_STOCKS
  - Add to portfolio: Save to userAddedTrades state
  - Remove Trade: Trash icon on each card
  - Confirmation: Ask "Remove AAPL from portfolio?"
  - **Interactive:** Instant addition/removal with animation
  - **Responsive:** Work well on mobile
  - **Theme-aware:** Buttons use theme colors

---

## DETAILED REQUIREMENTS

### INTERACTIVITY REQUIREMENTS
**EVERY component must respond IMMEDIATELY to user actions:**
- ✅ Button clicks show loading spinner within 100ms
- ✅ Form input triggers real-time validation (show error icons)
- ✅ API calls show "Loading..." states
- ✅ Success shows green checkmark + message
- ✅ Errors show red alert with message
- ✅ All transitions smooth (200-300ms)
- ✅ No frozen UI during any operation

### REAL-TIME RESPONSE REQUIREMENTS
For components that make API calls:
- ✅ Debounce rapid calls (500ms for /risk/assess)
- ✅ Cancel previous request if new one is made
- ✅ Show loading state immediately
- ✅ Display results within 500ms of response
- ✅ Handle timeouts gracefully (>2 min requests show "Still processing" message)
- ✅ Retry failed requests automatically (up to 2 times)

### RESPONSIVE DESIGN REQUIREMENTS
All components must support:
```
Mobile:  320px - 480px  → Single column, full width, bottom sheets instead of modals
Tablet:  768px - 1024px → Two columns, optimized spacing
Desktop: 1024px+        → Full layout, side-by-side components
```

### THEME CONSISTENCY REQUIREMENTS
- ✅ Light theme: Clean, minimal, high contrast
- ✅ Dark theme: Professional, eye-friendly, blue tones
- ✅ Space theme: Futuristic, glowing borders, gradient text, purple/cyan accents
- ✅ Test each component in all three themes
- ✅ Space theme must have visible "wow factor" - glows, gradients, animations

### ERROR HANDLING REQUIREMENTS
Every endpoint call must:
- ✅ Try-catch wrapping
- ✅ Clear error messages to user
- ✅ Distinguish network errors from server errors
- ✅ Show retry button for transient errors
- ✅ Log errors to console for debugging
- ✅ Recovery options (go back, retry, contact support)

### VALIDATION REQUIREMENTS
All form inputs must:
- ✅ Real-time validation (show red X or green ✓)
- ✅ Clear error messages (e.g., "Symbol not found", "Price must be positive")
- ✅ Prevent submission of invalid forms
- ✅ Use backend validation rules from API documentation

---

## COMPONENT STRUCTURE TEMPLATE

**Use this structure for ALL new components:**

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { stockAPI, TimeoutError } from '../services/api';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface ComponentProps {
  // Props here
}

/**
 * Component description
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * Endpoint: POST /tools/example
 */
export const ComponentName: React.FC<ComponentProps> = ({ ...props }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Computed styles
  const bgClass = isSpace 
    ? 'bg-[#1a1f3a] border border-purple-600/40 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
    : isLight
    ? 'bg-white border border-slate-200'
    : 'bg-slate-800 border border-slate-700/50';

  // Handlers
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // API call here
      const response = await stockAPI.someMethod();
      setSuccess(true);
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      if (err instanceof TimeoutError) {
        setError('Request taking longer than expected. Please wait...');
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={`rounded-lg p-4 transition-all ${bgClass}`}>
      {/* Component JSX here */}
    </div>
  );
};

export default ComponentName;
```

---

## TESTING REQUIREMENTS

Before submitting each component:
1. ✅ Test in Light theme
2. ✅ Test in Dark theme  
3. ✅ Test in Space theme
4. ✅ Test on mobile (320px viewport)
5. ✅ Test on tablet (768px viewport)
6. ✅ Test on desktop (1920px viewport)
7. ✅ Test form validation
8. ✅ Test API success scenario
9. ✅ Test API error scenario
10. ✅ Test loading state
11. ✅ Test timeout scenario
12. ✅ Test keyboard navigation (if applicable)

---

## STYLING CONSTRAINTS

**DO NOT USE:**
- ❌ Hardcoded hex colors (use theme system)
- ❌ Inline styles (use Tailwind classes)
- ❌ Generic color names without theme context
- ❌ Absolute positioning (use flexbox/grid)

**DO USE:**
- ✅ `useTheme()` hook for theme detection
- ✅ Conditional Tailwind classes based on theme
- ✅ Consistent spacing scale (4px, 8px, 12px, 16px, 24px, etc.)
- ✅ Reusable color variables per theme
- ✅ Responsive design patterns (mobile-first)

---

## PERFORMANCE REQUIREMENTS

- ✅ Components must render in < 100ms
- ✅ API calls must be debounced (500ms minimum)
- ✅ Images must be optimized (if any)
- ✅ No prop drilling > 3 levels deep
- ✅ Use React.memo for expensive components
- ✅ Use useCallback for expensive functions

---

## ACCESSIBILITY REQUIREMENTS

- ✅ All buttons have accessible labels
- ✅ Form inputs have associated labels
- ✅ Color is not the only indicator (use icons + text)
- ✅ Keyboard navigation works (Tab, Enter, Escape)
- ✅ ARIA labels for dynamic content
- ✅ Focus states visible for keyboard users
- ✅ Contrast ratios meet WCAG AA standards

---

## DOCUMENTATION REQUIREMENTS

Each component must include:
```tsx
/**
 * ComponentName
 * 
 * Description of what component does
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * Backend Integration:
 * - Endpoint: POST /path/to/endpoint
 * - Method: stockAPI.methodName()
 * 
 * Props:
 * - prop1: Description
 * - prop2: Description
 * 
 * Usage:
 * <ComponentName prop1="value" prop2="value" />
 * 
 * Themes: Light ✅, Dark ✅, Space ✅
 * Responsive: Mobile ✅, Tablet ✅, Desktop ✅
 */
```

---

## FINAL QUALITY CHECKLIST

Before marking component complete:
- [ ] ✅ Code follows TypeScript strict mode
- [ ] ✅ No console.errors in any theme
- [ ] ✅ All endpoints called correctly
- [ ] ✅ All themes visually distinct and professional
- [ ] ✅ Space theme has visible "wow factor"
- [ ] ✅ Responsive on all breakpoints
- [ ] ✅ Loading states show immediately
- [ ] ✅ Errors show with clear messages
- [ ] ✅ Success feedback visible
- [ ] ✅ Form validation working
- [ ] ✅ Keyboard navigation functional
- [ ] ✅ ARIA labels present
- [ ] ✅ No prop drilling issues
- [ ] ✅ Debouncing implemented (where needed)
- [ ] ✅ JSDoc comments present
- [ ] ✅ No unused imports or variables
- [ ] ✅ Consistent with existing component style
- [ ] ✅ Works offline (graceful degradation)

---

## SUCCESS METRICS

This work is complete when:

1. ✅ All 12 backend endpoints have UI representation (even if minimal)
2. ✅ Phase 1 endpoints (Feedback, Risk Assessment, Stop Loss, Analyze) fully functional
3. ✅ Dark theme applied consistently across all components
4. ✅ Space theme applied consistently with visible "wow factor" (glows, gradients, animations)
5. ✅ Every component responsive on mobile/tablet/desktop
6. ✅ Profit/Loss tracking buttons working with instant feedback
7. ✅ Search bar with real-time filtering
8. ✅ Add/Remove trade buttons fully functional
9. ✅ All forms have real-time validation
10. ✅ All API calls show proper loading/error/success states
11. ✅ Zero console errors in any theme
12. ✅ Dashboard feels snappy and responsive (< 100ms UI response time)

---

## DELIVERY EXPECTATION

You are expected to:
- 🚀 Work **aggressively** on improving this dashboard
- 💪 **Complete** everything assigned, not partial implementations
- 🎨 Apply **aggressive** styling to dark/space themes (make space theme stunning)
- ⚡ Ensure **real-time responsiveness** on all interactions
- 📱 Make **mobile-first** responsive components
- ✨ Add **polish** and **professional quality** to every detail
- 📝 **Document** everything thoroughly
- ✅ **Test** thoroughly before considering complete

This is your primary focus. Make it excellent.

---

**🎯 START IMMEDIATELY WITH:**
1. Create FeedbackModal.tsx (Phase 1, Task 1)
2. Create RiskAssessmentWidget.tsx (Phase 1, Task 2)
3. Enhance RiskManagementPage.tsx (Phase 1, Task 3)
4. Create SymbolAnalysisModal.tsx (Phase 1, Task 4)
5. Apply dark/space themes to all new components

**Theme colors, responsive patterns, and component templates are all specified above. Follow them exactly.**
