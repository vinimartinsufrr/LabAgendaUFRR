import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

// Login e cadastro: quem já está logado é mandado para o início
export default function RotaPublica() {
  const { usuario, carregando } = useAuth();

  if (carregando) return <Spinner tela texto="Verificando sessão..." />;
  if (usuario) return <Navigate to="/" replace />;

  return <Outlet />;
}
