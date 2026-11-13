import { create } from 'zustand';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Transaction, TransactionType } from '../domain/transaction';
import { getTransactionsPage } from './store/transactionService';

type FilterType = 'all' | TransactionType;

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  filterType: FilterType;
  filterCategory: string;
  setFilterType: (type: FilterType) => void;
  setFilterCategory: (category: string) => void;
  loadFirstPage: (userId: string) => Promise<void>;
  loadMore: (userId: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: true,
  loadingMore: false,
  hasMore: true,
  lastDoc: null,
  filterType: 'all',
  filterCategory: 'Todas',

  setFilterType: (filterType) => set({ filterType }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),

  loadFirstPage: async (userId) => {
    set({ loading: true });
    try {
      const { filterType, filterCategory } = get();
      const page = await getTransactionsPage(userId, filterType, filterCategory);
      set({
        transactions: page.items,
        lastDoc: page.lastDoc,
        hasMore: page.hasMore,
      });
    } finally {
      set({ loading: false });
    }
  },

  loadMore: async (userId) => {
    const { hasMore, loadingMore, lastDoc, filterType, filterCategory } = get();
    if (!hasMore || loadingMore || !lastDoc) return;

    set({ loadingMore: true });
    try {
      const page = await getTransactionsPage(
        userId,
        filterType,
        filterCategory,
        lastDoc
      );
      set((state) => ({
        transactions: [...state.transactions, ...page.items],
        lastDoc: page.lastDoc,
        hasMore: page.hasMore,
      }));
    } finally {
      set({ loadingMore: false });
    }
  },
}));