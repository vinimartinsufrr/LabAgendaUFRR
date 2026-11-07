import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import useCarregar from '../hooks/useCarregar';
import useAcoesAgendamento from '../hooks/useAcoesAgendamento';
import Alerta from '../components/Alerta';
import Spinner from '../components/Spinner';
import AgendamentoItem from '../components/AgendamentoItem';
import ConfirmarDialogo from '../components/ConfirmarDialogo';

const ABAS = [
  { valor: 'futuros', texto: 'Próximos' },
  { valor: 'passados', texto: 'Histórico' },
];

export default function MeusAgendamentos() {
  const location = useLocation();
  const [aba, setAba] = useState('futuros');
  const [sucesso, setSucesso] = useState(location.state?.sucesso || '');

  const { usuario } = useAuth();

  // O filtro "usuario" faz o admin também ver só os dele aqui (os de todos ficam no painel)
  const { dados, carregando, erro, recarregar } = useCarregar(
    () => api.get('/agendamentos', { params: { periodo: aba, usuario: usuario._id } }).then((r) => r.data),
    [aba],
    { inicial: [] }
  );
  const acoes = useAcoesAgendamento(() => recarregar({ silencioso: true }));

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <h1>Meus agendamentos</h1>
          <p className="texto-suave">Acompanhe, edite ou cancele suas reservas.</p>
        </div>
        <Link to="/agendar" className="botao">
          + Novo agendamento
        </Link>
      </section>

      <Alerta tipo="sucesso" aoFechar={() => setSucesso('')}>
        {sucesso}
      </Alerta>
      <Alerta tipo={acoes.mensagem.tipo} aoFechar={acoes.limparMensagem}>
        {acoes.mensagem.texto}
      </Alerta>
      <Alerta>{erro}</Alerta>

      <div className="abas" role="tablist">
        {ABAS.map((a) => (
          <button
            key={a.valor}
            type="button"
            role="tab"
            aria-selected={aba === a.valor}
            className={`aba ${aba === a.valor ? 'aba--ativa' : ''}`}
            onClick={() => setAba(a.valor)}
          >
            {a.texto}
          </button>
        ))}
      </div>

      {carregando ? (
        <Spinner texto="Carregando agendamentos..." />
      ) : (
        <div className="lista-agendamentos">
          {dados.map((ag) => (
            <AgendamentoItem key={ag._id} agendamento={ag} aoCancelar={acoes.pedirCancelamento} />
          ))}
          {!erro && dados.length === 0 && (
            <p className="vazio">
              {aba === 'futuros' ? 'Você não tem agendamentos futuros.' : 'Nenhum agendamento no histórico.'}
            </p>
          )}
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
