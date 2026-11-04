import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

// Guarda quem está logado e o papel dele, disponível para toda a aplicação
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // true enquanto confere se o token salvo ainda é válido (evita "piscar" a tela de login)
  const [carregando, setCarregando] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }, []);

  // Ao abrir o site, recupera a sessão a partir do token salvo
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setCarregando(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => setUsuario(data))
      .catch(logout)
      .finally(() => setCarregando(false));
  }, [logout]);

  // O interceptor do axios dispara este evento quando a API responde 401
  useEffect(() => {
    window.addEventListener('auth:expirada', logout);
    return () => window.removeEventListener('auth:expirada', logout);
  }, [logout]);

  const salvarSessao = ({ usuario: dados, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUsuario(dados);
    return dados;
  };

  const login = useCallback(async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha });
    return salvarSessao(data);
  }, []);

  const registrar = useCallback(async (dados) => {
    const { data } = await api.post('/auth/registro', dados);
    return salvarSessao(data);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      carregando,
      logado: !!usuario,
      ehAdmin: usuario?.papel === 'admin',
      login,
      registrar,
      logout,
      setUsuario,
    }),
    [usuario, carregando, login, registrar, logout]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return contexto;
}
