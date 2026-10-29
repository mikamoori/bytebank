import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const COLLECTION_NAME = 'transactions';

export const addTransaction = async (transaction: any) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...transaction,
    date: Timestamp.fromDate(transaction.date),
  });
};

export const getTransactions = async (userId: any, category: any) => {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  if (category && category !== 'Todas') {
    q = query(q, where('category', '==', category));
  }

  const querySnapshot = await getDocs(q);
  const transactions: any[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    transactions.push({
      id: doc.id,
      ...data,
      date: data.date ? data.date.toDate() : new Date(),
    });
  });

  return transactions;
};

import React from 'react';
import { View, Text } from 'react-native';

export default function TransactionsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Tela de Transações</Text>
    </View>
  );
}