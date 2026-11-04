import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

// Protege rotas no frontend. Sem login -> /login. Papel errado -> /acesso-negado.
// (A proteção de verdade está no backend; aqui é para a navegação fazer sentido.)
export default function RotaPrivada({ papeis }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <Spinner tela texto="Verificando sessão..." />;

  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  if (papeis && !papeis.includes(usuario.papel)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <Outlet />;
}
