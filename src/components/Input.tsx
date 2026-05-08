import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerClassName,
  className,
  inputClassName,
  icon,
  ...props
}) => {
  return (
    <View className={cn('mb-4', containerClassName)}>
      {label && (
        <Text className="text-slate-400 text-sm font-medium mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <View
        className={cn(
          'flex-row items-center bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5',
          error ? 'border-red-500' : 'focus:border-indigo-500',
          className
        )}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          placeholderTextColor="#64748b"
          className={cn('flex-1 text-slate-100 text-base font-medium', inputClassName)}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
};
