import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category } from '../types';
import { DUMMY_TRANSACTIONS } from '../constants/dummyData';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  resetTransactions: () => void;
  getTotalBalance: () => number;
  getIncome: () => number;
  getExpenses: () => number;
  getTransactionsByCategory: (category: Category) => Transaction[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: DUMMY_TRANSACTIONS,
      
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Math.random().toString(36).substring(2, 9),
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      updateTransaction: (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          ),
        }));
      },

      resetTransactions: () => set({ transactions: [] }),

      getTotalBalance: () => {
        const { transactions } = get();
        return transactions.reduce((acc, t) => {
          return t.type === 'income' ? acc + t.amount : acc - t.amount;
        }, 0);
      },

      getIncome: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => acc + t.amount, 0);
      },

      getExpenses: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0);
      },

      getTransactionsByCategory: (category) => {
        const { transactions } = get();
        return transactions.filter((t) => t.category === category);
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
