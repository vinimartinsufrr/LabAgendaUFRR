// Datas trafegam como texto AAAA-MM-DD (mesmo formato do backend)
const pad = (n) => String(n).padStart(2, '0');

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
export const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function paraISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function deISO(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export const hojeISO = () => paraISO(new Date());

// "2026-12-01" -> "ter, 01/12/2026"
export function formatarData(iso, { semana = true } = {}) {
  const d = deISO(iso);
  const texto = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return semana ? `${DIAS_SEMANA[d.getDay()].toLowerCase()}, ${texto}` : texto;
}

export const formatarHora = (hora) => `${pad(hora)}:00`;

export const formatarIntervalo = (inicio, fim) => `${formatarHora(inicio)} – ${formatarHora(fim)}`;

// true se data + hora (cheia) já passou
export function jaPassou(iso, hora) {
  const d = deISO(iso);
  d.setHours(hora);
  return d <= new Date();
}
