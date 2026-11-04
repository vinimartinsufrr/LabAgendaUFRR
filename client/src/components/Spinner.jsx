// Indicador de carregamento. "tela" ocupa a área toda; "pequeno" cabe dentro de botões.
export default function Spinner({ texto, tela = false, pequeno = false }) {
  if (pequeno) {
    return <span className="spinner spinner--pequeno" aria-hidden="true" />;
  }

  return (
    <div className={tela ? 'carregando carregando--tela' : 'carregando'} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{texto || 'Carregando...'}</span>
    </div>
  );
}
