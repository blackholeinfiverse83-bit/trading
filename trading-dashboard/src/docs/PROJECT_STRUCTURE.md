# 🗂️ Project Structure - Visual Guide

Complete visual breakdown of the TradeAI Dashboard project.

---

## 📁 Folder Tree (Complete Structure)

```
tradeai-dashboard/
│
├── 📄 index.html                      # HTML entry point
├── 📄 package.json                    # Dependencies & scripts
├── 📄 vite.config.ts                  # Build configuration
├── 📄 tsconfig.json                   # TypeScript config
├── 📄 tsconfig.node.json              # TypeScript Node config
├── 📄 .gitignore                      # Git ignore rules
│
├── 📚 Documentation/
│   ├── README.md                      # 📖 Start here - Project overview
│   ├── INSTALLATION.md                # 🚀 Setup guide
│   ├── DOWNLOAD_INSTRUCTIONS.md       # 📥 How to download
│   ├── BACKEND_INTEGRATION.md         # 🔌 API connection guide
│   ├── FRONTEND_UPDATE_GUIDE.md       # 🔧 How to modify
│   ├── QUICK_START.md                 # ⚡ Quick reference
│   ├── FILE_MANIFEST.md               # 📋 All files listed
│   ├── PROJECT_STRUCTURE.md           # 🗂️ This file
│   └── Attributions.md                # 💳 Credits
│
├── 📁 guidelines/
│   └── Guidelines.md                  # Design principles
│
├── 📁 src/                            # 🎯 SOURCE CODE FOLDER
│   │
│   ├── 📄 App.tsx                     # ⭐ MAIN DASHBOARD
│   ├── 📄 main.tsx                    # React entry point
│   │
│   ├── 📁 components/                 # 🧩 MAIN COMPONENTS
│   │   │
│   │   ├── 📊 TradingChart.tsx        # Trading chart component
│   │   │   • Candlestick chart
│   │   │   • Volume bars
│   │   │   • Technical indicators (SMA, EMA)
│   │   │   • Tab switcher (Overview, Technical, Volume)
│   │   │   • 350 lines of code
│   │   │
│   │   ├── 📡 LivePredictionsFeed.tsx # Live predictions feed
│   │   │   • Real-time predictions from AI
│   │   │   • BUY/SELL signals
│   │   │   • Confidence scores
│   │   │   • Auto-refresh every 10s
│   │   │   • 250 lines of code
│   │   │
│   │   ├── 📜 ExecutionConsole.tsx    # Execution log
│   │   │   • Trade execution history
│   │   │   • AI decision reasons
│   │   │   • Success/Pending/Error states
│   │   │   • 200 lines of code
│   │   │
│   │   ├── 🎛️ InputPanel.tsx          # Trading controls
│   │   │   • Stop-loss slider (0.5% - 10%)
│   │   │   • Target profit slider (1% - 20%)
│   │   │   • Investment amount input
│   │   │   • Risk mode toggle (Auto/Manual)
│   │   │   • Confirm button
│   │   │   • 300 lines of code
│   │   │
│   │   ├── 💬 ChatPanel.tsx           # Uniguru chatbot
│   │   │   • Chat interface
│   │   │   • Message history
│   │   │   • Typing indicator
│   │   │   • Send button
│   │   │   • 250 lines of code
│   │   │
│   │   ├── 📁 ui/                     # 🎨 UI COMPONENTS (Shadcn)
│   │   │   │
│   │   │   ├── ⭐ FREQUENTLY USED:
│   │   │   ├── button.tsx             # Buttons (used in all components)
│   │   │   ├── slider.tsx             # Sliders (InputPanel)
│   │   │   ├── switch.tsx             # Toggle switches (InputPanel)
│   │   │   ├── tabs.tsx               # Tab navigation (TradingChart)
│   │   │   ├── badge.tsx              # Status badges (LiveFeed, Console)
│   │   │   ├── input.tsx              # Text inputs (InputPanel, Chat)
│   │   │   ├── sonner.tsx             # Toast notifications (everywhere)
│   │   │   │
│   │   │   ├── 📊 DATA DISPLAY:
│   │   │   ├── table.tsx              # Tables
│   │   │   ├── card.tsx               # Card containers
│   │   │   ├── chart.tsx              # Chart wrappers
│   │   │   ├── progress.tsx           # Progress bars
│   │   │   ├── skeleton.tsx           # Loading skeletons
│   │   │   │
│   │   │   ├── 📝 FORMS:
│   │   │   ├── form.tsx               # Form wrapper
│   │   │   ├── label.tsx              # Form labels
│   │   │   ├── textarea.tsx           # Text areas
│   │   │   ├── select.tsx             # Dropdowns
│   │   │   ├── checkbox.tsx           # Checkboxes
│   │   │   ├── radio-group.tsx        # Radio buttons
│   │   │   ├── input-otp.tsx          # OTP inputs
│   │   │   │
│   │   │   ├── 🎭 OVERLAYS:
│   │   │   ├── dialog.tsx             # Modal dialogs
│   │   │   ├── alert-dialog.tsx       # Alert modals
│   │   │   ├── sheet.tsx              # Side panels
│   │   │   ├── drawer.tsx             # Bottom drawers
│   │   │   ├── popover.tsx            # Popovers
│   │   │   ├── tooltip.tsx            # Tooltips
│   │   │   ├── hover-card.tsx         # Hover cards
│   │   │   │
│   │   │   ├── 🧭 NAVIGATION:
│   │   │   ├── navigation-menu.tsx    # Nav menus
│   │   │   ├── menubar.tsx            # Menu bars
│   │   │   ├── dropdown-menu.tsx      # Dropdown menus
│   │   │   ├── context-menu.tsx       # Right-click menus
│   │   │   ├── breadcrumb.tsx         # Breadcrumbs
│   │   │   ├── pagination.tsx         # Pagination
│   │   │   ├── sidebar.tsx            # Sidebars
│   │   │   │
│   │   │   ├── 📦 CONTAINERS:
│   │   │   ├── accordion.tsx          # Collapsible sections
│   │   │   ├── collapsible.tsx        # Collapse content
│   │   │   ├── scroll-area.tsx        # Custom scrollbars
│   │   │   ├── resizable.tsx          # Resizable panels
│   │   │   ├── aspect-ratio.tsx       # Aspect ratio boxes
│   │   │   ├── separator.tsx          # Dividers
│   │   │   │
│   │   │   ├── 🎨 MISC:
│   │   │   ├── alert.tsx              # Alert boxes
│   │   │   ├── avatar.tsx             # User avatars
│   │   │   ├── calendar.tsx           # Date pickers
│   │   │   ├── carousel.tsx           # Image carousels
│   │   │   ├── command.tsx            # Command palette
│   │   │   ├── toggle.tsx             # Toggle buttons
│   │   │   ├── toggle-group.tsx       # Toggle groups
│   │   │   │
│   │   │   └── 🔧 UTILITIES:
│   │   │       ├── utils.ts           # Helper functions
│   │   │       └── use-mobile.ts      # Mobile detection hook
│   │   │
│   │   └── 📁 figma/
│   │       └── ImageWithFallback.tsx  # Image component (fallback handling)
│   │
│   └── 📁 styles/
│       └── globals.css                # 🎨 GLOBAL STYLES
│           • Tailwind CSS imports
│           • Custom CSS variables
│           • Typography defaults
│           • Dark theme colors
│
└── 📁 (Created after npm install)
    ├── node_modules/                  # 📦 NPM PACKAGES (~350 MB)
    │   ├── react/
    │   ├── axios/
    │   ├── motion/
    │   ├── recharts/
    │   ├── lucide-react/
    │   └── ... (200+ packages)
    │
    └── package-lock.json              # Dependency lock file
```

