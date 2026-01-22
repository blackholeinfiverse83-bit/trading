# Responsive Design - Quick Reference Card

## 🎯 Device Breakpoints

```
MOBILE        │ TABLET        │ DESKTOP       │ ULTRA-WIDE
≤ 767px       │ 768-1199px    │ ≥ 1200px      │ ≥ 2560px
──────────────┼───────────────┼───────────────┼──────────
1 column      │ 2 columns     │ 3-4 columns   │ 4 columns
Drawer       │ Icon Sidebar  │ Full Sidebar  │ Full Sidebar
44px buttons  │ 44px buttons  │ Hover enabled │ Enhanced
No scroll     │ Container scroll only          │ No scroll
```

---

## 📱 Tailwind Breakpoint Modifiers

```
sm:   640px     md:   768px     lg:  1024px    xl:  1280px
─────────────────────────────────────────────────────────────
     TABLET        TABLET        DESKTOP      DESKTOP
        │           START
        │
   USE: md:         USE: lg:      USE: xl:
```

---

## ✅ Quick Implementation Checklist

When adding new components:

```
☐ Use grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for grids
☐ Set min-h-[44px] min-w-[44px] on buttons/inputs
☐ Use px-3 md:px-6 lg:px-8 for responsive padding
☐ Hide non-critical: hidden md:block or hidden lg:block
☐ Avoid fixed widths (use max-w-[size] instead)
☐ Remove hover: from mobile (use md:hover: instead)
☐ Never fixed positioning (use md:fixed or lg:static)
☐ Test: 375px (mobile), 768px (tablet), 1440px (desktop)
```

---

## 🎨 Common Patterns

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
  {/* 1 col mobile, 2 tablet, 3 desktop */}
</div>
```

### Responsive Padding
```tsx
<div className="px-3 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
  {/* Scales: 12px → 24px → 32px */}
</div>
```

### Responsive Text
```tsx
<h1 className="text-xl md:text-2xl lg:text-3xl leading-tight md:leading-relaxed">
  {/* Scales: 20px → 24px → 30px */}
</h1>
```

### Touch-Safe Button
```tsx
<button className="h-11 w-11 md:h-10 md:w-10 p-2 rounded-lg">
  {/* 44x44px tap area on all devices */}
</button>
```

### Hide on Mobile, Show Elsewhere
```tsx
<div className="hidden md:block">
  {/* Visible on tablet and desktop only */}
</div>
```

---

## 🚫 Anti-Patterns (AVOID)

```
❌ style={{ width: '500px' }}          → Use max-w-[500px] md:w-full
❌ className="hover:bg-blue-500"       → Use md:hover:bg-blue-500
❌ <div className="w-1/3">             → Use grid or flex instead
❌ flex-col on desktop, row on mobile  → Reverse: flex-row md:flex-col
❌ Fixed positioning for drawer        → Use md:static or lg:static
❌ <table> on mobile as-is             → Convert rows to cards with @media
```

---

## 📐 Spacing Reference

| Purpose | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Section Padding** | px-3 py-4 | px-6 py-6 | px-8 py-8 |
| **Card Gap** | gap-2 | gap-3 | gap-4 |
| **Button Height** | h-11 | h-11 | h-10 |
| **Border Radius** | rounded-lg | rounded-lg | rounded-xl |

---

## 🔍 Testing Commands

### Resize Browser to Test
```
Mobile:     375px width  (iPhone 12)
Tablet:     768px width  (iPad)
Desktop:    1440px width (Monitor)
Ultra-Wide: 2560px width (4K)
```

### DevTools Mobile Emulation
1. Open DevTools (F12)
2. Click Device Toolbar (Ctrl+Shift+M)
3. Select device or enter custom width
4. Check layout for each breakpoint

### No Horizontal Scroll Test
```
1. Open DevTools Console
2. Run: document.documentElement.scrollWidth 
3. Should equal window.innerWidth at all breakpoints
4. If scrollWidth > innerWidth → horizontal scroll exists
```

---

## 🎯 CSS Variables Available

```css
/* Touch Targets */
--touch-min:   44px
--touch-md:    48px
--touch-lg:    52px

/* Spacing Scale */
--sp-xs:  0.25rem   (4px)
--sp-sm:  0.5rem    (8px)
--sp-md:  1rem      (16px)
--sp-lg:  1.5rem    (24px)
--sp-xl:  2rem      (32px)

/* Typography */
--fs-base: 1rem
--lh-tight: 1.3     (mobile)
--lh-relaxed: 1.75  (mobile)
```

---

## 🌐 Browser Support

| Feature | Support |
|---------|---------|
| CSS Grid | All modern browsers (IE11 compat mode needed) |
| Flexbox | All modern browsers |
| Media Queries | All modern browsers |
| CSS Custom Props | All modern browsers |
| Safe Areas | iOS 11.2+, Android 9+ |

---

## 📚 Documentation Links

- **Complete Guide:** `RESPONSIVE_DESIGN_GUIDE.md`
- **Implementation Summary:** `RESPONSIVE_IMPLEMENTATION_SUMMARY.md`
- **Design System:** `src/styles/responsive.css`
- **CSS Tokens:** `src/index.css` (lines 1-100)

---

## 💬 Common Questions

**Q: Why not use "mobile: { max: 639px }" style breakpoints?**  
A: Mobile-first (min-width) produces smaller CSS files and is easier to maintain. Add features as screens get bigger.

**Q: Can I use fixed widths?**  
A: Only if you set `max-w-[value]` and `md:w-full` to reflow on mobile. Better: use `flex-1` or `grid` instead.

**Q: What if content doesn't fit at 375px?**  
A: Stack it vertically or hide non-critical elements with `hidden md:block`. Never horizontal scroll.

**Q: How do I test on real devices?**  
A: Use ngrok/localtunnel to expose localhost to internet, then visit URL on phone. Or use device lab services.

**Q: Is this production-ready?**  
A: Core system is. Individual pages need per-page testing and mobile conversion (tables → cards).

---

**Last Updated:** January 21, 2026  
**Version:** 1.0 - Foundation Complete
