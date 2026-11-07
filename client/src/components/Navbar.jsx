import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { para: '/', texto: 'Início', fim: true },
  { para: '/laboratorios', texto: 'Laboratórios' },
  { para: '/agendar', texto: 'Agendar' },
  { para: '/meus-agendamentos', texto: 'Meus agendamentos' },
  { para: '/admin', texto: 'Painel', admin: true },
];

export default function Navbar() {
  const { usuario, ehAdmin, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const sair = () => {
    logout();
    navigate('/login');
  };

  const fecharMenu = () => setMenuAberto(false);

  return (
    <header className="navbar">
      <div className="navbar__conteudo container">
        <Link to="/" className="navbar__marca" onClick={fecharMenu}>
          <img src="/favicon.svg" alt="" width="28" height="28" />
          LabAgenda <span>UFRR</span>
        </Link>

        <button
          type="button"
          className="navbar__hamburguer"
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__menu ${menuAberto ? 'navbar__menu--aberto' : ''}`}>
          {/* O link do painel só aparece para administradores */}
          {links
            .filter((link) => !link.admin || ehAdmin)
            .map((link) => (
              <NavLink key={link.para} to={link.para} end={link.fim} onClick={fecharMenu}>
                {link.texto}
              </NavLink>
            ))}

          <div className="navbar__usuario">
            <Link to="/perfil" className="navbar__nome" onClick={fecharMenu} title="Meu perfil">
              {usuario.nome.split(' ')[0]}
              <span className={`selo ${ehAdmin ? 'selo--admin' : ''}`}>{usuario.papel}</span>
            </Link>
            <button type="button" className="botao botao--contorno botao--pequeno" onClick={sair}>
              Sair
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
