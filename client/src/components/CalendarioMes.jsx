import { useState } from 'react';
import { DIAS_SEMANA, MESES, deISO, hojeISO, paraISO } from '../utils/datas';

// Calendário mensal para escolher uma data. Dias antes de "minimo" ficam bloqueados.
export default function CalendarioMes({ valor, aoSelecionar, minimo = hojeISO() }) {
  const inicial = valor ? deISO(valor) : new Date();
  const [mes, setMes] = useState({ ano: inicial.getFullYear(), mes: inicial.getMonth() });

  const primeiroDia = new Date(mes.ano, mes.mes, 1);
  const diasNoMes = new Date(mes.ano, mes.mes + 1, 0).getDate();
  const hoje = hojeISO();

  // Espaços vazios antes do dia 1 para alinhar com o dia da semana
  const celulas = [
    ...Array.from({ length: primeiroDia.getDay() }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => paraISO(new Date(mes.ano, mes.mes, i + 1))),
  ];

  const minimoData = deISO(minimo);
  const podeVoltar =
    mes.ano > minimoData.getFullYear() ||
    (mes.ano === minimoData.getFullYear() && mes.mes > minimoData.getMonth());

  const mudarMes = (delta) => {
    const d = new Date(mes.ano, mes.mes + delta, 1);
    setMes({ ano: d.getFullYear(), mes: d.getMonth() });
  };

  return (
    <div className="calendario">
      <div className="calendario__cabecalho">
        <button
          type="button"
          className="calendario__nav"
          onClick={() => mudarMes(-1)}
          disabled={!podeVoltar}
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <strong>
          {MESES[mes.mes]} {mes.ano}
        </strong>
        <button type="button" className="calendario__nav" onClick={() => mudarMes(1)} aria-label="Próximo mês">
          ›
        </button>
      </div>

      <div className="calendario__grade">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="calendario__semana">
            {d}
          </span>
        ))}

        {celulas.map((iso, i) =>
          iso ? (
            <button
              key={iso}
              type="button"
              className={[
                'calendario__dia',
                iso === valor && 'calendario__dia--selecionado',
                iso === hoje && 'calendario__dia--hoje',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={iso < minimo}
              onClick={() => aoSelecionar(iso)}
              aria-pressed={iso === valor}
            >
              {Number(iso.slice(8))}
            </button>
          ) : (
            <span key={`vazio-${i}`} />
          )
        )}
      </div>
    </div>
  );
}
