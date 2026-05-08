export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Health' 
  | 'Education' 
  | 'Salary'
  | 'Business'
  | 'Freelance'
  | 'Investment'
  | 'Gift'
  | 'Other';

export type PaymentMethod = 'Cash' | 'Card' | 'Transfer' | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  note: string;
  date: string; // ISO string
  paymentMethod: PaymentMethod;
  imageUri?: string;
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface UserSettings {
  currency: string;
  isDarkMode: boolean;
  biometricsEnabled: boolean;
}
