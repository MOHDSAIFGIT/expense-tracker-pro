import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as Haptics from 'expo-haptics';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  labelClassName?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  className,
  labelClassName,
  icon,
  onPress,
  ...props
}) => {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const variants = {
    primary: 'bg-indigo-600',
    secondary: 'bg-slate-700',
    outline: 'border border-slate-700 bg-transparent',
    ghost: 'bg-transparent',
    danger: 'bg-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 rounded-lg',
    md: 'px-4 py-3 rounded-xl',
    lg: 'px-6 py-4 rounded-2xl',
  };

  const labelVariants = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-medium',
    outline: 'text-slate-200 font-medium',
    ghost: 'text-slate-400 font-medium',
    danger: 'text-white font-semibold',
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className={cn(
        'flex-row items-center justify-center',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text className={cn(labelVariants[variant], labelSizes[size], labelClassName)}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
