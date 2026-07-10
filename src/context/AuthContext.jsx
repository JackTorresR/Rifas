import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      if (user) {
        // A coleção "admins" guarda um documento cujo ID é o UID de cada
        // administrador autorizado. Isso evita a necessidade de um backend
        // próprio para gerenciar permissões (custom claims).
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        setIsAdmin(adminSnap.exists());
      } else {
        setIsAdmin(false);
      }
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  async function entrar(email, senha) {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  async function sair() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ usuario, isAdmin, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}
