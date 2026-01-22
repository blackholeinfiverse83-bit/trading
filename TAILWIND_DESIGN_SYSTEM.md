/* Enhanced Tailwind Configuration with Complete Design System */

/* Add this to tailwind.config.js theme.extend section: */

{
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Primary Blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Success Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#145231',
    },
    
    // Warning Colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error Colors
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral - for backgrounds/text
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      150: '#eeeff2',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
  },
  
  spacing: {
    // 8px grid system
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
  },
  
  fontSize: {
    // Responsive typography scale
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '3.5rem' }],      // 48px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '2.5rem',  // 40px
    full: '9999px',
  },
  
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },
  
  transitionDuration: {
    0: '0ms',
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  // Component layer utilities
  plugins: [
    function({ addComponents, theme }) {
      const components = {
        // Buttons
        '.btn': {
          '@apply': 'px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        },
        '.btn-primary': {
          '@apply': 'btn bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500',
        },
        '.btn-secondary': {
          '@apply': 'btn bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600',
        },
        '.btn-danger': {
          '@apply': 'btn bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus:ring-error-500',
        },
        '.btn-success': {
          '@apply': 'btn bg-success-500 text-white hover:bg-success-600 active:bg-success-700 focus:ring-success-500',
        },
        
        // Cards
        '.card': {
          '@apply': 'bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 transition-all duration-200',
        },
        '.card-hover': {
          '@apply': 'card hover:shadow-lg cursor-pointer',
        },
        
        // Forms
        '.input': {
          '@apply': 'w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
        },
        '.input-error': {
          '@apply': 'input border-error-500 focus:ring-error-500',
        },
        '.input-success': {
          '@apply': 'input border-success-500 focus:ring-success-500',
        },
        
        // Labels
        '.label': {
          '@apply': 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2',
        },
        
        // Badges
        '.badge': {
          '@apply': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        },
        '.badge-primary': {
          '@apply': 'badge bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100',
        },
        '.badge-success': {
          '@apply': 'badge bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-100',
        },
        '.badge-error': {
          '@apply': 'badge bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-100',
        },
        
        // Text utilities
        '.text-truncate': {
          '@apply': 'overflow-hidden text-overflow-ellipsis whitespace-nowrap',
        },
        '.text-clamp': {
          '@apply': 'line-clamp-2',
        },
        
        // Responsive typography
        '.heading-1': {
          '@apply': 'text-3xl md:text-4xl lg:text-5xl font-bold',
        },
        '.heading-2': {
          '@apply': 'text-2xl md:text-3xl lg:text-4xl font-bold',
        },
        '.heading-3': {
          '@apply': 'text-xl md:text-2xl lg:text-3xl font-bold',
        },
      };
      
      addComponents(components);
    },
  ],
}

/* Add to tailwind.config.js as complete file: */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // All above configuration goes here
    },
  },
  darkMode: 'class',
  plugins: [],
}
