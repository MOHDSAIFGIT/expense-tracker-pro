import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert } from 'react-native';
import { 
  User, 
  Bell, 
  ShieldCheck, 
  Database, 
  Download, 
  Trash2, 
  ChevronRight,
  CreditCard,
  Moon,
  Info
} from 'lucide-react-native';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useTransactionStore } from '../../src/store/useTransactionStore';
import { COLORS } from '../../src/constants/colors';
import { Card } from '../../src/components/Card';
import * as Haptics from 'expo-haptics';

export default function Settings() {
  const { currency, setCurrency, isDarkMode, toggleDarkMode, biometricsEnabled, setBiometricsEnabled } = useSettingsStore();
  const { resetTransactions } = useTransactionStore();

  const handleResetData = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Reset Data',
      'Are you sure you want to delete all transactions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetTransactions();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, isSwitch, switchValue, onSwitchChange }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isSwitch}
      className="flex-row items-center justify-between py-4 border-b border-slate-700/50"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center mr-4">
          <Icon size={20} color={COLORS.primary} />
        </View>
        <Text className="text-slate-200 font-medium text-base">{label}</Text>
      </View>
      
      {isSwitch ? (
        <Switch 
          value={switchValue} 
          onValueChange={onSwitchChange}
          trackColor={{ false: '#334155', true: '#6366f1' }}
          thumbColor={COLORS.white}
        />
      ) : (
        <View className="flex-row items-center">
          {value && <Text className="text-slate-500 mr-2">{value}</Text>}
          <ChevronRight size={18} color={COLORS.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-6">Settings</Text>
        <View className="items-center mt-8 mb-8">
          <View className="w-24 h-24 rounded-full bg-indigo-600/20 items-center justify-center border-2 border-indigo-500/30 mb-4">
            <User size={48} color={COLORS.primary} />
          </View>
          <Text className="text-white text-xl font-bold">Premium User</Text>
          <Text className="text-slate-500 text-sm">premium@example.com</Text>
        </View>

        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 ml-1">General</Text>
        <Card className="p-0 px-4 mb-8">
          <SettingItem 
            icon={CreditCard} 
            label="Currency" 
            value={currency} 
            onPress={() => {
              const next = currency === 'USD' ? 'EUR' : currency === 'EUR' ? 'GBP' : 'USD';
              setCurrency(next);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }} 
          />
          <SettingItem 
            icon={Moon} 
            label="Dark Mode" 
            isSwitch 
            switchValue={isDarkMode} 
            onSwitchChange={() => {
              toggleDarkMode();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }} 
          />
          <SettingItem icon={Bell} label="Notifications" />
        </Card>

        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Security</Text>
        <Card className="p-0 px-4 mb-8">
          <SettingItem 
            icon={ShieldCheck} 
            label="Biometric Lock" 
            isSwitch 
            switchValue={biometricsEnabled} 
            onSwitchChange={setBiometricsEnabled} 
          />
        </Card>

        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Data</Text>
        <Card className="p-0 px-4 mb-8">
          <SettingItem icon={Download} label="Export CSV" />
          <SettingItem icon={Database} label="Backup Data" />
          <SettingItem 
            icon={Trash2} 
            label="Clear All Data" 
            onPress={handleResetData}
            labelClassName="text-red-400"
          />
        </Card>

        <TouchableOpacity 
          className="flex-row items-center justify-center py-8"
          onPress={() => {}}
        >
          <Info size={16} color={COLORS.textMuted} />
          <Text className="text-slate-500 text-xs ml-2">Expense Tracker Pro v1.0.0</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