---

## 🎯 Where to Find Things

### **🚀 Want to start the app?**
→ Read: `INSTALLATION.md`

### **🔌 Want to connect backend?**
→ Read: `BACKEND_INTEGRATION.md`

### **🎨 Want to change styling?**
→ Edit: `src/styles/globals.css`

### **📊 Want to modify the chart?**
→ Edit: `src/components/TradingChart.tsx`

### **💬 Want to change chatbot?**
→ Edit: `src/components/ChatPanel.tsx`

### **🎛️ Want to change trading controls?**
→ Edit: `src/components/InputPanel.tsx`

### **📡 Want to modify predictions feed?**
→ Edit: `src/components/LivePredictionsFeed.tsx`

### **📜 Want to change execution log?**
→ Edit: `src/components/ExecutionConsole.tsx`

### **🏠 Want to change layout?**
→ Edit: `src/App.tsx`

### **🎨 Want different colors?**
→ Edit: `src/styles/globals.css` (lines 1-50)

---

## 📊 Component Hierarchy

```
┌────────────────────────────────────────────────────────────┐
│                      index.html                            │
│                          ↓                                 │
│                    src/main.tsx                            │
│                          ↓                                 │
│                     src/App.tsx                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Header (built-in to App.tsx)                      │   │
│  │  • Logo                                            │   │
│  │  • Title: "TradeAI Dashboard"                      │   │
│  │  • Live indicator                                  │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Main Grid Layout                                  │   │
│  │  ┌─────────────────────────┬────────────────────┐  │   │
│  │  │  TradingChart.tsx       │  InputPanel.tsx    │  │   │
│  │  │  • Candlestick chart    │  • Stop-loss       │  │   │
│  │  │  • Volume bars          │  • Target profit   │  │   │
│  │  │  • Indicators           │  • Amount          │  │   │
│  │  │  • Tabs                 │  • Risk mode       │  │   │
│  │  └─────────────────────────┴────────────────────┘  │   │
│  │  ┌──────────┬──────────────┬───────────────────┐  │   │
│  │  │ LiveFeed │ ExecConsole  │  ChatPanel.tsx    │  │   │
│  │  │   .tsx   │    .tsx      │  • Chat messages  │  │   │
│  │  │ • Preds  │ • Exec log   │  • Input field    │  │   │
│  │  │ • Signals│ • Decisions  │  • Send button    │  │   │
│  │  └──────────┴──────────────┴───────────────────┘  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  + Toaster (from ui/sonner.tsx) - Notifications           │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 Style System

```
src/styles/globals.css
│
├── Tailwind Imports
│   └── @import "tailwindcss";
│
├── CSS Variables (Dark Theme)
│   ├── --background (slate-950)
│   ├── --foreground (slate-50)
│   ├── --primary (blue-500)
│   ├── --accent (purple-600)
│   └── ... (20+ variables)
│
├── Typography
│   ├── h1, h2, h3 (font sizes, weights)
│   ├── p (paragraphs)
│   └── body (default font)
│
└── Custom Classes
    ├── .gradient-text
    ├── .glass-effect
    └── ... (utility classes)
