# ⚡ QUICK REFERENCE GUIDE - AI WORKER

**Use this guide to quickly reference key specifications while working.**

---

## 🎯 Task Queue (Priority Order)

### Phase 1: CRITICAL (START HERE)
1. `src/components/modals/FeedbackModal.tsx` → POST `/tools/feedback` - 2-3 hrs
2. `src/components/RiskAssessmentWidget.tsx` → POST `/api/risk/assess` - 3-4 hrs
3. Enhance `src/pages/RiskManagementPage.tsx` → POST `/api/risk/stop-loss` - 3-4 hrs
4. `src/components/modals/SymbolAnalysisModal.tsx` → POST `/tools/analyze` - 3-4 hrs

### Phase 2: HIGH VALUE
5. `src/pages/MarketScanPage.tsx` → POST `/tools/scan_all` - 4-6 hrs
6. Enhance `DashboardPage.tsx` → Enhanced `/tools/predict` - 2-3 hrs
7. Integrate `TrainModelPage.tsx` into nav → POST `/tools/train_rl` - 2-3 hrs

### Phase 3: FEATURES
8. `src/components/ProfitLossTracker.tsx` - 2 hrs
9. Enhance `src/components/Navbar.tsx` - 2-3 hrs
10. Enhance `DashboardPage.tsx` - 2 hrs

---

## 🎨 Theme Colors (Copy-Paste Ready)

### Dark Theme
```
bg-slate-950          → #0f172a (main bg)
bg-slate-800          → #1e293b (card bg)
bg-slate-700          → #334155 (hover)
border-slate-600/50   → #475569 (border)
text-slate-100        → #f1f5f9 (text)
text-blue-500         → #3b82f6 (accent)
```

### Space Theme
```
bg-[#0a0e27]                    → primary bg (deep blue)
bg-[#1a1f3a]                    → card bg (cosmic blue)
border-purple-600/40            → glowing border
text-purple-400                 → #a78bfa (text)
shadow-[0_0_20px_rgba(124,58,237,0.3)]   → glow effect
before:bg-gradient-to-br from-purple-500/10 to-cyan-500/10 → ambient
```

### Light Theme
```
bg-slate-50           → #f8fafc (main bg)
bg-white              → #ffffff (cards)
border-slate-200      → #e2e8f0 (border)
text-slate-900        → #1e293b (text)
text-cyan-500         → #0ea5e9 (accent)
```

---

## 🏗️ Component Template (Use This Structure)

```tsx
import React, { useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { stockAPI, TimeoutError } from '../services/api';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface ComponentProps {
  // Props
}

/**
 * ComponentName
 * Endpoint: POST /path/to/endpoint
 * Features: Feature list
 */
export const ComponentName: React.FC<ComponentProps> = ({ ...props }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Theme-aware styling
  const bgClass = isSpace 
    ? 'bg-[#1a1f3a] border border-purple-600/40 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
    : isLight
    ? 'bg-white border border-slate-200'
    : 'bg-slate-800 border border-slate-700/50';

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await stockAPI.methodName();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err instanceof TimeoutError 
        ? 'Request taking longer. Please wait...' 
        : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={`rounded-lg p-4 ${bgClass}`}>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

---

## 🔌 API Methods Quick Reference

### Stock API
```typescript
stockAPI.predict(symbols, horizon, riskProfile?, stopLossPct?, capitalRiskPct?, drawdownLimitPct?)
stockAPI.scanAll(symbols, horizon, minConfidence?, stopLossPct?, capitalRiskPct?)
stockAPI.analyze(symbol, horizons, stopLossPct?, capitalRiskPct?, drawdownLimitPct?)
stockAPI.feedback(symbol, predictedAction, userFeedback, actualReturn?)
stockAPI.trainRL(symbol, horizon, nEpisodes, forceRetrain)
stockAPI.fetchData(symbols, period, includeFeatures, refresh)
stockAPI.health()
stockAPI.getRateLimitStatus()
```

### Risk API
```typescript
riskAPI.setStopLoss(symbol, stopLossPrice, side, timeframe, source)
riskAPI.assessRisk(symbol, entryPrice, stopLossPrice, quantity, capitalAtRisk)
```

### AI API
```typescript
aiAPI.chat(message, context?)
```

---

## 📋 Form Validation Pattern

```tsx
// Example validation function
const validateForm = (formData: FormData): errors => {
  const errors = {};
  
  if (!formData.symbol) errors.symbol = 'Symbol required';
  if (!formData.price || formData.price <= 0) errors.price = 'Price must be positive';
  if (!formData.quantity || formData.quantity <= 0) errors.quantity = 'Qty must be positive';
  
  return errors;
};

// In JSX
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

const handleChange = (field: string, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  
  if (touched[field]) {
    // Real-time validation
    const newErrors = validateForm({ ...formData, [field]: value });
    setErrors(newErrors);
  }
};

// Show error
{touched.symbol && errors.symbol && (
  <div className="text-red-500 text-sm flex items-center gap-1">
    <AlertCircle size={16} /> {errors.symbol}
  </div>
)}
```

---

## 🎬 Loading & Success Pattern

```tsx
{loading && (
  <div className="flex items-center gap-2 text-blue-400">
    <Loader2 size={20} className="animate-spin" />
    <span>Processing...</span>
  </div>
)}

