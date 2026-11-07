import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import RotaPrivada from './components/RotaPrivada';
import RotaPublica from './components/RotaPublica';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Inicio from './pages/Inicio';
import Laboratorios from './pages/Laboratorios';
import LaboratorioForm from './pages/LaboratorioForm';
import Agendar from './pages/Agendar';
import MeusAgendamentos from './pages/MeusAgendamentos';
import Perfil from './pages/Perfil';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminAgendamentos from './pages/admin/AdminAgendamentos';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AcessoNegado from './pages/AcessoNegado';
import NaoEncontrado from './pages/NaoEncontrado';

export default function App() {
  return (
    <Routes>
      {/* Só para quem NÃO está logado */}
      <Route element={<RotaPublica />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      {/* Qualquer usuário logado */}
      <Route element={<RotaPrivada />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/laboratorios" element={<Laboratorios />} />
          <Route path="/agendar" element={<Agendar />} />
          <Route path="/agendamentos/:id/editar" element={<Agendar />} />
          <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/acesso-negado" element={<AcessoNegado />} />

          {/* Somente administradores */}
          <Route element={<RotaPrivada papeis={['admin']} />}>
            <Route path="/laboratorios/novo" element={<LaboratorioForm />} />
            <Route path="/laboratorios/:id/editar" element={<LaboratorioForm />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="agendamentos" element={<AdminAgendamentos />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NaoEncontrado />} />
    </Routes>
  );
}
