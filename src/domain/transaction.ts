export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  userId: string;
  title: string;
  category: string;
  date: Date;
  amount: number;
  type: TransactionType;
}