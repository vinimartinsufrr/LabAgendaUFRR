import { useEffect } from 'react';

// Janela sobreposta. Fecha com ESC ou clicando fora.
export default function Modal({ titulo, aberto, aoFechar, children, rodape }) {
  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (e) => e.key === 'Escape' && aoFechar();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div className="modal" onMouseDown={aoFechar}>
      <div
        className="modal__caixa"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__cabecalho">
          <h2 id="modal-titulo">{titulo}</h2>
          <button type="button" className="alerta__fechar" onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="modal__corpo">{children}</div>
        {rodape && <div className="modal__rodape">{rodape}</div>}
      </div>
    </div>
  );
}
