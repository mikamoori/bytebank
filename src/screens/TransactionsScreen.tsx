import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;

export default function TransactionsScreen() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('Todas');

  const categories = ['Todas', 'Alimentação', 'Lazer', 'Trabalho', 'Transporte', 'Outros'];

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function buildQuery(afterDoc: any = null) {
    if (!user?.uid) return null;

    let constraints: any[] = [where('userId', '==', user.uid)];

    if (filterType !== 'all') {
      constraints.push(where('type', '==', filterType));
    }
    if (filterCategory !== 'Todas') {
      constraints.push(where('category', '==', filterCategory));
    }

    constraints.push(orderBy('date', 'desc'));
    constraints.push(limit(PAGE_SIZE));

    if (afterDoc) {
      constraints.push(startAfter(afterDoc));
    }

    return query(collection(db, 'transactions'), ...constraints);
  }

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    const q = buildQuery();
    if (!q) {
      setLoading(false);
      return;
    }

    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setTransactions(list);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setHasMore(snapshot.docs.length === PAGE_SIZE);
    setLoading(false);
  }, [user?.uid, filterType, filterCategory]);

  async function loadMore() {
    if (!hasMore || loadingMore || !lastDoc) return;

    setLoadingMore(true);
    const q = buildQuery(lastDoc);
    if (!q) {
      setLoadingMore(false);
      return;
    }

    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setTransactions((prev) => [...prev, ...list]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setHasMore(snapshot.docs.length === PAGE_SIZE);
    setLoadingMore(false);
  }

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  function formatDate(item: any) {
    return item.date?.toDate
      ? item.date.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      : '';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Transações</Text>

      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterChip, filterType === t && styles.filterChipActive]}
            onPress={() => setFilterType(t)}
          >
            <Text style={[styles.filterChipText, filterType === t && styles.filterChipTextActive]}>
              {t === 'all' ? 'Todas' : t === 'income' ? 'Entradas' : 'Saídas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        style={styles.categoryFilterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, filterCategory === item && styles.categoryChipActive]}
            onPress={() => setFilterCategory(item)}
          >
            <Text
              style={[
                styles.categoryChipText,
                filterCategory === item && styles.categoryChipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color="#7C65C1" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color="#7C65C1" style={{ marginVertical: 16 }} /> : null
          }
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: item.type === 'income' ? '#E2DCFF' : '#F4F2FF' },
                  ]}
                >
                  <Text style={styles.iconText}>{item.type === 'income' ? '↓' : '↑'}</Text>
                </View>
                <View>
                  <Text style={styles.transactionTitle}>{item.title}</Text>
                  <Text style={styles.transactionCategory}>
                    {item.category} • {formatDate(item)}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: item.type === 'income' ? '#16A34A' : '#18181B' },
                ]}
              >
                {item.type === 'income' ? '+' : '-'} {formatCurrency(Number(item.amount) || 0)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFFF',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#7C65C1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  categoryFilterList: {
    marginBottom: 16,
    maxHeight: 44,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F4F2FF',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#18181B',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 40,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C65C1',
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#71717A',
    fontSize: 14,
    marginTop: 30,
  },
});