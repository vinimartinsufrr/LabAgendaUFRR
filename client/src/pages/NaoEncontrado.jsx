import { Link } from 'react-router-dom';

export default function NaoEncontrado() {
  return (
    <div className="pagina-status pagina-status--tela">
      <span className="pagina-status__codigo">404</span>
      <h1>Página não encontrada</h1>
      <p className="texto-suave">O endereço que você tentou abrir não existe.</p>
      <Link to="/" className="botao">
        Voltar ao início
      </Link>
    </div>
  );
}
