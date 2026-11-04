import { useEffect, useState } from 'react';
import api from '../services/api';
import Alerta from '../components/Alerta';
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
  const [laboratorios, setLaboratorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api
      .get('/laboratorios')
      .then(({ data }) => setLaboratorios(data))
      .catch((err) => setErro(mensagemDeErro(err)))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <>
      <section className="cabecalho-pagina">
        <div>
          <h1>Laboratórios</h1>
          <p className="texto-suave">Espaços disponíveis para agendamento.</p>
        </div>
      </section>

      <Alerta>{erro}</Alerta>

      <section className="grade-cartoes">
        {carregando && [1, 2, 3].map((n) => <CartaoEsqueleto key={n} />)}

        {!carregando &&
          laboratorios.map((lab) => (
            <article key={lab._id} className="cartao">
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
            </article>
          ))}
      </section>

      {!carregando && !erro && laboratorios.length === 0 && (
        <p className="vazio">Nenhum laboratório cadastrado ainda.</p>
      )}
    </>
  );
}
