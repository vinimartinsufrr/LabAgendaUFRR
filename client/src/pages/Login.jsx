import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Spinner from '../components/Spinner';
import { mensagemDeErro } from '../utils/erros';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(form.email, form.senha);
      // Volta para a página que a pessoa tentou abrir antes do login
      navigate(location.state?.de || '/', { replace: true });
    } catch (err) {
      setErro(mensagemDeErro(err));
      setEnviando(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__lado">
        <h1>LabAgenda UFRR</h1>
        <p>Reserve laboratórios da universidade em poucos cliques, sem conflito de horário.</p>
      </div>

      <form className="auth__cartao cartao" onSubmit={enviar} noValidate>
        <h2>Entrar</h2>
        <p className="texto-suave">Use seu e-mail e senha cadastrados.</p>

        <Alerta aoFechar={() => setErro('')}>{erro}</Alerta>

        <Campo
          label="E-mail"
          nome="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={alterar}
          required
        />
        <Campo
          label="Senha"
          nome="senha"
          type="password"
          autoComplete="current-password"
          value={form.senha}
          onChange={alterar}
          required
        />

        <button type="submit" className="botao botao--bloco" disabled={enviando}>
          {enviando ? (
            <>
              <Spinner pequeno /> Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>

        <p className="auth__rodape">
          Ainda não tem conta? <Link to="/registro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
