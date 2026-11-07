import { NavLink, Outlet } from 'react-router-dom';

// Abas do painel administrativo
export default function AdminLayout() {
  return (
    <>
      <nav className="abas abas--links" aria-label="Painel administrativo">
        <NavLink to="/admin" end className="aba">
          Dashboard
        </NavLink>
        <NavLink to="/admin/agendamentos" className="aba">
          Agendamentos
        </NavLink>
        <NavLink to="/admin/usuarios" className="aba">
          Usuários
        </NavLink>
      </nav>
      <Outlet />
    </>
  );
}
