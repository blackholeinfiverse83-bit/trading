import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className = ''
}) => {
  const getGridClasses = () => {
    const classes = ['grid'];
    
    // Default columns
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    
    // Responsive columns
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    
    // Gap
    classes.push(`gap-${gap}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;