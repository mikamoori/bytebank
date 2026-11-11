
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({
  onSwitchToLogin,
}: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      await register(email.trim(), password);

    } catch (err: unknown) {
      console.log('ERRO NO CADASTRO:', err);

      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err
      ) {
        const firebaseError = err as { code: string };

        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            setError('Este e-mail já está cadastrado.');
            break;

          case 'auth/invalid-email':
            setError('O endereço de e-mail é inválido.');
            break;

          case 'auth/weak-password':
            setError('A senha deve ter pelo menos 6 caracteres.');
            break;

          case 'auth/operation-not-allowed':
            setError('O cadastro por e-mail está desabilitado.');
            break;

          case 'auth/network-request-failed':
            setError('Erro de conexão. Verifique sua internet.');
            break;

          default:
            setError('Não foi possível criar sua conta. Tente novamente.');
        }
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.brandText}>ByteBank</Text>

            <View style={styles.arrowBadge}>
              <Text style={styles.arrowText}>↗</Text>
            </View>
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.subtitleStep}>Account creation</Text>

            <Text style={styles.mainTitle}>
              Create an{'\n'}account to start{'\n'}managing your{'\n'}finances.
            </Text>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>

              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#A1A1AA"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>

              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A1A1AA"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoComplete="new-password"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>

              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A1A1AA"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoComplete="new-password"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign up</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={onSwitchToLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={styles.switchTextBold}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 32,
    shadowColor: '#5C4A9E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181B',
    letterSpacing: -0.5,
  },
  arrowBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#52525B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerSection: {
    marginBottom: 28,
  },
  subtitleStep: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A080D0',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#18181B',
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#F4F2FF',
    borderWidth: 1,
    borderColor: '#E2DCFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#18181B',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 54,
    backgroundColor: '#7C65C1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#7C65C1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#BBAFE6',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  errorText: {
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    marginLeft: 4,
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500',
  },
  switchTextBold: {
    color: '#7C65C1',
    fontWeight: '700',
  },
});