```

---

## 🔌 Data Flow (API Integration)

```
┌─────────────────────────────────────────────────────┐
│             Krishna's Backend APIs                  │
│  ┌────────────┬──────────────┬─────────────────┐   │
│  │ /feed/live │ /tools/confirm │ /chat/query   │   │
│  └────────────┴──────────────┴─────────────────┘   │
└──────────┬───────────┬──────────────┬──────────────┘
           │           │              │
           ↓           ↓              ↓
┌──────────────┐ ┌───────────┐ ┌────────────┐
│ LiveFeed.tsx │ │ Input     │ │ Chat       │
│              │ │ Panel.tsx │ │ Panel.tsx  │
│ • axios.get  │ │           │ │            │
│ • 10s poll   │ │ • axios   │ │ • axios    │
│ • Display    │ │   .post   │ │   .post    │
│   predictions│ │ • Confirm │ │ • Send msg │
│              │ │   trade   │ │ • Get reply│
└──────────────┘ └───────────┘ └────────────┘
       │                │              │
       ↓                ↓              ↓
┌──────────────────────────────────────────┐
│        React State Management            │
│  • useState for local state              │
│  • useEffect for API calls               │
│  • No Redux needed (simple state)        │
└──────────────────────────────────────────┘
```

---

## 📦 Package Dependencies

```
package.json
├── dependencies (PRODUCTION)
│   ├── react              ← UI framework
│   ├── react-dom          ← DOM rendering
│   ├── axios              ← API calls
│   ├── motion             ← Animations
│   ├── recharts           ← Charts
│   ├── lucide-react       ← Icons
│   ├── sonner             ← Toasts
│   ├── react-hook-form    ← Form handling
│   ├── date-fns           ← Date utilities
│   ├── clsx               ← Class utilities
│   └── tailwind-merge     ← Tailwind utilities
│
└── devDependencies (DEVELOPMENT ONLY)
    ├── typescript         ← TypeScript compiler
    ├── vite               ← Build tool
    ├── tailwindcss        ← CSS framework
    ├── @types/react       ← TypeScript types
    ├── eslint             ← Code linting
    └── autoprefixer       ← CSS prefixing
