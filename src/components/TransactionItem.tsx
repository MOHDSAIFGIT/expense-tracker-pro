import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Receipt, 
  Gamepad2, 
  HeartPulse, 
  GraduationCap, 
  CircleEllipsis,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Circle,
  Briefcase,
  Banknote,
  Wand2,
  TrendingUp,
  Gift
} from 'lucide-react-native';
import { Transaction, Category } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_COLORS, COLORS } from '../constants/colors';
import * as Haptics from 'expo-haptics';

const CATEGORY_ICONS: Record<Category, any> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Health: HeartPulse,
  Education: GraduationCap,
  Salary: Banknote,
  Business: Briefcase,
  Freelance: Wand2,
  Investment: TrendingUp,
  Gift: Gift,
  Other: CircleEllipsis,
};

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onLongPress?: (transaction: Transaction) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onLongPress,
  isSelected,
  selectionMode,
}) => {
  const Icon = CATEGORY_ICONS[transaction.category] || CircleEllipsis;
  const isExpense = transaction.type === 'expense';
  const color = CATEGORY_COLORS[transaction.category] || '#94a3b8';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(transaction);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(transaction);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={`flex-row items-center p-4 rounded-2xl mb-3 border ${
        isSelected ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-800/40 border-slate-800/50'
      }`}
    >
      {selectionMode && (
        <View className="mr-3">
          {isSelected ? (
            <CheckCircle2 size={22} color={COLORS.primary} />
          ) : (
            <Circle size={22} color={COLORS.textMuted} />
          )}
        </View>
      )}
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={24} color={color} />
      </View>
      
      <View className="flex-1">
        <Text className="text-slate-100 font-semibold text-base mb-0.5">
          {transaction.category}
        </Text>
        <Text className="text-slate-400 text-xs" numberOfLines={1}>
          {transaction.note || formatDate(transaction.date)}
        </Text>
      </View>
      
      <View className="items-end">
        <Text 
          className={`font-bold text-base ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}
        >
          {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
        </Text>
        <View className="flex-row items-center mt-1">
          {isExpense ? (
            <ArrowDownLeft size={10} color="#f87171" />
          ) : (
            <ArrowUpRight size={10} color="#34d399" />
          )}
          <Text className="text-slate-500 text-[10px] ml-1">
            {transaction.paymentMethod}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
