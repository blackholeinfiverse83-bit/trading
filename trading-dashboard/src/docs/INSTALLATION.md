# 📥 Installation Guide

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Download & Extract
1. Download the project folder
2. Extract the ZIP file to your desired location
3. Open the folder in VS Code

### Step 2: Install Dependencies
Open VS Code terminal (Ctrl + ` or Terminal → New Terminal) and run:

```bash
npm install
```

This will install all required packages (~2-3 minutes).

### Step 3: Run Development Server
```bash
npm run dev
```

The dashboard will open automatically at: **http://localhost:3000**

---

## 📦 What Gets Installed

When you run `npm install`, these packages are installed:

### Core Dependencies:
- **react** & **react-dom** - UI framework
- **axios** - API calls
- **motion** (Framer Motion) - Animations
- **recharts** - Trading charts
- **lucide-react** - Icons
- **sonner** - Toast notifications
- **tailwindcss** - Styling

### Total size: ~350 MB (includes all dependencies)

---

## 🎯 Available Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter (check code quality)
npm run lint
```

---

## 📁 Project Structure

```
tradeai-dashboard/
├── src/
│   ├── App.tsx                    # Main dashboard
│   ├── main.tsx                   # Entry point
│   ├── components/
│   │   ├── TradingChart.tsx       # Chart component
│   │   ├── LivePredictionsFeed.tsx
│   │   ├── ExecutionConsole.tsx
│   │   ├── InputPanel.tsx
│   │   ├── ChatPanel.tsx
│   │   └── ui/                    # Shadcn components
│   └── styles/
│       └── globals.css            # Global styles
├── public/                        # Static assets
├── package.json                   # Dependencies
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
└── index.html                     # HTML template
```

---

## 🔧 Troubleshooting

### Problem: `npm install` fails

**Solution 1:** Clear npm cache
```bash
npm cache clean --force
npm install
```

**Solution 2:** Delete node_modules and try again
```bash
rm -rf node_modules package-lock.json
npm install
```

**Windows users:** Use this instead:
```bash
rmdir /s node_modules
del package-lock.json
npm install
```

---

### Problem: Port 3000 already in use

**Solution:** Use a different port
```bash
npm run dev -- --port 3001
```

Or kill the process using port 3000:

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill
```

---

### Problem: TypeScript errors in VS Code

**Solution:** Restart TypeScript server
1. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac)
2. Type: "TypeScript: Restart TS Server"
3. Press Enter

---

### Problem: Styles not loading

**Solution:** Make sure Tailwind CSS is properly configured

Check that `/src/styles/globals.css` contains:
```css
@import "tailwindcss";
```

---

## 🌐 Deployment

### Deploy to Vercel (FREE)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow the prompts:**
- Link to existing project? No
- Project name: tradeai-dashboard
- Directory: ./
- Override settings? No

4. **Done!** You'll get a live URL like:
`https://tradeai-dashboard.vercel.app`

---

### Alternative: Manual Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your Git repository (or drag & drop folder)
5. Vercel auto-detects Vite config
6. Click "Deploy"
7. Done! ✅

---

## 🔐 Environment Variables (For Backend Connection)

When you're ready to connect to Krishna's backend:

1. Create `.env` file in root:
```env
VITE_API_BASE_URL=https://api.tradeai.com
VITE_API_KEY=sk_live_your_api_key_here
```

2. Update `/src/config/api.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_KEY: import.meta.env.VITE_API_KEY,
  // ... rest of config
};
```

3. Restart dev server

---

## 📚 Next Steps

1. ✅ **Run the dashboard** - `npm run dev`
2. ✅ **Explore the UI** - Test all features
3. ✅ **Read documentation:**
   - `README.md` - Project overview
   - `BACKEND_INTEGRATION.md` - How to connect backend
   - `FRONTEND_UPDATE_GUIDE.md` - Update instructions
4. ✅ **Wait for Krishna's backend** - Then follow integration guide

---

## 🆘 Need Help?

Common issues:
- **Node.js not installed?** → Download from [nodejs.org](https://nodejs.org/)
- **npm command not found?** → Restart terminal after installing Node.js
- **Port errors?** → Use `npm run dev -- --port 3001`
- **TypeScript errors?** → Restart TS server in VS Code

---

## ✅ Verify Installation

Run these commands to check everything is working:

```bash
# Check Node.js version (should be v18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check if dependencies are installed
npm list react

# Start the app
npm run dev
```

If all commands work, you're ready! 🚀

---

## 📊 System Requirements

- **OS:** Windows 10+, macOS 10.15+, or Linux
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk Space:** 1 GB free space
- **Internet:** Required for `npm install`

---

Happy Trading! 📈
