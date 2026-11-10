import api from '../../services/api';
import useCarregar from '../../hooks/useCarregar';
import { useEventoSocket } from '../../contexts/SocketContext';
import Alerta from '../../components/Alerta';
import Spinner from '../../components/Spinner';
import { DIAS_SEMANA, deISO, formatarData } from '../../utils/datas';

function Indicador({ titulo, valor, detalhe }) {
  return (
    <div className="cartao indicador">
      <span className="indicador__titulo">{titulo}</span>
      <strong className="indicador__valor">{valor}</strong>
      {detalhe && <span className="texto-suave">{detalhe}</span>}
    </div>
  );
}

// Gráfico de barras simples (CSS) com os agendamentos dos próximos 7 dias
function GraficoProximosDias({ dias }) {
  const maximo = Math.max(1, ...dias.map((d) => d.total));

  return (
    <div className="grafico" role="img" aria-label="Agendamentos confirmados nos próximos 7 dias">
      {dias.map((d, i) => (
        <div
          key={d.data}
          className="grafico__coluna"
          title={`${formatarData(d.data)}: ${d.total} agendamento(s)`}
        >
          <span className="grafico__valor">{d.total}</span>
          <div className="grafico__trilho">
            <div className="grafico__barra" style={{ height: `${(d.total / maximo) * 100}%` }} />
          </div>
          <span className="grafico__rotulo">{i === 0 ? 'Hoje' : DIAS_SEMANA[deISO(d.data).getDay()]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { dados, carregando, erro, recarregar } = useCarregar(() => api.get('/dashboard').then((r) => r.data));

  // Tempo real: os indicadores se atualizam a cada agendamento criado/cancelado
  useEventoSocket('agendamento:alterado', () => recarregar({ silencioso: true }));

  if (carregando) return <Spinner texto="Carregando indicadores..." />;
  if (erro) return <Alerta>{erro}</Alerta>;

  const maiorRanking = Math.max(1, ...dados.maisAgendados.map((l) => l.total));

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <h1>Dashboard</h1>
          <p className="texto-suave">Visão geral do uso dos laboratórios.</p>
        </div>
      </section>

      <section className="indicadores">
        <Indicador titulo="Agendamentos hoje" valor={dados.agendamentosHoje} />
        <Indicador titulo="Confirmados" valor={dados.agendamentosConfirmados} detalhe="no total" />
        <Indicador titulo="Cancelados" valor={dados.agendamentosCancelados} detalhe="no total" />
        <Indicador
          titulo="Laboratórios ativos"
          valor={dados.laboratoriosAtivos}
          detalhe={`de ${dados.totalLaboratorios} cadastrados`}
        />
        <Indicador titulo="Usuários" valor={dados.totalUsuarios} />
      </section>

      <section className="grade-dashboard">
        <div className="cartao">
          <h3>Próximos 7 dias</h3>
          <p className="texto-suave">Agendamentos confirmados por dia</p>
          <GraficoProximosDias dias={dados.proximosDias} />
        </div>

        <div className="cartao">
          <h3>Laboratórios mais agendados</h3>
          {dados.maisAgendados.length === 0 && <p className="vazio">Ainda não há agendamentos.</p>}
          <ol className="ranking">
            {dados.maisAgendados.map((lab) => (
              <li key={lab._id}>
                <div className="ranking__texto">
                  <span>{lab.nome}</span>
                  <strong>{lab.total}</strong>
                </div>
                <div className="ranking__trilho">
                  <div className="ranking__barra" style={{ width: `${(lab.total / maiorRanking) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
