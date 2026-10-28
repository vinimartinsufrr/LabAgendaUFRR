// Funções auxiliares para trabalhar com datas no formato AAAA-MM-DD
const pad = (n) => String(n).padStart(2, '0');

// Data de hoje (fuso do servidor) no formato AAAA-MM-DD
function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Soma dias a uma data AAAA-MM-DD
function somarDias(data, dias) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia + dias);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Confere se a data existe de verdade (ex: 2025-02-30 é inválida)
function dataValida(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
}

// true se o horário (data + hora cheia) já passou
function jaPassou(data, hora) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia, hora) <= new Date();
}

module.exports = { hoje, somarDias, dataValida, jaPassou };
