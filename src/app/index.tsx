import React, { useEffect, useRef, useState } from 'react';
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

// Componente para animar a contagem do número do saldo
function AnimatedBalance({ value }: { value: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Adiciona listener para atualizar o texto do saldo dinamicamente
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

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Animações de Transição de Layout (Fade & Slide UP)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Animações das Barras de Gráfico
  const barAnim1 = useRef(new Animated.Value(0)).current;
  const barAnim2 = useRef(new Animated.Value(0)).current;

  // Animações acionadas ao carregar
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
      Animated.timing(barAnim1, {
        toValue: 70,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(barAnim2, {
        toValue: 35,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // Busca dados em tempo real no Firestore
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list: any[] = [];
        let income = 0;
        let expense = 0;

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const amountNum = Number(data.amount) || 0;

          if (data.type === 'income') {
            income += amountNum;
          } else {
            expense += amountNum;
          }

          list.push({
            id: docSnap.id,
            ...data,
            dateFormatted: data.date?.toDate
              ? data.date.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              : 'Hoje',
          });
        });

        setTransactions(list.slice(0, 5));
        setTotalIncome(income);
        setTotalExpense(expense);
        setTotalBalance(income - expense);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar transações:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Animated.View
        style={[
          styles.wrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Card do Saldo Total com Efeito de Contagem Dinâmica */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Seu saldo total</Text>
          <AnimatedBalance value={totalBalance} />
          <View style={styles.growthBadge}>
            <Text style={styles.growthText}>↗ +12.5% este mês</Text>
          </View>
        </View>

        {/* Cards de Entradas e Saídas */}
        <View style={styles.cardsGrid}>
          <View style={[styles.miniCard, { backgroundColor: '#A391EC' }]}>
            <Text style={styles.miniCardTitle}>Entradas</Text>
            <Text style={styles.miniCardValue}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={[styles.miniCard, { backgroundColor: '#18181B' }]}>
            <Text style={[styles.miniCardTitle, { color: '#A1A1AA' }]}>Saídas</Text>
            <Text style={[styles.miniCardValue, { color: '#FFFFFF' }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        {/* Gráfico de Categorias com Barras Animadas */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Análise de Categorias</Text>

          <View style={styles.barGroup}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabelText}>Alimentação</Text>
              <Text style={styles.barValueText}>R$ 450,20</Text>
            </View>
            <View style={styles.barBackground}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    width: barAnim1.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: '#7C65C1',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.barGroup}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabelText}>Lazer</Text>
              <Text style={styles.barValueText}>R$ 39,90</Text>
            </View>
            <View style={styles.barBackground}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    width: barAnim2.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: '#A391EC',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Lista de Transações com Efeito de Toque (Scale Feedback) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transações Recentes</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#7C65C1" style={{ marginTop: 20 }} />
        ) : transactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação cadastrada ainda.</Text>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.transactionCard,
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                ]}
              >
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
                      {item.category} • {item.dateFormatted}
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