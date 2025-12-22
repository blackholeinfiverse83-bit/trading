# ⚡ Quick Command Reference

All commands you'll need for the TradeAI Dashboard.

---

## 🚀 Essential Commands (Use These Daily)

### **Start Development Server**
```bash
npm run dev
```
- Opens browser automatically at `http://localhost:3000`
- Hot reload enabled (changes appear instantly)
- Press `Ctrl + C` to stop

### **Install Dependencies** (First Time Only)
```bash
npm install
```
- Run this once after downloading
- Takes 2-3 minutes
- Creates `node_modules/` folder

### **Build for Production**
```bash
npm run build
```
- Creates optimized production build
- Output in `dist/` folder
- Ready to deploy

---

## 📦 npm Commands

### **Installation**
```bash
# Install all dependencies
npm install

# Install specific package
npm install axios

# Install as dev dependency
npm install -D tailwindcss

# Install specific version
npm install react@18.2.0
```

### **Uninstall**
```bash
# Remove package
npm uninstall axios

# Remove dev dependency
npm uninstall -D tailwindcss
```

### **Update**
```bash
# Update all packages
npm update

# Update specific package
npm update axios

# Check for outdated packages
npm outdated
```

---

## 🔧 Vite Commands

### **Development**
```bash
# Start dev server (default port 3000)
npm run dev

# Start on specific port
npm run dev -- --port 3001

# Start and open browser
npm run dev -- --open

# Start with specific host
npm run dev -- --host 0.0.0.0
```

### **Build**
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Preview on specific port
npm run preview -- --port 4000
```

---

## 🧹 Cleanup Commands

### **Clear Cache**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Windows: Remove node_modules
rmdir /s node_modules

# Remove package-lock.json
rm package-lock.json

# Windows: Remove package-lock.json
del package-lock.json
```

### **Fresh Install**
```bash
# Complete cleanup and reinstall
rm -rf node_modules package-lock.json
npm install

# Windows version
rmdir /s node_modules
del package-lock.json
npm install
```

---

## 🎨 Shadcn UI Commands

### **Add Components**
```bash
# Add single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button input slider

# Initialize shadcn
npx shadcn@latest init
```

### **Available Components to Add**
```bash
npx shadcn@latest add accordion
npx shadcn@latest add alert
npx shadcn@latest add alert-dialog
npx shadcn@latest add badge
npx shadcn@latest add button
npx shadcn@latest add calendar
npx shadcn@latest add card
npx shadcn@latest add checkbox
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add slider
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add textarea
npx shadcn@latest add toast
# ... and 30+ more
```

---

## 🌐 Deployment Commands

### **Vercel (Recommended)**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

### **Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

---

## 🔍 Debugging Commands

### **Check Versions**
```bash
# Node version
node --version
# Should show: v18.0.0 or higher

# npm version
npm --version
# Should show: 9.0.0 or higher

# List installed packages
npm list

# Check specific package version
npm list react
```

### **Check for Issues**
```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Check TypeScript errors
npx tsc --noEmit
```

### **Port Issues**
```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux: Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or just use a different port
npm run dev -- --port 3001
```

---

## 📊 Package Management

### **View Package Info**
```bash
# Show package details
npm view react

# Show package versions
npm view react versions

# Show installed package info
npm list react
```

### **Search Packages**
```bash
# Search npm registry
npm search axios

# Visit package on npm
npm home axios

# View package repository
npm repo axios
```

---

## 🔐 Environment Variables

### **Create .env File**
```bash
# Create .env file
touch .env

# Windows: Create .env file
type nul > .env
```

### **Example .env Contents**
```env
VITE_API_BASE_URL=https://api.tradeai.com
VITE_API_KEY=sk_live_your_key_here
```

### **Access in Code**
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 🐛 Troubleshooting Commands

### **Common Fixes**

**Problem: Module not found**
```bash
npm install
```

**Problem: TypeScript errors**
```bash
# Restart TypeScript server in VS Code
# Press Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

**Problem: Port already in use**
```bash
npm run dev -- --port 3001
```

**Problem: Outdated dependencies**
```bash
npm update
```

**Problem: Corrupted node_modules**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem: Build fails**
```bash
# Clear Vite cache
rm -rf .vite
npm run build
```

---

## 🧪 Testing Commands (Future)

When you add tests later:

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 📝 Git Commands (Version Control)

### **Initial Setup**
```bash
# Initialize git repo
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - TradeAI Dashboard"
```

### **Daily Workflow**
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Add feature X"

# Push to GitHub
git push origin main
```

