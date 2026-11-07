import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import useCarregar from '../hooks/useCarregar';
import Alerta from '../components/Alerta';
import Spinner from '../components/Spinner';
import { formatarData, formatarIntervalo } from '../utils/datas';

export default function Inicio() {
  const { usuario, ehAdmin } = useAuth();

  // Admin recebe todos os agendamentos; aqui mostramos só os do próprio usuário
  const { dados, carregando, erro } = useCarregar(
    () =>
      api
        .get('/agendamentos', { params: { periodo: 'futuros', status: 'confirmado', usuario: usuario._id } })
        .then((r) => r.data.slice(0, 5)),
    [usuario._id],
    { inicial: [] }
  );

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <h1>Olá, {usuario.nome.split(' ')[0]}!</h1>
          <p className="texto-suave">
            Você entrou como <strong>{ehAdmin ? 'administrador' : 'usuário'}</strong>.
          </p>
        </div>
        <Link to="/agendar" className="botao">
          + Novo agendamento
        </Link>
      </section>

      <section className="grade-inicio">
        <div className="cartao">
          <div className="cartao__topo">
            <h3>Seus próximos agendamentos</h3>
            <Link to="/meus-agendamentos">Ver todos</Link>
          </div>

          <Alerta>{erro}</Alerta>
          {carregando && <Spinner />}
          {!carregando && !erro && dados.length === 0 && (
            <p className="vazio">
              Nenhum agendamento futuro. <Link to="/agendar">Agende agora</Link>.
            </p>
          )}
          <ul className="lista-simples">
            {dados.map((ag) => (
              <li key={ag._id}>
                <strong>{ag.laboratorio?.nome}</strong>
                <span className="texto-suave">
                  {formatarData(ag.data)} · {formatarIntervalo(ag.horaInicio, ag.horaFim)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="atalhos">
          <Link to="/laboratorios" className="cartao cartao--link">
            <h3>Laboratórios</h3>
            <p className="texto-suave">Veja capacidade, recursos e horários de cada laboratório.</p>
          </Link>
          {ehAdmin && (
            <Link to="/admin" className="cartao cartao--link cartao--destaque">
              <h3>Painel administrativo</h3>
              <p className="texto-suave">Indicadores, todos os agendamentos e gestão de usuários.</p>
            </Link>
          )}
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
        </div>
      </section>
    </>
  );
}
