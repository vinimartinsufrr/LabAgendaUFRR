import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Spinner from '../components/Spinner';
import { errosPorCampo, mensagemDeErro } from '../utils/erros';

// O próprio usuário edita seus dados e troca a senha
export default function Perfil() {
  const { usuario, setUsuario } = useAuth();
  const [form, setForm] = useState({
    nome: usuario.nome,
    email: usuario.email,
    matricula: usuario.matricula || '',
    senha: '',
    confirmacao: '',
  });
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [salvando, setSalvando] = useState(false);

  const alterar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErros({ ...erros, [e.target.name]: undefined });
  };

  const salvar = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    if (form.senha && form.senha !== form.confirmacao) {
      setErros({ confirmacao: 'As senhas não conferem' });
      return;
    }

    const { confirmacao, senha, ...dados } = form;
    setSalvando(true);
    try {
      const { data } = await api.put(`/usuarios/${usuario._id}`, senha ? { ...dados, senha } : dados);
      setUsuario(data);
      setForm({ ...form, senha: '', confirmacao: '' });
      setMensagem({ tipo: 'sucesso', texto: 'Dados atualizados com sucesso.' });
    } catch (err) {
      setErros(errosPorCampo(err));
      setMensagem({ tipo: 'erro', texto: mensagemDeErro(err) });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <h1>Meu perfil</h1>
          <p className="texto-suave">Atualize seus dados de cadastro.</p>
        </div>
      </section>

      <form className="cartao formulario" onSubmit={salvar} noValidate>
        <Alerta tipo={mensagem.tipo} aoFechar={() => setMensagem({ tipo: '', texto: '' })}>
          {mensagem.texto}
        </Alerta>

        <Campo label="Nome" nome="nome" value={form.nome} onChange={alterar} erro={erros.nome} />
        <div className="grade-2">
          <Campo label="E-mail" nome="email" type="email" value={form.email} onChange={alterar} erro={erros.email} />
          <Campo label="Matrícula" nome="matricula" value={form.matricula} onChange={alterar} erro={erros.matricula} />
        </div>

        <h3 className="formulario__secao">Trocar senha</h3>
        <div className="grade-2">
          <Campo
            label="Nova senha"
            nome="senha"
            type="password"
            autoComplete="new-password"
            value={form.senha}
            onChange={alterar}
            erro={erros.senha}
            ajuda="Deixe em branco para manter a atual"
          />
          <Campo
            label="Confirmar nova senha"
            nome="confirmacao"
            type="password"
            autoComplete="new-password"
            value={form.confirmacao}
            onChange={alterar}
            erro={erros.confirmacao}
          />
        </div>

        <div className="formulario__acoes">
          <button type="submit" className="botao" disabled={salvando}>
            {salvando && <Spinner pequeno />} Salvar
          </button>
        </div>
      </form>
    </>
  );
}