### **Connect to GitHub**
```bash
# Add remote
git remote add origin https://github.com/username/repo.git

# Push to GitHub
git push -u origin main
```

---

## 🔄 Update Commands

### **Update npm Itself**
```bash
# Update npm to latest
npm install -g npm@latest
```

### **Update Project Dependencies**
```bash
# Update all packages
npm update

# Update to latest (even breaking changes)
npm install react@latest

# Check what's outdated
npm outdated
```

---

## 📚 Documentation Commands

### **Generate Docs** (Future)
```bash
# If you add JSDoc later
npx typedoc --out docs src/

# Generate component docs
npx react-docgen src/components
```

---

## 🎯 VS Code Commands

### **Terminal Shortcuts**
- **Open Terminal:** `Ctrl + ` ` (backtick)
- **New Terminal:** `Ctrl + Shift + ` `
- **Kill Terminal:** Click trash icon or `exit`

### **Useful VS Code Shortcuts**
- **Command Palette:** `Ctrl + Shift + P`
- **Quick Open File:** `Ctrl + P`
- **Format Document:** `Shift + Alt + F`
- **Go to Definition:** `F12`
- **Find in Files:** `Ctrl + Shift + F`

---

## 🚨 Emergency Commands

### **Something Broke? Try These in Order:**

**1. Restart dev server**
```bash
# Press Ctrl+C, then:
npm run dev
```

**2. Clear cache and restart**
```bash
rm -rf .vite
npm run dev
```

**3. Reinstall dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**4. Check for errors**
```bash
npm run build
# Look for error messages
```

**5. Nuclear option (last resort)**
```bash
# Delete everything except source code
rm -rf node_modules package-lock.json dist .vite
npm install
npm run build
npm run dev
```

---

## 📊 Performance Commands

### **Analyze Bundle Size**
```bash
# Build and analyze
npm run build

# Check dist/ folder size
du -sh dist/

# Windows: Check dist/ folder
dir dist
```

### **Optimize Build**
```bash
# Production build (already optimized)
npm run build

# Preview optimized build
npm run preview
```

---

## 🎓 Learning Commands

### **Explore Package**
```bash
# Open package documentation
npm docs axios

# View package on npm
npm home axios

# View package issues
npm bugs axios
```

---

## ⚡ Quick Copy-Paste Commands

### **First Time Setup**
```bash
cd tradeai-dashboard
npm install
npm run dev
```

### **Daily Development**
```bash
npm run dev
# Make changes
# Save files (auto-reload)
# Ctrl+C when done
```

### **Deploy to Vercel**
```bash
npm run build
vercel
```

### **Fix Everything**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📋 Command Cheat Sheet

| Task | Command |
|------|---------|
| Install | `npm install` |
| Start dev | `npm run dev` |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Add package | `npm install <package>` |
| Remove package | `npm uninstall <package>` |
| Update all | `npm update` |
| Clear cache | `npm cache clean --force` |
| Deploy | `vercel` |
| Kill port 3000 | `lsof -ti:3000 \| xargs kill` |
| Fresh install | `rm -rf node_modules && npm install` |

---

## 🎯 Most Used Commands (Top 5)

```bash
1. npm run dev          # Start development (use daily)
2. npm install          # Install packages (use once)
3. npm run build        # Build for production (before deploy)
4. Ctrl + C             # Stop dev server (use daily)
5. vercel               # Deploy (when ready to share)
```

---

## 💡 Pro Tips

### **Faster npm installs**
```bash
# Use npm ci for faster, reliable installs
npm ci
```

### **Run multiple commands**
```bash
# Install and start dev server
npm install && npm run dev
```

### **Background process**
```bash
# Run dev server in background (Mac/Linux)
npm run dev &

# Bring back to foreground
fg
```

### **Check what's running on a port**
```bash
# Mac/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

---

## ✅ Command Checklist for Different Scenarios

### **Scenario: First Time Setup**
```bash
✅ cd tradeai-dashboard
✅ npm install
✅ npm run dev
```

### **Scenario: Daily Development**
```bash
✅ npm run dev
✅ (Make changes)
✅ Ctrl+C
```

### **Scenario: Deploying to Production**
```bash
✅ npm run build
✅ npm run preview  (test locally)
✅ vercel
```

### **Scenario: Something's Broken**
```bash
✅ Ctrl+C
✅ rm -rf node_modules package-lock.json
✅ npm install
✅ npm run dev
```

### **Scenario: Adding Backend Connection**
```bash
✅ Create src/config/api.ts
✅ npm run dev  (test changes)
✅ Fix any errors
✅ npm run build  (verify production build)
```

---

**Save this file for quick reference!** 📑
