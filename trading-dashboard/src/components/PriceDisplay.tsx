import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface PriceDisplayProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function PriceDisplay({ 
  value, 
  prefix = '', 
  suffix = '', 
  decimals = 2,
  className = '' 
}: PriceDisplayProps) {
  const [previousValue, setPreviousValue] = useState(value);
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);

  useEffect(() => {
    if (value !== previousValue) {
      // Determine flash color based on change direction
      const color = value > previousValue ? 'green' : 'red';
      setFlashColor(color);
      
      // Reset flash after animation
      const timer = setTimeout(() => {
        setFlashColor(null);
      }, 500);
      
      setPreviousValue(value);
      
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  const getFlashClass = () => {
    if (!flashColor) return '';
    return flashColor === 'green' 
      ? 'bg-green-500/20 transition-colors duration-500' 
      : 'bg-red-500/20 transition-colors duration-500';
  };

  return (
    <span className={`inline-block px-1 rounded ${getFlashClass()} ${className}`}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}
