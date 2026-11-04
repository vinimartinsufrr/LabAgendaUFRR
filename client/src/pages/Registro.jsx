import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Spinner from '../components/Spinner';
import { errosPorCampo, mensagemDeErro } from '../utils/erros';

const VAZIO = { nome: '', email: '', matricula: '', senha: '', confirmacao: '' };

// Validação rápida no navegador; a validação que vale é a do backend
function validar(form) {
  const erros = {};
  if (form.nome.trim().length < 3) erros.nome = 'Informe seu nome completo';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) erros.email = 'E-mail inválido';
  if (form.senha.length < 6) erros.senha = 'A senha deve ter pelo menos 6 caracteres';
  if (form.confirmacao !== form.senha) erros.confirmacao = 'As senhas não conferem';
  return erros;
}

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErros({ ...erros, [e.target.name]: undefined });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErroGeral('');

    const errosLocais = validar(form);
    setErros(errosLocais);
    if (Object.keys(errosLocais).length) return;

    setEnviando(true);
    try {
      const { confirmacao, ...dados } = form;
      await registrar(dados);
      navigate('/', { replace: true });
    } catch (err) {
      setErros(errosPorCampo(err));
      setErroGeral(mensagemDeErro(err));
      setEnviando(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__lado">
        <h1>Crie sua conta</h1>
        <p>Alunos, professores e técnicos podem se cadastrar para reservar laboratórios.</p>
      </div>

      <form className="auth__cartao cartao" onSubmit={enviar} noValidate>
        <h2>Cadastro</h2>

        <Alerta aoFechar={() => setErroGeral('')}>{erroGeral}</Alerta>

        <Campo label="Nome completo" nome="nome" value={form.nome} onChange={alterar} erro={erros.nome} />
        <Campo
          label="E-mail"
          nome="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={alterar}
          erro={erros.email}
        />
        <Campo
          label="Matrícula (opcional)"
          nome="matricula"
          value={form.matricula}
          onChange={alterar}
          erro={erros.matricula}
        />
        <div className="grade-2">
          <Campo
            label="Senha"
            nome="senha"
            type="password"
            autoComplete="new-password"
            value={form.senha}
            onChange={alterar}
            erro={erros.senha}
          />
          <Campo
            label="Confirmar senha"
            nome="confirmacao"
            type="password"
            autoComplete="new-password"
            value={form.confirmacao}
            onChange={alterar}
            erro={erros.confirmacao}
          />
        </div>

        <button type="submit" className="botao botao--bloco" disabled={enviando}>
          {enviando ? (
            <>
              <Spinner pequeno /> Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </button>

        <p className="auth__rodape">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
