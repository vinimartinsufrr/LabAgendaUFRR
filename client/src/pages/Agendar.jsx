import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useEventoSocket } from '../contexts/SocketContext';
import useCarregar from '../hooks/useCarregar';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Spinner from '../components/Spinner';
import CalendarioMes from '../components/CalendarioMes';
import GradeHorarios from '../components/GradeHorarios';
import { mensagemDeErro } from '../utils/erros';
import { formatarData, formatarIntervalo, hojeISO } from '../utils/datas';

const SEM_SELECAO = { inicio: null, fim: null };

// Novo agendamento (/agendar) e edição (/agendamentos/:id/editar)
export default function Agendar() {
  const { id } = useParams();
  const editando = !!id;
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [laboratorio, setLaboratorio] = useState(params.get('laboratorio') || '');
  const [data, setData] = useState(hojeISO());
  const [selecao, setSelecao] = useState(SEM_SELECAO);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [carregandoEdicao, setCarregandoEdicao] = useState(editando);

  const labs = useCarregar(() => api.get('/laboratorios', { params: { ativo: true } }).then((r) => r.data), [], {
    inicial: [],
  });

  // No modo edição, preenche o formulário com o agendamento atual
  useEffect(() => {
    if (!editando) return;
    api
      .get(`/agendamentos/${id}`)
      .then(({ data: ag }) => {
        setLaboratorio(ag.laboratorio._id);
        setData(ag.data);
        setSelecao({ inicio: ag.horaInicio, fim: ag.horaFim });
        setMotivo(ag.motivo);
      })
      .catch((err) => setErro(mensagemDeErro(err)))
      .finally(() => setCarregandoEdicao(false));
  }, [id, editando]);

  const disponibilidade = useCarregar(
    () => api.get('/agendamentos/disponibilidade', { params: { laboratorio, data } }).then((r) => r.data),
    [laboratorio, data],
    { ativo: !!laboratorio && !carregandoEdicao }
  );

  // Na edição, o próprio agendamento não conta como ocupado
  const ocupados = (disponibilidade.dados?.ocupados || []).filter((o) => o._id !== id);

  // Tempo real: se alguém agendar/cancelar neste laboratório e dia, a grade se atualiza sozinha
  const [aviso, setAviso] = useState('');
  useEventoSocket('agendamento:alterado', (evento) => {
    if (evento.laboratorio === laboratorio && evento.data === data && !enviando) {
      disponibilidade.recarregar({ silencioso: true });
    }
  });

  // Se o horário selecionado acabou de ser ocupado por outra pessoa, desfaz a seleção
  useEffect(() => {
    if (selecao.inicio === null) return;
    const conflito = ocupados.some((o) => selecao.inicio < o.horaFim && selecao.fim > o.horaInicio);
    if (conflito) {
      setSelecao(SEM_SELECAO);
      setAviso('O horário que você selecionou acabou de ser reservado por outra pessoa. Escolha outro.');
    }
  }, [disponibilidade.dados]); // eslint-disable-line react-hooks/exhaustive-deps

  const trocarLaboratorio = (valor) => {
    setLaboratorio(valor);
    setSelecao(SEM_SELECAO);
  };

  const trocarData = (valor) => {
    setData(valor);
    setSelecao(SEM_SELECAO);
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    if (selecao.inicio === null) {
      setErro('Selecione pelo menos um horário na grade.');
      return;
    }

    const corpo = { laboratorio, data, horaInicio: selecao.inicio, horaFim: selecao.fim, motivo };
    setEnviando(true);
    try {
      if (editando) {
        await api.put(`/agendamentos/${id}`, corpo);
      } else {
        await api.post('/agendamentos', corpo);
      }
      navigate('/meus-agendamentos', {
        state: { sucesso: editando ? 'Agendamento atualizado!' : 'Agendamento confirmado!' },
      });
    } catch (err) {
      setErro(mensagemDeErro(err));
      setEnviando(false);
      // Se alguém pegou o horário antes, atualiza a grade
      if (err.response?.status === 409) {
        setSelecao(SEM_SELECAO);
        disponibilidade.recarregar({ silencioso: true });
      }
    }
  };

  if (carregandoEdicao) return <Spinner texto="Carregando agendamento..." />;

  const lab = disponibilidade.dados?.laboratorio;

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          {editando && (
            <Link to="/meus-agendamentos" className="link-voltar">
              ← Meus agendamentos
            </Link>
          )}
          <h1>{editando ? 'Editar agendamento' : 'Agendar laboratório'}</h1>
          <p className="texto-suave">Escolha o laboratório, o dia e os horários livres.</p>
        </div>
      </section>

      <Alerta>{labs.erro}</Alerta>

      <form className="agendar" onSubmit={enviar} noValidate>
        <div className="agendar__coluna">
          <div className="cartao">
            <Campo label="1. Laboratório" nome="laboratorio">
              <select
                id="campo-laboratorio"
                value={laboratorio}
                onChange={(e) => trocarLaboratorio(e.target.value)}
                disabled={labs.carregando}
              >
                <option value="">{labs.carregando ? 'Carregando...' : 'Selecione um laboratório'}</option>
                {labs.dados.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.nome} ({l.bloco})
                  </option>
                ))}
              </select>
            </Campo>

            <span className="rotulo">2. Dia</span>
            <CalendarioMes valor={data} aoSelecionar={trocarData} />
          </div>
        </div>

        <div className="agendar__coluna">
          <div className="cartao">
            <span className="rotulo">3. Horários {lab && `· ${formatarData(data)}`}</span>
            <Alerta tipo="info" aoFechar={() => setAviso('')}>
              {aviso}
            </Alerta>

            {!laboratorio && <p className="vazio">Selecione um laboratório para ver os horários.</p>}
            {laboratorio && disponibilidade.carregando && <Spinner texto="Buscando horários..." />}
            <Alerta>{disponibilidade.erro}</Alerta>

            {laboratorio && !disponibilidade.carregando && lab && (
              <GradeHorarios
                data={data}
                horaAbertura={lab.horaAbertura}
                horaFechamento={lab.horaFechamento}
                ocupados={ocupados}
                inicio={selecao.inicio}
                fim={selecao.fim}
                aoSelecionar={setSelecao}
              />
            )}
          </div>

          <div className="cartao">
            {selecao.inicio !== null && lab && (
              <div className="resumo-agendamento">
                <strong>{lab.nome}</strong>
                <span>
                  {formatarData(data)} · {formatarIntervalo(selecao.inicio, selecao.fim)}
                </span>
              </div>
            )}

            <Campo label="4. Motivo" nome="motivo">
              <textarea
                id="campo-motivo"
                rows="2"
                maxLength={200}
                placeholder="Ex: Aula prática de Arquitetura Web"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </Campo>

            <Alerta aoFechar={() => setErro('')}>{erro}</Alerta>

            <button type="submit" className="botao botao--bloco" disabled={enviando || !laboratorio}>
              {enviando && <Spinner pequeno />} {editando ? 'Salvar alterações' : 'Confirmar agendamento'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
