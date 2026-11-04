import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Inicio() {
  const { usuario, ehAdmin } = useAuth();

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <h1>Olá, {usuario.nome.split(' ')[0]}!</h1>
          <p className="texto-suave">
            Você entrou como <strong>{ehAdmin ? 'administrador' : 'usuário'}</strong>.
          </p>
        </div>
      </section>

      <section className="grade-cartoes">
        <Link to="/laboratorios" className="cartao cartao--link">
          <h3>Laboratórios</h3>
          <p className="texto-suave">Veja os laboratórios disponíveis, capacidade e recursos.</p>
        </Link>

        <div className="cartao">
          <h3>Minha conta</h3>
          <dl className="lista-dados">
            <dt>E-mail</dt>
            <dd>{usuario.email}</dd>
            {usuario.matricula && (
              <>
                <dt>Matrícula</dt>
                <dd>{usuario.matricula}</dd>
              </>
            )}
            <dt>Nível de acesso</dt>
            <dd>{usuario.papel}</dd>
          </dl>
        </div>
      </section>
    </>
  );
}