```

---

## 🎯 Code Organization

### **By Feature:**

```
Trading Chart:
  └── TradingChart.tsx (chart + data + logic)

Live Predictions:
  └── LivePredictionsFeed.tsx (feed + API + display)

Execution:
  └── ExecutionConsole.tsx (log + history)

Controls:
  └── InputPanel.tsx (sliders + inputs + confirmation)

Chat:
  └── ChatPanel.tsx (messages + input + API)
```

### **By Layer:**

```
├── Presentation (UI)
│   └── src/components/*.tsx
│
├── Business Logic
│   └── Inside each component (useState, useEffect)
│
├── Data (API)
│   └── axios calls in components
│   └── (Future: src/config/api.ts for centralized config)
│
└── Styling
    └── Tailwind classes inline
    └── src/styles/globals.css for global styles
```

---

## 🔧 Configuration Files Explained

| File | Purpose | Edit? |
|------|---------|-------|
| `package.json` | Lists dependencies | ✅ Yes (to add packages) |
| `vite.config.ts` | Build settings | ❌ Rarely |
| `tsconfig.json` | TypeScript settings | ❌ No (already optimized) |
| `index.html` | HTML entry | ❌ No (basic template) |
| `.gitignore` | Git ignore | ✅ Yes (to ignore more files) |

---

## 📚 Documentation Roadmap

**Read in this order:**

1. **INSTALLATION.md** ← Start here!
   - How to install & run

2. **README.md**
   - Project overview
   - Features list
   - Tech stack

3. **QUICK_START.md**
   - Quick commands
   - Common tasks

4. **FILE_MANIFEST.md**
   - List of all files
   - What each file does

5. **PROJECT_STRUCTURE.md** (This file!)
   - Visual structure
   - Where to find things

6. **BACKEND_INTEGRATION.md**
   - How to connect Krishna's API
   - Read when backend is ready

7. **FRONTEND_UPDATE_GUIDE.md**
   - How to modify components
   - Customization guide

---

## 🎓 Key Concepts

### **Component Structure:**
```typescript
// Typical component file:

// 1. Imports
import { useState } from 'react';
import { Button } from './ui/button';
import axios from 'axios';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Component Function
export function MyComponent({ title }: MyComponentProps) {
  // 4. State
  const [data, setData] = useState([]);
  
  // 5. Effects / API calls
  useEffect(() => {
    // Fetch data
  }, []);
  
  // 6. Event Handlers
  const handleClick = () => {
    // Handle click
  };
  
  // 7. Render JSX
  return (
    <div>
      <Button onClick={handleClick}>{title}</Button>
    </div>
  );
}
```

### **Styling Approach:**
```typescript
// Using Tailwind utility classes
<div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
  <h2 className="text-white">Title</h2>
  <p className="text-slate-400">Description</p>
</div>
```

### **API Calling Pattern:**
```typescript
// Using axios
const response = await axios.get('https://api.example.com/data');
setData(response.data);
```

---

## ✅ Quick Reference

**Want to...**

| Task | File to Edit | Line |
|------|--------------|------|
| Change app title | `src/App.tsx` | ~21 |
| Add new component | Create `src/components/NewComponent.tsx` | - |
| Change colors | `src/styles/globals.css` | 1-50 |
| Add new page | `src/App.tsx` (add to grid) | ~35 |
| Modify chart data | `src/components/TradingChart.tsx` | ~50 |
| Change API URL | (Future) `src/config/api.ts` | ~2 |
| Add new UI component | `src/components/ui/` | - |

---

## 🎯 Summary

**Project has:**
- ✅ 63 files total
- ✅ 5 main components
- ✅ 40+ UI components
- ✅ Complete documentation
- ✅ Production-ready code

**Everything is organized by:**
- 📁 Feature (each component is self-contained)
- 📁 Type (components, styles, docs separated)
- 📁 Purpose (UI components in ui/ folder)

**To get started:**
1. Download & extract
2. Open `INSTALLATION.md`
3. Follow setup steps
4. Start coding!

---

**Now you know exactly where everything is!** 🗂️
