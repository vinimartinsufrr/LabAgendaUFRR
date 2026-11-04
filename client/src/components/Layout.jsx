import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// Estrutura comum das páginas internas (usuário logado)
export default function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="conteudo container">
        <Outlet />
      </main>
      <footer className="rodape">
        LabAgenda UFRR · Vinicius Martins &amp; Jasmim Sabini · Arquitetura Web 2026
      </footer>
    </div>
  );
}