{success && (
  <div className="flex items-center gap-2 text-green-500">
    <CheckCircle2 size={20} />
    <span>Success!</span>
  </div>
)}

{error && (
  <div className="flex items-center gap-2 text-red-500">
    <AlertCircle size={20} />
    <span>{error}</span>
  </div>
)}
```

---

## 📱 Responsive Classes Cheat Sheet

```
Mobile (320px):  One column, full width, stack vertically
Tablet (768px):  Two columns, moderate spacing
Desktop (1024px): Full layout, side-by-side, max-width containers

Grid Pattern:
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

Flex Pattern:
flex flex-col md:flex-row gap-4

Text Pattern:
text-base md:text-lg lg:text-xl

Spacing Pattern:
p-2 md:p-4 lg:p-6
```

---

## 🧪 Pre-Submission Testing Checklist

Before marking component done:
- [ ] Loads without errors
- [ ] All props working
- [ ] Light theme looks good
- [ ] Dark theme looks good
- [ ] Space theme looks amazing (glows/gradients visible)
- [ ] Mobile view works (320px)
- [ ] Tablet view works (768px)
- [ ] Desktop view works (1024px)
- [ ] Form validation shows errors in real-time
- [ ] API call on submit shows loading state
- [ ] Success shows checkmark/message
- [ ] Error shows alert/message with retry option
- [ ] Buttons/inputs disable during loading
- [ ] Keyboard works (Tab, Enter, Escape)
- [ ] No console errors
- [ ] JSDoc comments present
- [ ] Matches existing component style

---

## 🚫 Common Mistakes to Avoid

❌ **DON'T:**
- Use hardcoded colors like `#ff0000` (use theme system)
- Use inline styles (use Tailwind)
- Skip error handling
- Forget loading states
- Test only one theme
- Test only one breakpoint
- Leave console.logs in production code
- Use `any` type in TypeScript
- Forget accessibility (ARIA labels)
- Nest ternary operators too deep

✅ **DO:**
- Use `useTheme()` hook
- Use Tailwind conditional classes
- Try-catch all API calls
- Show loading/error/success states
- Test all three themes
- Test mobile/tablet/desktop
- Clean console before submitting
- Use proper TypeScript types
- Add ARIA labels and semantic HTML
- Keep ternaries readable with variables

---

## 🌐 Endpoint Response Types Quick Lookup

### /tools/feedback
```json
{
  "success": true,
  "feedback_id": "fb_12345",
  "message": "Feedback recorded"
}
```

### /api/risk/assess
```json
{
  "symbol": "AAPL",
  "position_size": 10,
  "risk_amount": 25.00,
  "risk_percentage": 1.67,
  "reward_risk_ratio": 3.0
}
```

### /api/risk/stop-loss
```json
{
  "success": true,
  "symbol": "AAPL",
  "stop_loss_price": 147.50,
  "message": "Stop-loss set"
}
```

### /tools/analyze
```json
{
  "symbol": "AAPL",
  "analysis": {
    "intraday": {
      "action": "LONG",
      "confidence": 0.85,
      "entry_point": 150.23,
      "target": 153.45,
      "stop_loss": 148.50
    }
  }
}
```

### /tools/scan_all
```json
{
  "scan_results": [
    {
      "symbol": "AAPL",
      "action": "LONG",
      "confidence": 0.87,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🎨 Space Theme Example (Copy-Paste)

```tsx
// Space theme component
<div className={isSpace ? `
  bg-[#1a1f3a]
  border border-purple-600/40
  rounded-lg
  p-4
  shadow-[0_0_20px_rgba(124,58,237,0.2)]
  hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]
  transition-all duration-300
  relative
  before:absolute before:inset-0 before:bg-gradient-to-br 
  before:from-purple-500/5 before:to-cyan-500/5 before:rounded-lg
` : isLight ? 'bg-white border border-slate-200' : 'bg-slate-800 border border-slate-700'}>
  
  <h2 className={isSpace ? 'bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent font-bold' : ''}>
    Title
  </h2>
</div>
```

---

## 📊 Backend URLs

```
Main API: http://127.0.0.1:8001
Health: http://127.0.0.1:8001/tools/health
Docs: http://127.0.0.1:8001/docs
```

## 🌐 Frontend URLs

```
Main: http://localhost:8000
Dashboard: http://localhost:8000/dashboard
Portfolio: http://localhost:8000/portfolio
Alerts: http://localhost:8000/alerts
```

---

## ⏱️ Time Tracking

**Phase 1 Total: 12-16 hours**
- FeedbackModal: 2-3 hrs
- RiskAssessment: 3-4 hrs
- StopLossManager: 3-4 hrs
- AnalysisModal: 3-4 hrs
- Theme application: 2-3 hrs

**Phase 2 Total: 8-12 hours**
- MarketScanner: 4-6 hrs
- EnhancedPredict: 2-3 hrs
- RLTraining: 2-3 hrs

**Phase 3 Total: 6-8 hours**
- ProfitLoss: 2 hrs
- SearchBar: 2-3 hrs
- AddRemove: 2 hrs

**Total Timeline: 26-36 hours for complete overhaul**

---

**Start with Phase 1. Complete FeedbackModal first. Apply themes to everything. Test in all breakpoints. Follow the template pattern. Make it excellent.**

🚀 **LET'S BUILD SOMETHING GREAT**
