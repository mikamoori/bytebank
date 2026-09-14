import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser((prevUser: any) => {
        // Mantém o usuário dev se ele estiver logado via PIN
        if (prevUser?.isDev) return prevUser;
        return currentUser;
      });
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Função de Acesso Dev ativada pelo digito 1
  function loginAsDev() {
    setUser({
      uid: 'dev-user-id',
      email: 'dev@bytebank.com',
      displayName: 'Desenvolvedor',
      isDev: true,
    });
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.log('Erro ao sair:', e);
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, loginAsDev }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}