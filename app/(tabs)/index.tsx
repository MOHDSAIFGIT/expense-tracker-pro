import { View, Text, ScrollView, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, X } from 'lucide-react-native';
import { useTransactionStore } from '../../src/store/useTransactionStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { formatCurrency } from '../../src/utils/formatters';
import { Card } from '../../src/components/Card';
import { TransactionItem } from '../../src/components/TransactionItem';
import { COLORS } from '../../src/constants/colors';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { transactions, getTotalBalance, getIncome, getExpenses, deleteTransaction } = useTransactionStore();
  const { currency } = useSettingsStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isSelectionMode = selectedIds.length > 0;

  useEffect(() => {
    const backAction = () => {
      if (isSelectionMode) {
        setSelectedIds([]);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isSelectionMode]);

  const balance = getTotalBalance();
  const income = getIncome();
  const expenses = getExpenses();
  const recentTransactions = transactions.slice(0, 5);

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add-expense');
  };

  const handleTransactionPress = (transaction: any) => {
    if (isSelectionMode) {
      toggleSelection(transaction.id);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Transaction Actions',
      'What would you like to do with this transaction?',
      [
        {
          text: 'Edit',
          onPress: () => router.push({ pathname: '/add-expense', params: { id: transaction.id } }),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Transaction',
              'Are you sure you want to delete this transaction?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: () => {
                    deleteTransaction(transaction.id);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const toggleSelection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Selected',
      `Are you sure you want to delete ${selectedIds.length} transactions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach(id => deleteTransaction(id));
            setSelectedIds([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-900" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-slate-400 text-sm font-medium">Total Balance</Text>
            <Text className="text-white text-4xl font-bold mt-1">
              {formatCurrency(balance, currency)}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center border border-slate-700"
          >
            <Wallet size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Income/Expense Cards */}
        <View className="flex-row justify-between mb-8">
          <Card className="flex-1 mr-2 bg-emerald-500/10 border border-emerald-500/20">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center mr-2">
                <TrendingUp size={16} color="white" />
              </View>
              <Text className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Income</Text>
            </View>
            <Text className="text-white text-xl font-bold">{formatCurrency(income, currency)}</Text>
          </Card>
          
          <Card className="flex-1 ml-2 bg-red-500/10 border border-red-500/20">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-red-500 items-center justify-center mr-2">
                <TrendingDown size={16} color="white" />
              </View>
              <Text className="text-red-500 text-xs font-bold uppercase tracking-wider">Expenses</Text>
            </View>
            <Text className="text-white text-xl font-bold">{formatCurrency(expenses, currency)}</Text>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View className="flex-row items-center justify-between mb-4 px-1">
          <Text className="text-white text-xl font-bold">
            {isSelectionMode ? `${selectedIds.length} Selected` : 'Recent Transactions'}
          </Text>
          {isSelectionMode ? (
            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleBulkDelete} className="p-2 mr-2">
                <Trash2 size={20} color="#f87171" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedIds([])} className="p-2">
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text className="text-indigo-400 font-medium">See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentTransactions.length > 0 ? (
          recentTransactions.map((item) => (
            <TransactionItem 
              key={item.id} 
              transaction={item} 
              onPress={() => handleTransactionPress(item)} 
              onLongPress={() => toggleSelection(item.id)}
              isSelected={selectedIds.includes(item.id)}
              selectionMode={isSelectionMode}
            />
          ))
        ) : (
          <View className="items-center justify-center py-10">
            <Text className="text-slate-500 text-center font-medium">
              No transactions yet.{"\n"}Start by adding your first expense!
            </Text>
          </View>
        )}
        
        <View className="h-24" />
      </ScrollView>

      {/* Quick Add Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleAddPress}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/40 z-10"
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
