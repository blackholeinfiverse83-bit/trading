# TradeX Pro - Project Dependencies

This document lists all the dependencies required for the TradeX Pro Trading Dashboard.

## Required Dependencies

To install all dependencies, run:

```bash
npm install
```

### Core Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.2",
  "lucide-react": "^0.300.0",
  "recharts": "^2.10.3",
  "sonner": "^1.2.3",
  "motion": "^10.16.4",
  "react-hook-form": "^7.48.2",
  "date-fns": "^2.30.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.1.0"
}
```

### Dev Dependencies

```json
{
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@typescript-eslint/eslint-plugin": "^6.14.0",
  "@typescript-eslint/parser": "^6.14.0",
  "@vitejs/plugin-react": "^4.2.1",
  "autoprefixer": "^10.4.16",
  "eslint": "^8.55.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.5",
  "postcss": "^8.4.32",
  "tailwindcss": "^4.0.0",
  "typescript": "^5.2.2",
  "vite": "^5.0.8"
}
```

## Dependency Details

### 1. **react & react-dom** (^18.2.0)
- Core React library for building the UI
- React DOM for rendering components

### 2. **axios** (^1.6.2)
- HTTP client for making API requests to the backend
- Used for all backend communication (/tools/predict, /tools/scan_all, /chat/query, etc.)

### 3. **lucide-react** (^0.300.0)
- Icon library for all UI icons
- Provides consistent, modern icons throughout the app

### 4. **recharts** (^2.10.3)
- Charting library for candlestick charts and technical analysis
- Used in TradingChart component

### 5. **sonner** (^1.2.3)
- Toast notification library
- Used for success/error messages throughout the app
- **Note:** Import toast using `import { toast } from 'sonner@2.0.3'`

### 6. **motion** (^10.16.4)
- Animation library (formerly Framer Motion)
- Powers smooth animations and transitions
- Import using `import { motion } from 'motion/react'`

### 7. **react-hook-form** (^7.48.2)
- Form management library
- Handles input validation and form state

### 8. **date-fns** (^2.30.0)
- Date utility library
- Used for formatting timestamps and dates

### 9. **clsx** (^2.0.0)
- Utility for constructing className strings conditionally

### 10. **tailwind-merge** (^2.1.0)
- Utility for merging Tailwind CSS classes
- Prevents style conflicts

### 11. **TypeScript** (^5.2.2)
- Type-safe JavaScript
- All components are written in TypeScript

### 12. **Vite** (^5.0.8)
- Build tool and dev server
- Provides fast hot module replacement (HMR)

### 13. **Tailwind CSS** (^4.0.0)
- Utility-first CSS framework
- All styling is done with Tailwind classes

## Installation Instructions

### Step 1: Install Node.js
Make sure you have Node.js (v16 or higher) installed:
```bash
node --version
npm --version
```

### Step 2: Install Dependencies
Navigate to the project directory and run:
```bash
npm install
```

### Step 3: Verify Installation
Check that all dependencies are installed correctly:
```bash
npm list
```

### Step 4: Run Development Server
Start the development server:
```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## Backend Requirements

The frontend connects to a backend API at `http://localhost:8002`. Make sure your backend (Krishna's API) is running and provides the following endpoints:

- `POST /tools/predict` - Get trading predictions
- `POST /tools/scan_all` - Scan multiple stock symbols
- `POST /tools/analyze` - Analyze stock with technical indicators
- `POST /tools/confirm` - Confirm trade parameters
- `POST /chat/query` - Chat with AI assistant
- `GET /tools/health` - Health check endpoint
- `GET /api/status` - API status check

## Build for Production

To create a production build:
```bash
npm run build
```

The build output will be in the `dist` directory.

## Troubleshooting

### Issue: Module not found errors
**Solution:** Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use
**Solution:** Kill the process using port 5173:
```bash
# On Mac/Linux
lsof -ti:5173 | xargs kill

# On Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: TypeScript errors
**Solution:** Make sure TypeScript is installed correctly:
```bash
npm install --save-dev typescript @types/react @types/react-dom
```

### Issue: Tailwind styles not working
**Solution:** Make sure Tailwind is configured correctly in `/styles/globals.css`

## Notes

- All dependencies are pinned to specific versions to ensure consistency
- The app does NOT use mock data - it requires a working backend API
- The background is a custom animated space background with moving stars
- All data is fetched from the backend in real-time
