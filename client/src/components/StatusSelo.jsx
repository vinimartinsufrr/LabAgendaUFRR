import { jaPassou } from '../utils/datas';

// Selo com o estado do agendamento: confirmado, cancelado ou concluído (já passou)
export default function StatusSelo({ agendamento }) {
  if (agendamento.status === 'cancelado') {
    return <span className="selo selo--perigo">✕ cancelado</span>;
  }
  if (jaPassou(agendamento.data, agendamento.horaFim)) {
    return <span className="selo selo--cinza">✓ concluído</span>;
  }
  return <span className="selo selo--sucesso">● confirmado</span>;
}
