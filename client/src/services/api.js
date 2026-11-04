import axios from 'axios';

export const TOKEN_KEY = 'labagenda:token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
});

// Anexa o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirar no meio do uso, avisa o AuthContext para deslogar
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const rotaDeAuth = erro.config?.url?.startsWith('/auth/');
    if (erro.response?.status === 401 && !rotaDeAuth) {
      window.dispatchEvent(new Event('auth:expirada'));
    }
    return Promise.reject(erro);
  }
);

export default api;
