import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import useCarregar from '../hooks/useCarregar';
import Alerta from '../components/Alerta';
import ConfirmarDialogo from '../components/ConfirmarDialogo';
import { mensagemDeErro } from '../utils/erros';

// Esqueleto exibido enquanto a lista carrega
function CartaoEsqueleto() {
  return (
    <div className="cartao esqueleto" aria-hidden="true">
      <div className="esqueleto__linha esqueleto__linha--titulo" />
      <div className="esqueleto__linha" />
      <div className="esqueleto__linha esqueleto__linha--curta" />
    </div>
  );
}

export default function Laboratorios() {
  const { ehAdmin } = useAuth();
  const { dados: laboratorios, setDados, carregando, erro } = useCarregar(
    () => api.get('/laboratorios').then((r) => r.data),
    [],
    { inicial: [] }
  );

  const [busca, setBusca] = useState('');
  const [bloco, setBloco] = useState('');
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const blocos = useMemo(() => [...new Set(laboratorios.map((l) => l.bloco))].sort(), [laboratorios]);

  const filtrados = laboratorios.filter(
    (l) => l.nome.toLowerCase().includes(busca.trim().toLowerCase()) && (!bloco || l.bloco === bloco)
  );

  const excluir = async () => {
    setExcluindo(true);
    try {
      await api.delete(`/laboratorios/${paraExcluir._id}`);
      setDados(laboratorios.filter((l) => l._id !== paraExcluir._id));
      setMensagem({ tipo: 'sucesso', texto: `"${paraExcluir.nome}" foi removido.` });
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: mensagemDeErro(err) });
    } finally {
      setExcluindo(false);
      setParaExcluir(null);
    }
  };

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <h1>Laboratórios</h1>
          <p className="texto-suave">Escolha um laboratório para ver os horários e agendar.</p>
        </div>
        {ehAdmin && (
          <Link to="/laboratorios/novo" className="botao">
            + Novo laboratório
          </Link>
        )}
      </section>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar laboratório"
        />
        <select value={bloco} onChange={(e) => setBloco(e.target.value)} aria-label="Filtrar por bloco">
          <option value="">Todos os blocos</option>
          {blocos.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <Alerta>{erro}</Alerta>
      <Alerta tipo={mensagem.tipo} aoFechar={() => setMensagem({ tipo: '', texto: '' })}>
        {mensagem.texto}
      </Alerta>

      <section className="grade-cartoes">
        {carregando && [1, 2, 3].map((n) => <CartaoEsqueleto key={n} />)}

        {!carregando &&
          filtrados.map((lab) => (
            <article key={lab._id} className={`cartao cartao--lab ${lab.ativo ? '' : 'cartao--inativo'}`}>
              <div className="cartao__topo">
                <h3>{lab.nome}</h3>
                {!lab.ativo && <span className="selo selo--cinza">inativo</span>}
              </div>
              <p className="texto-suave">
                {lab.bloco} · {lab.capacidade} lugares · {lab.horaAbertura}h às {lab.horaFechamento}h
              </p>
              {lab.descricao && <p>{lab.descricao}</p>}
              {lab.recursos.length > 0 && (
                <ul className="etiquetas">
                  {lab.recursos.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}

              <div className="cartao__acoes">
                {lab.ativo && (
                  <Link to={`/agendar?laboratorio=${lab._id}`} className="botao botao--pequeno">
                    Agendar
                  </Link>
                )}
                {ehAdmin && (
                  <>
                    <Link to={`/laboratorios/${lab._id}/editar`} className="botao botao--contorno botao--pequeno">
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="botao botao--contorno botao--pequeno botao--texto-perigo"
                      onClick={() => setParaExcluir(lab)}
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
      </section>

      {!carregando && !erro && filtrados.length === 0 && (
        <p className="vazio">
          {laboratorios.length === 0 ? 'Nenhum laboratório cadastrado ainda.' : 'Nenhum laboratório encontrado.'}
        </p>
      )}

      <ConfirmarDialogo
        aberto={!!paraExcluir}
        titulo="Excluir laboratório"
        mensagem={`Tem certeza que deseja excluir "${paraExcluir?.nome}"? Todos os agendamentos dele também serão removidos.`}
        textoConfirmar="Excluir"
        processando={excluindo}
        aoConfirmar={excluir}
        aoFechar={() => setParaExcluir(null)}
      />
    </>
  );
}
