import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import RotaPrivada from './components/RotaPrivada';
import RotaPublica from './components/RotaPublica';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Inicio from './pages/Inicio';
import Laboratorios from './pages/Laboratorios';
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
          <Route path="/acesso-negado" element={<AcessoNegado />} />
        </Route>
      </Route>

      <Route path="*" element={<NaoEncontrado />} />
    </Routes>
  );
}
