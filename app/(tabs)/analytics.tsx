import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactionStore } from '../../src/store/useTransactionStore';
import { CATEGORY_COLORS } from '../../src/constants/colors';
import { Category } from '../../src/types';
import { formatCurrency } from '../../src/utils/formatters';
import { Card } from '../../src/components/Card';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export default function Analytics() {
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactionStore();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (timeFrame === 'weekly') {
        return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
      } else if (timeFrame === 'monthly') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (timeFrame === 'yearly') {
        return d.getFullYear() === now.getFullYear();
      } else {
        return isWithinInterval(d, { 
          start: startOfDay(startDate), 
          end: endOfDay(endDate) 
        });
      }
    });
  }, [transactions, timeFrame, startDate, endDate]);

  const categoryData = useMemo(() => {
    const data: Record<Category, number> = {} as any;
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    expenses.forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });

    return Object.entries(data).map(([name, value]) => ({
      value,
      color: CATEGORY_COLORS[name as Category],
      text: name,
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const barData = useMemo(() => {
    if (timeFrame === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const result = days.map(day => ({ label: day, value: 0 }));
      filteredTransactions.forEach(t => {
        if (t.type === 'expense') {
          result[new Date(t.date).getDay()].value += t.amount;
        }
      });
      return result.map(d => ({ ...d, frontColor: '#6366f1' }));
    } else {
      const labels = timeFrame === 'monthly' ? ['W1', 'W2', 'W3', 'W4'] : ['Q1', 'Q2', 'Q3', 'Q4'];
      return labels.map(l => ({ label: l, value: Math.random() * 1000, frontColor: '#6366f1' }));
    }
  }, [filteredTransactions, timeFrame]);

  const totalSpent = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  type TimeFrame = 'weekly' | 'monthly' | 'yearly' | 'custom';

  const TimeFrameButton = ({ type, label }: { type: TimeFrame, label: string }) => (
    <TouchableOpacity
      onPress={() => {
        setTimeFrame(type);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      className={`flex-1 py-3 items-center rounded-xl ${timeFrame === type ? 'bg-indigo-600' : 'bg-slate-800'}`}
    >
      <Text className={`font-bold ${timeFrame === type ? 'text-white' : 'text-slate-400'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-900" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-6 mb-6">Analysis</Text>

        <View className="flex-row bg-slate-800 p-1.5 rounded-2xl mb-4">
          <TimeFrameButton type="weekly" label="Week" />
          <TimeFrameButton type="monthly" label="Month" />
          <TimeFrameButton type="yearly" label="Year" />
          <TimeFrameButton type="custom" label="Custom" />
        </View>

        {timeFrame === 'custom' && (
          <View className="flex-row items-center justify-between mb-8 px-1">
            <TouchableOpacity 
              onPress={() => setShowPicker('start')}
              className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 items-center min-w-[140px]"
            >
              <Text className="text-slate-500 text-[10px] uppercase font-bold mb-1">From</Text>
              <Text className="text-white font-medium">{format(startDate, 'MMM dd, yyyy')}</Text>
            </TouchableOpacity>
            
            <View className="h-0.5 w-4 bg-slate-700" />

            <TouchableOpacity 
              onPress={() => setShowPicker('end')}
              className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 items-center min-w-[140px]"
            >
              <Text className="text-slate-500 text-[10px] uppercase font-bold mb-1">To</Text>
              <Text className="text-white font-medium">{format(endDate, 'MMM dd, yyyy')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showPicker && (
          <DateTimePicker
            value={showPicker === 'start' ? startDate : endDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowPicker(null);
              if (date) {
                if (showPicker === 'start') setStartDate(date);
                else setEndDate(date);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        <Card className="mb-6">
          <Text className="text-slate-400 text-sm font-medium mb-6">Total Spending</Text>
          <Text className="text-white text-3xl font-bold mb-8">{formatCurrency(totalSpent)}</Text>
          
          <BarChart
            data={barData}
            barWidth={22}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="#6366f1"
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelsVerticalShift={5}
            xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 10 }}
            yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
            hideRules
            isAnimated
          />
        </Card>

        <Card className="mb-6">
          <Text className="text-slate-400 text-sm font-medium mb-6">Category Breakdown</Text>
          <View className="items-center justify-center mb-8">
            <PieChart
              data={categoryData}
              donut
              radius={90}
              innerRadius={70}
              innerCircleColor={'#1e293b'}
              centerLabelComponent={() => (
                <View className="items-center justify-center">
                  <Text className="text-white text-lg font-bold">{Math.round(totalSpent)}</Text>
                  <Text className="text-slate-500 text-[10px] uppercase font-bold">Spent</Text>
                </View>
              )}
            />
          </View>

          <View className="flex-row flex-wrap justify-between">
            {categoryData.length > 0 ? categoryData.map((item, index) => (
              <View key={index} className="flex-row items-center w-[48%] mb-4">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                <View className="flex-1">
                  <Text className="text-slate-300 text-xs font-medium" numberOfLines={1}>{item.text}</Text>
                  <Text className="text-white text-xs font-bold">{Math.round((item.value / totalSpent) * 100)}%</Text>
                </View>
              </View>
            )) : (
              <Text className="text-slate-500 text-center w-full py-4">No data for this period</Text>
            )}
          </View>
        </Card>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
