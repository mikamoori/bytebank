import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Garante um ID válido mesmo se estiver logado via Dev Mode (PIN "1")
  const currentUserId = user?.uid || 'dev-user-123';

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
            dateFormatted: data.date?.toDate
              ? data.date.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : 'Hoje',
          });
        });
        setTransactions(list);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar transações:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const handleDelete = (id: string) => {
    Alert.alert('Excluir Transação', 'Tem certeza que deseja apagar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'transactions', id));
          } catch (e) {
            console.error('Erro ao deletar:', e);
          }
        },
      },
    ]);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase()) ||
                          t.category?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (val: number) => {
    return (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.wrapper}>
        <Text style={styles.pageTitle}>Histórico de Transações</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por título ou categoria..."
          placeholderTextColor="#A1A1AA"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.activeFilterChip]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'income' && styles.activeFilterChip]}
            onPress={() => setFilterType('income')}
          >
            <Text style={[styles.filterText, filterType === 'income' && styles.activeFilterText]}>Entradas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'expense' && styles.activeFilterChip]}
            onPress={() => setFilterType('expense')}
          >
            <Text style={[styles.filterText, filterType === 'expense' && styles.activeFilterText]}>Saídas</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#7C65C1" style={{ marginTop: 24 }} />
        ) : filteredTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        ) : (
          <View style={styles.list}>
            {filteredTransactions.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={[styles.icon, { backgroundColor: item.type === 'income' ? '#E2DCFF' : '#F4F2FF' }]}>
                    <Text style={styles.iconText}>{item.type === 'income' ? '↓' : '↑'}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardCategory}>{item.category} • {item.dateFormatted}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.cardAmount, { color: item.type === 'income' ? '#16A34A' : '#18181B' }]}>
                    {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFFF',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: 420,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
    color: '#18181B',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2DCFF',
  },
  activeFilterChip: {
    backgroundColor: '#7C65C1',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C65C1',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
  },
  cardCategory: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 2,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#71717A',
    fontSize: 14,
    marginVertical: 20,
  },
});