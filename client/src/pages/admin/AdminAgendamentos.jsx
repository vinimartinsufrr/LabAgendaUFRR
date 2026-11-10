import { useState } from 'react';
import api from '../../services/api';
import { useEventoSocket } from '../../contexts/SocketContext';
import useCarregar from '../../hooks/useCarregar';
import useAcoesAgendamento from '../../hooks/useAcoesAgendamento';
import Alerta from '../../components/Alerta';
import Spinner from '../../components/Spinner';
import AgendamentoItem from '../../components/AgendamentoItem';
import ConfirmarDialogo from '../../components/ConfirmarDialogo';

const FILTROS_VAZIOS = { laboratorio: '', data: '', status: '' };

// Todos os agendamentos do sistema, com filtros (somente admin)
export default function AdminAgendamentos() {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);

  const labs = useCarregar(() => api.get('/laboratorios').then((r) => r.data), [], { inicial: [] });

  // Envia só os filtros preenchidos
  const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v));
  const { dados, carregando, erro, recarregar } = useCarregar(
    () => api.get('/agendamentos', { params }).then((r) => r.data),
    [filtros.laboratorio, filtros.data, filtros.status],
    { inicial: [] }
  );
  const acoes = useAcoesAgendamento(() => recarregar({ silencioso: true }));

  // Tempo real: recarrega a lista quando algum agendamento muda
  useEventoSocket('agendamento:alterado', () => recarregar({ silencioso: true }));

  const alterar = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <h1>Todos os agendamentos</h1>
          <p className="texto-suave">{carregando ? 'Carregando...' : `${dados.length} resultado(s)`}</p>
        </div>
      </section>

      <div className="filtros">
        <select name="laboratorio" value={filtros.laboratorio} onChange={alterar} aria-label="Laboratório">
          <option value="">Todos os laboratórios</option>
          {labs.dados.map((l) => (
            <option key={l._id} value={l._id}>
              {l.nome}
            </option>
          ))}
        </select>
        <input type="date" name="data" value={filtros.data} onChange={alterar} aria-label="Data" />
        <select name="status" value={filtros.status} onChange={alterar} aria-label="Status">
          <option value="">Todos os status</option>
          <option value="confirmado">Confirmados</option>
          <option value="cancelado">Cancelados</option>
        </select>
        <button
          type="button"
          className="botao botao--contorno"
          onClick={() => setFiltros(FILTROS_VAZIOS)}
          disabled={!Object.keys(params).length}
        >
          Limpar
        </button>
      </div>

      <Alerta tipo={acoes.mensagem.tipo} aoFechar={acoes.limparMensagem}>
        {acoes.mensagem.texto}
      </Alerta>
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <Spinner texto="Carregando agendamentos..." />
      ) : (
        <div className="lista-agendamentos">
          {dados.map((ag) => (
            <AgendamentoItem
              key={ag._id}
              agendamento={ag}
              mostrarUsuario
              aoCancelar={acoes.pedirCancelamento}
              aoExcluir={acoes.pedirExclusao}
            />
          ))}
          {!erro && dados.length === 0 && <p className="vazio">Nenhum agendamento encontrado.</p>}
        </div>
      )}

      <ConfirmarDialogo
        {...acoes.dialogo}
        processando={acoes.processando}
        aoConfirmar={acoes.confirmar}
        aoFechar={acoes.fechar}
      />
    </>
  );
}
