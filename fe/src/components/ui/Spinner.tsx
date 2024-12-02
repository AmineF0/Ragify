import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SpinnerProps {
  className?: string;
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 24 }) => {
  return (
    <Loader2 
      className={cn("animate-spin text-blue-600", className)} 
      size={size}
    />
  );
};