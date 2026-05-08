import React from 'react';
import { View, ViewProps } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'outline' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'elevated',
  ...props
}) => {
  const variants = {
    elevated: 'bg-slate-800 shadow-lg shadow-black/20',
    outline: 'bg-transparent border border-slate-700',
    flat: 'bg-slate-800/50',
  };

  return (
    <View
      className={cn(
        'rounded-3xl p-5',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};
