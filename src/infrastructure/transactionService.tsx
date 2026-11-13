import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { Transaction } from '../../domain/transaction';

const COLLECTION_NAME = 'transactions';

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...transaction,
    date: Timestamp.fromDate(transaction.date || new Date()),
  });
};

export const getTransactions = async (
  userId: string,
  category?: string
): Promise<Transaction[]> => {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  if (category && category !== 'Todas') {
    q = query(q, where('category', '==', category));
  }

  const querySnapshot = await getDocs(q);
  const transactions: Transaction[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    transactions.push({
      id: doc.id,
      ...data,
      date: data.date ? data.date.toDate() : new Date(),
    } as Transaction);
  });

  return transactions;
};