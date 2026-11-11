
import React, { useEffect, useRef, useState, useMemo } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Transaction, TransactionType } from '../domain/transaction';

interface DashboardTransaction extends Transaction {
  dateFormatted: string;
}

function AnimatedBalance({ value }: { value: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value: val }) => {
      setDisplayValue(val);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value]);

  return (
    <Text style={styles.balanceValue}>
      {displayValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}
    </Text>
  );
}

function AnimatedBar({ percentage }: { percentage: number }) {
  const animatedWidth = React.useRef(
    new Animated.Value(0)
  ).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <Animated.View
      style={[
        styles.barFill,
        {
          width: animatedWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        },
      ]}
    />
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

 
  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list: DashboardTransaction[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();

          const transactionDate = data.date?.toDate
            ? data.date.toDate()
            : data.date instanceof Date
              ? data.date
              : new Date();

          const type: TransactionType =
            data.type === 'income' ? 'income' : 'expense';

          list.push({
            id: docSnap.id,
            userId: data.userId,
            title: String(data.title ?? 'Transação'),
            category: String(data.category ?? 'Sem categoria'),
            amount: Math.abs(Number(data.amount) || 0),
            type,
            date: transactionDate,
            dateFormatted: transactionDate.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            }),
          });
        });

        // Ordena da transação mais recente para a mais antiga
        list.sort((a, b) => b.date.getTime() - a.date.getTime());

        setTransactions(list);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar transações:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

 
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expense += transaction.amount;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
    };
  }, [transactions]);

  const totalBalance = totalIncome - totalExpense;

 
  const categoryExpenses = useMemo(() => {
    const categories: Record<string, number> = {};

    transactions.forEach((transaction) => {
      if (transaction.type !== 'expense') return;

      const category = transaction.category || 'Sem categoria';

      categories[category] =
        (categories[category] || 0) + transaction.amount;
    });

    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  
  const maxCategoryExpense = Math.max(
    ...categoryExpenses.map((item) => item.amount),
    0
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View
        style={[
          styles.wrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
      
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Seu saldo total</Text>

          <AnimatedBalance value={totalBalance} />

          <View style={styles.growthBadge}>
            <Text style={styles.growthText}>
              Entradas - Saídas
            </Text>
          </View>
        </View>

    
        <View style={styles.cardsGrid}>
          <View
            style={[
              styles.miniCard,
              { backgroundColor: '#A391EC' },
            ]}
          >
            <Text style={styles.miniCardTitle}>Entradas</Text>
            <Text style={styles.miniCardValue}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          <View
            style={[
              styles.miniCard,
              { backgroundColor: '#18181B' },
            ]}
          >
            <Text
              style={[
                styles.miniCardTitle,
                { color: '#A1A1AA' },
              ]}
            >
              Saídas
            </Text>

            <Text
              style={[
                styles.miniCardValue,
                { color: '#FFFFFF' },
              ]}
            >
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

      
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>
            Análise de Categorias
          </Text>

          {loading ? (
            <ActivityIndicator
              color="#7C65C1"
              style={{ marginTop: 20 }}
            />
          ) : categoryExpenses.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma despesa cadastrada para analisar.
            </Text>
          ) : (
            categoryExpenses.map((item) => {
              const percentage =
                maxCategoryExpense > 0
                  ? (item.amount / maxCategoryExpense) * 100
                  : 0;

              return (
                <View
                  key={item.category}
                  style={styles.barGroup}
                >
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabelText}>
                      {item.category}
                    </Text>

                    <Text style={styles.barValueText}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>

                  <View style={styles.barBackground}>
  <AnimatedBar percentage={percentage} />
</View>
                </View>
              );
            })
          )}
        </View>

   
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Transações Recentes
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            color="#7C65C1"
            style={{ marginTop: 20 }}
          />
        ) : transactions.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhuma transação cadastrada ainda.
          </Text>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.slice(0, 5).map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.transactionCard,
                  pressed && {
                    transform: [{ scale: 0.98 }],
                    opacity: 0.9,
                  },
                ]}
              >
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          item.type === 'income'
                            ? '#E2DCFF'
                            : '#F4F2FF',
                      },
                    ]}
                  >
                    <Text style={styles.iconText}>
                      {item.type === 'income' ? '↓' : '↑'}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.transactionTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.transactionCategory}>
                      {item.category} • {item.dateFormatted}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color:
                        item.type === 'income'
                          ? '#16A34A'
                          : '#18181B',
                    },
                  ]}
                >
                  {item.type === 'income' ? '+' : '-'}{' '}
                  {formatCurrency(item.amount)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFFF',
  },

  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  wrapper: {
    width: '100%',
    maxWidth: 420,
  },

  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#5C4A9E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },

  balanceLabel: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
    marginBottom: 6,
  },

  balanceValue: {
    fontSize: 34,
    fontWeight: '700',
    color: '#18181B',
    letterSpacing: -1,
    marginBottom: 12,
  },

  growthBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  growthText: {
    fontSize: 12,
    color: '#7C65C1',
    fontWeight: '600',
  },

  cardsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  miniCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    height: 110,
  },

  miniCardTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  miniCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
  },

  barGroup: {
    marginTop: 14,
  },

  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  barLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18181B',
    flexShrink: 1,
    marginRight: 8,
  },

  barValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },

  barBackground: {
    height: 10,
    backgroundColor: '#F4F2FF',
    borderRadius: 5,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    backgroundColor: '#7C65C1',
    borderRadius: 5,
  },

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
    letterSpacing: -0.3,
  },

  transactionsList: {
    gap: 12,
  },

  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
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
    marginVertical: 20,
  },
});
