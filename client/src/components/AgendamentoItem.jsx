import { Link } from 'react-router-dom';
import StatusSelo from './StatusSelo';
import { formatarData, formatarIntervalo, jaPassou } from '../utils/datas';

// Linha/cartão de um agendamento com as ações permitidas
export default function AgendamentoItem({ agendamento, mostrarUsuario = false, aoCancelar, aoExcluir }) {
  const ativo = agendamento.status === 'confirmado' && !jaPassou(agendamento.data, agendamento.horaInicio);

  return (
    <article className="agendamento">
      <div className="agendamento__data">
        <strong>{agendamento.data.slice(8)}</strong>
        <span>{formatarData(agendamento.data, { semana: false }).slice(3)}</span>
      </div>

      <div className="agendamento__info">
        <div className="agendamento__titulo">
          <h3>{agendamento.laboratorio?.nome || 'Laboratório removido'}</h3>
          <StatusSelo agendamento={agendamento} />
        </div>
        <p className="texto-suave">
          {formatarData(agendamento.data)} · {formatarIntervalo(agendamento.horaInicio, agendamento.horaFim)}
          {agendamento.laboratorio?.bloco && ` · ${agendamento.laboratorio.bloco}`}
        </p>
        <p className="agendamento__motivo">{agendamento.motivo}</p>
        {mostrarUsuario && agendamento.usuario && (
          <p className="texto-suave agendamento__usuario">
            {agendamento.usuario.nome} · {agendamento.usuario.email}
          </p>
        )}
      </div>

      <div className="agendamento__acoes">
        {ativo && (
          <Link to={`/agendamentos/${agendamento._id}/editar`} className="botao botao--contorno botao--pequeno">
            Editar
          </Link>
        )}
        {ativo && aoCancelar && (
          <button
            type="button"
            className="botao botao--contorno botao--pequeno botao--texto-perigo"
            onClick={() => aoCancelar(agendamento)}
          >
            Cancelar
          </button>
        )}
        {aoExcluir && (
          <button type="button" className="botao botao--perigo botao--pequeno" onClick={() => aoExcluir(agendamento)}>
            Excluir
          </button>
        )}
      </div>
    </article>
  );
}
