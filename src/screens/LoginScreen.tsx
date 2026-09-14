import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devPin, setDevPin] = useState('');
  const [showDevInput, setShowDevInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loginAsDev } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Erro no Login', error.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevSubmit = () => {
    if (devPin.trim() === '1') {
      loginAsDev();
    } else {
      Alert.alert('Código incorreto', 'O código de desenvolvedor informado não é válido.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bytebank</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        {!showDevInput ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#A1A1AA"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#A1A1AA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devButton}
              onPress={() => setShowDevInput(true)}
            >
              <Text style={styles.devButtonText}> Entrar como Dev </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={onSwitchToRegister}>
              <Text style={styles.switchText}>
                Não tem uma conta? <Text style={styles.switchTextBold}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.devContainer}>
            <Text style={styles.devTitle}>Acesso Livre Desenvolvedor</Text>
            <Text style={styles.devSubtitle}>Digite o pin para acessar o sistema:</Text>

            <TextInput
              style={[styles.input, { textAlign: 'center', fontSize: 18, fontWeight: '700' }]}
              placeholder="Digite o pin"
              placeholderTextColor="#A1A1AA"
              value={devPin}
              onChangeText={setDevPin}
              keyboardType="numeric"
              maxLength={1}
            />

            <TouchableOpacity style={styles.button} onPress={handleDevSubmit}>
              <Text style={styles.buttonText}>Acessar Página Inicial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setShowDevInput(false);
                setDevPin('');
              }}
            >
              <Text style={styles.backButtonText}>← Voltar para Login Normal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#5C4A9E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7C65C1',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717A',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: '#F4F2FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#18181B',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    backgroundColor: '#7C65C1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  devButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#E2DCFF',
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  devButtonText: {
    color: '#7C65C1',
    fontSize: 13,
    fontWeight: '700',
  },
  devContainer: {
    width: '100%',
    alignItems: 'center',
  },
  devTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 4,
  },
  devSubtitle: {
    fontSize: 13,
    color: '#71717A',
    marginBottom: 16,
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    color: '#7C65C1',
    fontSize: 13,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
  },
  switchText: {
    color: '#71717A',
    fontSize: 13,
  },
  switchTextBold: {
    color: '#7C65C1',
    fontWeight: '700',
  },
});