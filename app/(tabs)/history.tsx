import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SectionList, TouchableOpacity, TextInput, Alert, BackHandler } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ArrowUpDown, Trash2, X } from 'lucide-react-native';
import { useTransactionStore } from '../../src/store/useTransactionStore';
import { TransactionItem } from '../../src/components/TransactionItem';
import { COLORS } from '../../src/constants/colors';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

type SortOption = 'latest' | 'oldest' | 'highest' | 'lowest';

export default function History() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { transactions, deleteTransaction } = useTransactionStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('latest');
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

  const sections = useMemo(() => {
    let filtered = transactions.filter((t) => 
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(search.toLowerCase()))
    );

    switch (sort) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    // Group by date
    const groups: Record<string, any[]> = {};
    filtered.forEach((t) => {
      const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });

    return Object.keys(groups).map((date) => {
      const d = new Date(date);
      let title = format(d, 'MMMM dd, yyyy');
      if (isToday(d)) title = 'Today';
      else if (isYesterday(d)) title = 'Yesterday';

      return { title, data: groups[date] };
    });
  }, [transactions, search, sort]);

  const toggleSort = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const options: SortOption[] = ['latest', 'oldest', 'highest', 'lowest'];
    const currentIndex = options.indexOf(sort);
    const nextIndex = (currentIndex + 1) % options.length;
    setSort(options[nextIndex]);
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
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between mt-6 mb-2">
          <Text className="text-white text-2xl font-bold">
            {isSelectionMode ? `${selectedIds.length} Selected` : 'History'}
          </Text>
          {isSelectionMode && (
            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleBulkDelete} className="p-2 mr-2">
                <Trash2 size={24} color="#f87171" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedIds([])} className="p-2">
                <X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-800 rounded-2xl px-4 py-3.5 mb-6 mt-4 border border-slate-700">
          <Search size={20} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor="#64748b"
            className="flex-1 text-slate-100 ml-3 text-base"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters & Sort */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-slate-400 font-medium">
            {transactions.length} Transactions
          </Text>
          <TouchableOpacity 
            onPress={toggleSort}
            className="flex-row items-center bg-slate-800 px-4 py-2 rounded-xl border border-slate-700"
          >
            <ArrowUpDown size={14} color={COLORS.primary} />
            <Text className="text-white text-xs font-bold ml-2 uppercase">
              {sort}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem 
              transaction={item} 
              onPress={() => handleTransactionPress(item)} 
              onLongPress={() => toggleSelection(item.id)}
              isSelected={selectedIds.includes(item.id)}
              selectionMode={isSelectionMode}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View className="bg-slate-900 py-3">
              <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                {title}
              </Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-slate-500 font-medium text-center">
                {search ? 'No transactions found.' : 'Your history is empty.'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </View>
  );
}
