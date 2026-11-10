import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);
const DURACAO = 6000;

// Notificações flutuantes no canto da tela (usadas pelos eventos em tempo real)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const fechar = useCallback((id) => setToasts((lista) => lista.filter((t) => t.id !== id)), []);

  const mostrar = useCallback(
    (texto, tipo = 'info') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((lista) => [...lista.slice(-3), { id, texto, tipo }]);
      setTimeout(() => fechar(id), DURACAO);
    },
    [fechar]
  );

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tipo}`} role="status">
            <span>{t.texto}</span>
            <button type="button" className="alerta__fechar" onClick={() => fechar(t.id)} aria-label="Fechar">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return contexto;
}
