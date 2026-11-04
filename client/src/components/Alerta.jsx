// Caixa de mensagem para feedback visual. tipo: erro | sucesso | info
export default function Alerta({ tipo = 'erro', children, aoFechar }) {
  if (!children) return null;

  return (
    <div className={`alerta alerta--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <span>{children}</span>
      {aoFechar && (
        <button type="button" className="alerta__fechar" onClick={aoFechar} aria-label="Fechar">
          ×
        </button>
      )}
    </div>
  );
}
