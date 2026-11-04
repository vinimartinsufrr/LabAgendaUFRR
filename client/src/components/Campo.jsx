// Label + input + mensagem de erro do campo
export default function Campo({ label, nome, erro, ajuda, children, ...props }) {
  const id = `campo-${nome}`;

  return (
    <div className={`campo ${erro ? 'campo--erro' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children || <input id={id} name={nome} aria-invalid={!!erro} {...props} />}
      {erro ? <small className="campo__erro">{erro}</small> : ajuda && <small>{ajuda}</small>}
    </div>
  );
}
