import { formatarHora, jaPassou } from '../utils/datas';

// Grade de horários (blocos de 1h) do laboratório no dia escolhido.
// Horários ocupados ou que já passaram ficam bloqueados.
// Clique em um bloco para começar; clique em um bloco seguinte para estender o intervalo.
export default function GradeHorarios({ data, horaAbertura, horaFechamento, ocupados, inicio, fim, aoSelecionar }) {
  const horas = Array.from({ length: horaFechamento - horaAbertura }, (_, i) => horaAbertura + i);

  const ocupadoPor = (h) => ocupados.find((o) => h >= o.horaInicio && h < o.horaFim);
  const bloqueado = (h) => !!ocupadoPor(h) || jaPassou(data, h);

  const clicar = (h) => {
    const temSelecao = inicio !== null && inicio !== undefined;
    if (temSelecao && h >= fim) {
      // Só estende se todos os blocos entre o fim atual e o clicado estiverem livres
      const livres = Array.from({ length: h - fim + 1 }, (_, i) => fim + i).every((x) => !bloqueado(x));
      if (livres) return aoSelecionar({ inicio, fim: h + 1 });
    }
    aoSelecionar({ inicio: h, fim: h + 1 });
  };

  if (horas.length === 0) {
    return <p className="vazio">Este laboratório não tem horário de funcionamento definido.</p>;
  }

  return (
    <div>
      <div className="horarios" role="group" aria-label="Horários disponíveis">
        {horas.map((h) => {
          const ocupacao = ocupadoPor(h);
          const passou = !ocupacao && jaPassou(data, h);
          const selecionado = inicio !== null && h >= inicio && h < fim;

          let classe = 'horario';
          let legenda = 'livre';
          if (ocupacao) {
            classe += ocupacao.meu ? ' horario--meu' : ' horario--ocupado';
            legenda = ocupacao.meu ? 'seu' : 'ocupado';
          } else if (passou) {
            classe += ' horario--passado';
            legenda = 'encerrado';
          } else if (selecionado) {
            classe += ' horario--selecionado';
            legenda = 'selecionado';
          }

          return (
            <button
              key={h}
              type="button"
              className={classe}
              disabled={!!ocupacao || passou}
              onClick={() => clicar(h)}
              aria-pressed={selecionado}
              title={`${formatarHora(h)} às ${formatarHora(h + 1)} – ${legenda}`}
            >
              <strong>{formatarHora(h)}</strong>
              <small>{legenda}</small>
            </button>
          );
        })}
      </div>

      <ul className="legenda-horarios">
        <li><span className="horario-cor horario-cor--livre" /> Livre</li>
        <li><span className="horario-cor horario-cor--selecionado" /> Selecionado</li>
        <li><span className="horario-cor horario-cor--ocupado" /> Ocupado</li>
        <li><span className="horario-cor horario-cor--meu" /> Seu agendamento</li>
      </ul>
    </div>
  );
}
