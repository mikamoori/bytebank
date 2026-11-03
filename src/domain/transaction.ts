export interface Transaction {
  id?: string;
  userId: string;
  category: string;
  date: Date;
  amount: number;
  type: string;
  description?: string;
}