# Endpoints & Styling Improvement Plan

**Date:** January 23, 2026

---

## PART 1: ALL ENDPOINTS AVAILABLE

### Authentication (2)
```
POST   /auth/login         → User login with Supabase
POST   /auth/logout        → User logout  
POST   /auth/signup        → User registration
GET    /auth/status        → Check auth configuration
```

### Core Trading (5)
```
POST   /tools/predict      → Generate stock predictions
POST   /tools/scan_all     → Scan and rank all symbols
POST   /tools/analyze      → Analyze with risk parameters
POST   /tools/train_rl     → Train RL model
POST   /tools/execute      → Execute trade
```

### Risk Management (2)
```
POST   /api/risk/assess    → Assess portfolio risk
POST   /api/risk/stop-loss → Set stop loss levels
```

### Data & Utilities (3)
```
POST   /tools/fetch_data   → Fetch batch historical data
POST   /tools/feedback     → Submit human feedback
POST   /api/ai/chat        → AI trading assistant chat
```

### System (2)
```
GET    /tools/health       → Health check
GET    /                   → API info & status
```

---

## PART 2: CURRENT CSS ISSUES TO FIX

### Issues Found:
1. ❌ **Inconsistent Spacing** - Padding/margin varies across components
2. ❌ **Color Scheme Misaligned** - Some components use old colors
3. ❌ **Typography Scaling** - Not fully responsive on all breakpoints
4. ❌ **Card Styling** - Borders/shadows inconsistent
5. ❌ **Button States** - Hover/active states missing
6. ❌ **Modal Styling** - Responsive issues on mobile
7. ❌ **Form Inputs** - Missing focus states
8. ❌ **Dark Mode** - Incomplete implementation

---

## PART 3: STYLING IMPROVEMENTS NEEDED

### High Priority
1. **Consistent Design System**
   - Standardize spacing (8px grid)
   - Unified color palette
   - Consistent border radius

2. **Component Polish**
   - Buttons: hover, active, disabled states
   - Forms: focus, error, success states
   - Cards: elevation, shadows
   - Modals: backdrop, animations

3. **Responsive Improvements**
   - Mobile-first approach
   - Better tablet layouts
   - Desktop optimizations

### Medium Priority
4. **Animations & Transitions**
   - Smooth page transitions
   - Loading states
   - Hover effects

5. **Dark Mode Complete**
   - All components support dark mode
   - Proper contrast ratios

6. **Accessibility**
   - ARIA labels
   - Focus indicators
   - Color contrast

---

## PART 4: WHAT NEEDS STYLING

### Frontend Components:
- [ ] LoginPage - needs gradient refinement
- [ ] SignUp - form styling
- [ ] Dashboard - card layouts
- [ ] Portfolio - table/card styling
- [ ] TrainModel - form styling
- [ ] Analytics - chart containers
- [ ] Navigation - hover states
- [ ] Buttons - consistent styling
- [ ] Forms - input styling
- [ ] Modals - styling

---

## NEXT ACTIONS

1. **Clarify styling priorities** - Which components need most work?
2. **Create CSS utility classes** - Standardize spacing/colors
3. **Update component styling** - Apply consistent design
4. **Test responsive design** - Verify on all breakpoints
5. **Add animations** - Enhance UX

---

**What styling improvements would you like to prioritize first?**
