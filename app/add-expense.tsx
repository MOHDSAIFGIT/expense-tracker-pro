import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Calendar, StickyNote, Camera, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useTransactionStore } from '../src/store/useTransactionStore';
import { Category, PaymentMethod } from '../src/types';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { COLORS } from '../src/constants/colors';
import * as Haptics from 'expo-haptics';

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 
  'Salary', 'Business', 'Freelance', 'Investment', 'Gift', 'Other'
];

const METHODS: PaymentMethod[] = ['Cash', 'Card', 'Transfer', 'Other'];

export default function AddExpense() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionStore();

  const isEditing = !!id;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isEditing) {
      const transaction = transactions.find((t) => t.id === id);
      if (transaction) {
        setAmount(transaction.amount.toString());
        setCategory(transaction.category);
        setNote(transaction.note || '');
        setMethod(transaction.paymentMethod);
        setType(transaction.type);
        setDate(new Date(transaction.date));
        setImageUri(transaction.imageUri);
      }
    }
  }, [id, isEditing, transactions]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const transactionData = {
      amount: parseFloat(amount),
      type,
      category,
      note,
      date: date.toISOString(),
      paymentMethod: method,
      imageUri,
    };

    if (isEditing && typeof id === 'string') {
      updateTransaction(id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (typeof id === 'string') {
              deleteTransaction(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            }
          }
        },
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View className="flex-1 bg-slate-900" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        className="flex-1"
      >
        <View className="flex-1 px-5 pt-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              {isEditing ? 'Edit Transaction' : 'Add Transaction'}
            </Text>
            {isEditing ? (
              <TouchableOpacity onPress={handleDelete} className="p-2">
                <Trash2 size={24} color="#f87171" />
              </TouchableOpacity>
            ) : (
              <View className="w-10" />
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type Selector */}
            <View className="flex-row bg-slate-800 p-1.5 rounded-2xl mb-8">
              <TouchableOpacity 
                onPress={() => setType('expense')}
                className={`flex-1 py-3 rounded-xl items-center ${type === 'expense' ? 'bg-red-500' : ''}`}
              >
                <Text className={`font-bold ${type === 'expense' ? 'text-white' : 'text-slate-400'}`}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setType('income')}
                className={`flex-1 py-3 rounded-xl items-center ${type === 'income' ? 'bg-emerald-500' : ''}`}
              >
                <Text className={`font-bold ${type === 'income' ? 'text-white' : 'text-slate-400'}`}>Income</Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View className="items-center mb-8">
              <Text className="text-slate-400 font-medium mb-2">Amount</Text>
              <View className="flex-row items-center">
                <Text className="text-slate-500 text-3xl font-bold mr-1">$</Text>
                <Input
                  keyboardType="numeric"
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  className="bg-transparent border-0 p-0 min-w-[150px]"
                  inputClassName="text-white text-5xl font-bold text-center"
                  autoFocus
                />
              </View>
            </View>

            {/* Category Selector */}
            <Text className="text-slate-400 text-sm font-medium mb-3 ml-1">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`px-5 py-3 rounded-2xl mr-3 border ${
                    category === cat ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Text className={`font-medium ${category === cat ? 'text-white' : 'text-slate-400'}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date Selection */}
            <Text className="text-slate-400 text-sm font-medium mb-3 ml-1">Date</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center bg-slate-800 p-4 rounded-2xl mb-6 border border-slate-700"
            >
              <Calendar size={20} color={COLORS.primary} className="mr-3" />
              <Text className="text-white text-base flex-1">
                {format(date, 'MMMM dd, yyyy')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Payment Method */}
            <Text className="text-slate-400 text-sm font-medium mb-3 ml-1">Payment Method</Text>
            <View className="flex-row flex-wrap mb-6">
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => {
                    setMethod(m);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`px-4 py-2.5 rounded-xl mr-2 mb-2 border ${
                    method === m ? 'bg-slate-700 border-indigo-500' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Text className={`text-xs font-medium ${method === m ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Input
              label="Note"
              placeholder="What was this for?"
              value={note}
              onChangeText={setNote}
              icon={<StickyNote size={20} color={COLORS.textMuted} />}
            />

            {/* Receipt Image */}
            <Text className="text-slate-400 text-sm font-medium mb-3 ml-1">Receipt (Optional)</Text>
            {imageUri ? (
              <View className="relative mb-6">
                <Image 
                  source={{ uri: imageUri }} 
                  className="w-full h-48 rounded-2xl" 
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  onPress={() => setImageUri(undefined)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 items-center justify-center"
                >
                  <Trash2 size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={pickImage}
                className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/50 items-center justify-center mb-6"
              >
                <Camera size={24} color={COLORS.textMuted} />
                <Text className="text-slate-500 text-xs mt-2 font-medium">Tap to upload receipt</Text>
              </TouchableOpacity>
            )}

            <View className="h-10" />
          </ScrollView>

          {/* Action Button */}
          <View className="pb-6">
            <Button 
              label={isEditing ? 'Update Transaction' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`} 
              onPress={handleSave}
              className={type === 'expense' ? 'bg-red-500' : 'bg-emerald-500'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
