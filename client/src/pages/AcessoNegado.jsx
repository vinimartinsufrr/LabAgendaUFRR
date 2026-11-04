import { Link } from 'react-router-dom';

export default function AcessoNegado() {
  return (
    <div className="pagina-status">
      <span className="pagina-status__codigo">403</span>
      <h1>Acesso negado</h1>
      <p className="texto-suave">Esta área é restrita a administradores.</p>
      <Link to="/" className="botao">
        Voltar ao início
      </Link>
    </div>
  );
}
