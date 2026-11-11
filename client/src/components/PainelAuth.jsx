// Painel lateral das telas de login e cadastro
export default function PainelAuth({ titulo, texto }) {
  return (
    <div className="auth__lado">
      <div className="auth__marca">
        <img src="/favicon.svg" alt="" width="32" height="32" />
        LabAgenda UFRR
      </div>
      <h1>{titulo}</h1>
      <p>{texto}</p>
      <ul className="auth__vantagens">
        <li>Calendário com os horários livres de cada laboratório</li>
        <li>Sem conflito: horários ocupados ficam bloqueados</li>
        <li>Atualizações em tempo real</li>
      </ul>
    </div>
  );
}
