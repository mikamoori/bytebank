import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

function CustomHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.navLinks}>
          <TouchableOpacity
            style={[styles.navButton, pathname === '/' && styles.activeNavButton]}
            onPress={() => router.push('/')}
          >
            <Text style={[styles.navText, pathname === '/' && styles.activeNavText]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, pathname === '/explore' && styles.activeNavButton]}
            onPress={() => router.push('/explore')}
          >
            <Text style={[styles.navText, pathname === '/explore' && styles.activeNavText]}>
              Nova
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, pathname === '/transactions' && styles.activeNavButton]}
            onPress={() => router.push('/transactions')}
          >
            <Text style={[styles.navText, pathname === '/transactions' && styles.activeNavText]}>
              Transações
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair ↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MainNavigation() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = React.useState(false);

  if (loading) return null;

  // Proteção Global de Rotas: se não estiver logado, bloqueia Explore e Transactions
  if (!user) {
    return showRegister ? (
      <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EFFF' }}>
      <CustomHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          animation: 'fade',
          sceneStyle: { backgroundColor: '#F1EFFF' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="explore" options={{ title: 'Nova' }} />
        <Tabs.Screen name="transactions" options={{ title: 'Transações' }} />
      </Tabs>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F1EFFF',
    zIndex: 10,
  },
  headerContent: {
    width: '100%',
    maxWidth: 480,
    height: 52,
    backgroundColor: '#7C65C1',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  activeNavButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  navText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '600',
  },
  activeNavText: {
    color: '#FFFFFF',
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  logoutText: {
    color: '#7C65C1',
    fontSize: 12,
    fontWeight: '700',
  },
});