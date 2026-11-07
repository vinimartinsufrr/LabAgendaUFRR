import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import useCarregar from '../../hooks/useCarregar';
import Alerta from '../../components/Alerta';
import Campo from '../../components/Campo';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import ConfirmarDialogo from '../../components/ConfirmarDialogo';
import { errosPorCampo, mensagemDeErro } from '../../utils/erros';

const NOVO = { nome: '', email: '', senha: '', matricula: '', papel: 'usuario' };

// Gestão de usuários: criar, mudar nível de acesso e excluir (somente admin)
export default function AdminUsuarios() {
  const { usuario: eu } = useAuth();
  const { dados: usuarios, setDados, carregando, erro } = useCarregar(
    () => api.get('/usuarios').then((r) => r.data),
    [],
    { inicial: [] }
  );

  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(NOVO);
  const [errosForm, setErrosForm] = useState({});
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [alterandoPapel, setAlterandoPapel] = useState(null);

  const abrirModal = () => {
    setForm(NOVO);
    setErrosForm({});
    setErroForm('');
    setModalAberto(true);
  };

  const alterarForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrosForm({ ...errosForm, [e.target.name]: undefined });
  };

  const criar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErroForm('');
    try {
      const { data } = await api.post('/usuarios', form);
      setDados([...usuarios, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setMensagem({ tipo: 'sucesso', texto: `Usuário ${data.nome} criado.` });
      setModalAberto(false);
    } catch (err) {
      setErrosForm(errosPorCampo(err));
      setErroForm(mensagemDeErro(err));
    } finally {
      setSalvando(false);
    }
  };

  const mudarPapel = async (usuario, papel) => {
    setAlterandoPapel(usuario._id);
    try {
      const { data } = await api.put(`/usuarios/${usuario._id}`, { papel });
      setDados(usuarios.map((u) => (u._id === data._id ? data : u)));
      setMensagem({ tipo: 'sucesso', texto: `${data.nome} agora é ${data.papel}.` });
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: mensagemDeErro(err) });
    } finally {
      setAlterandoPapel(null);
    }
  };

  const excluir = async () => {
    setExcluindo(true);
    try {
      await api.delete(`/usuarios/${paraExcluir._id}`);
      setDados(usuarios.filter((u) => u._id !== paraExcluir._id));
      setMensagem({ tipo: 'sucesso', texto: `Usuário ${paraExcluir.nome} removido.` });
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
          <h1>Usuários</h1>
          <p className="texto-suave">{usuarios.length} cadastrado(s)</p>
        </div>
        <button type="button" className="botao" onClick={abrirModal}>
          + Novo usuário
        </button>
      </section>

      <Alerta tipo={mensagem.tipo} aoFechar={() => setMensagem({ tipo: '', texto: '' })}>
        {mensagem.texto}
      </Alerta>
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <Spinner texto="Carregando usuários..." />
      ) : (
        <div className="cartao tabela-wrapper">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Matrícula</th>
                <th>Nível</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const souEu = u._id === eu._id;
                return (
                  <tr key={u._id}>
                    <td data-rotulo="Nome">
                      {u.nome} {souEu && <span className="selo">você</span>}
                    </td>
                    <td data-rotulo="E-mail">{u.email}</td>
                    <td data-rotulo="Matrícula">{u.matricula || '—'}</td>
                    <td data-rotulo="Nível">
                      <select
                        value={u.papel}
                        disabled={souEu || alterandoPapel === u._id}
                        onChange={(e) => mudarPapel(u, e.target.value)}
                        aria-label={`Nível de acesso de ${u.nome}`}
                      >
                        <option value="usuario">usuário</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="tabela__acoes">
                      <button
                        type="button"
                        className="botao botao--contorno botao--pequeno botao--texto-perigo"
                        disabled={souEu}
                        title={souEu ? 'Você não pode excluir a própria conta' : undefined}
                        onClick={() => setParaExcluir(u)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal titulo="Novo usuário" aberto={modalAberto} aoFechar={() => setModalAberto(false)}>
        <form onSubmit={criar} noValidate>
          <Alerta aoFechar={() => setErroForm('')}>{erroForm}</Alerta>
          <Campo label="Nome" nome="nome" value={form.nome} onChange={alterarForm} erro={errosForm.nome} />
          <Campo
            label="E-mail"
            nome="email"
            type="email"
            value={form.email}
            onChange={alterarForm}
            erro={errosForm.email}
          />
          <div className="grade-2">
            <Campo
              label="Senha"
              nome="senha"
              type="password"
              autoComplete="new-password"
              value={form.senha}
              onChange={alterarForm}
              erro={errosForm.senha}
            />
            <Campo
              label="Matrícula"
              nome="matricula"
              value={form.matricula}
              onChange={alterarForm}
              erro={errosForm.matricula}
            />
          </div>
          <Campo label="Nível de acesso" nome="papel" erro={errosForm.papel}>
            <select id="campo-papel" name="papel" value={form.papel} onChange={alterarForm}>
              <option value="usuario">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </Campo>
          <div className="formulario__acoes">
            <button type="button" className="botao botao--contorno" onClick={() => setModalAberto(false)}>
              Cancelar
            </button>
            <button type="submit" className="botao" disabled={salvando}>
              {salvando && <Spinner pequeno />} Criar usuário
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmarDialogo
        aberto={!!paraExcluir}
        titulo="Excluir usuário"
        mensagem={`Excluir ${paraExcluir?.nome}? Os agendamentos dele também serão removidos.`}
        textoConfirmar="Excluir"
        processando={excluindo}
        aoConfirmar={excluir}
        aoFechar={() => setParaExcluir(null)}
      />
    </>
  );
}
