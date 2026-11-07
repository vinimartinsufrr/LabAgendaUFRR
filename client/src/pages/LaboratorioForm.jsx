import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Spinner from '../components/Spinner';
import { errosPorCampo, mensagemDeErro } from '../utils/erros';

const VAZIO = {
  nome: '',
  bloco: '',
  capacidade: '',
  descricao: '',
  recursos: '',
  horaAbertura: 8,
  horaFechamento: 18,
  ativo: true,
};

const HORAS = Array.from({ length: 25 }, (_, h) => h);

// Cadastro e edição de laboratório (somente admin)
export default function LaboratorioForm() {
  const { id } = useParams();
  const editando = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(VAZIO);
  const [carregando, setCarregando] = useState(editando);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (!editando) return;
    api
      .get(`/laboratorios/${id}`)
      .then(({ data }) => setForm({ ...VAZIO, ...data, recursos: data.recursos.join(', ') }))
      .catch((err) => setErroGeral(mensagemDeErro(err)))
      .finally(() => setCarregando(false));
  }, [id, editando]);

  const alterar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setErros({ ...erros, [name]: undefined });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErroGeral('');

    const corpo = {
      nome: form.nome,
      bloco: form.bloco,
      capacidade: Number(form.capacidade),
      descricao: form.descricao,
      // "Projetor, Ar-condicionado" -> ["Projetor", "Ar-condicionado"]
      recursos: form.recursos
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
      horaAbertura: Number(form.horaAbertura),
      horaFechamento: Number(form.horaFechamento),
      ativo: form.ativo,
    };

    if (corpo.horaFechamento <= corpo.horaAbertura) {
      setErros({ horaFechamento: 'O fechamento deve ser depois da abertura' });
      return;
    }

    setEnviando(true);
    try {
      if (editando) {
        await api.put(`/laboratorios/${id}`, corpo);
      } else {
        await api.post('/laboratorios', corpo);
      }
      navigate('/laboratorios');
    } catch (err) {
      setErros(errosPorCampo(err));
      setErroGeral(mensagemDeErro(err));
      setEnviando(false);
    }
  };

  if (carregando) return <Spinner texto="Carregando laboratório..." />;

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <Link to="/laboratorios" className="link-voltar">
            ← Laboratórios
          </Link>
          <h1>{editando ? 'Editar laboratório' : 'Novo laboratório'}</h1>
        </div>
      </section>

      <form className="cartao formulario" onSubmit={enviar} noValidate>
        <Alerta aoFechar={() => setErroGeral('')}>{erroGeral}</Alerta>

        <Campo label="Nome" nome="nome" value={form.nome} onChange={alterar} erro={erros.nome} required />

        <div className="grade-2">
          <Campo label="Bloco" nome="bloco" value={form.bloco} onChange={alterar} erro={erros.bloco} required />
          <Campo
            label="Capacidade (pessoas)"
            nome="capacidade"
            type="number"
            min="1"
            max="200"
            value={form.capacidade}
            onChange={alterar}
            erro={erros.capacidade}
            required
          />
        </div>

        <div className="grade-2">
          <Campo label="Abre às" nome="horaAbertura" erro={erros.horaAbertura}>
            <select id="campo-horaAbertura" name="horaAbertura" value={form.horaAbertura} onChange={alterar}>
              {HORAS.slice(0, 24).map((h) => (
                <option key={h} value={h}>
                  {h}h
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Fecha às" nome="horaFechamento" erro={erros.horaFechamento}>
            <select id="campo-horaFechamento" name="horaFechamento" value={form.horaFechamento} onChange={alterar}>
              {HORAS.slice(1).map((h) => (
                <option key={h} value={h}>
                  {h}h
                </option>
              ))}
            </select>
          </Campo>
        </div>

        <Campo label="Descrição" nome="descricao" erro={erros.descricao}>
          <textarea id="campo-descricao" name="descricao" rows="3" value={form.descricao} onChange={alterar} />
        </Campo>

        <Campo
          label="Recursos"
          nome="recursos"
          value={form.recursos}
          onChange={alterar}
          erro={erros.recursos}
          ajuda="Separe por vírgula. Ex: Projetor, Ar-condicionado, Quadro branco"
        />

        <label className="checkbox">
          <input type="checkbox" name="ativo" checked={form.ativo} onChange={alterar} />
          Disponível para agendamento
        </label>

        <div className="formulario__acoes">
          <Link to="/laboratorios" className="botao botao--contorno">
            Cancelar
          </Link>
          <button type="submit" className="botao" disabled={enviando}>
            {enviando && <Spinner pequeno />} {editando ? 'Salvar alterações' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </>
  );
}
