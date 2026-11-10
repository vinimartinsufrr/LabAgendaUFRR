// Origens liberadas (CLIENT_URL pode ter várias, separadas por vírgula).
// Sem CLIENT_URL, libera qualquer origem (útil em desenvolvimento).
function origensPermitidas() {
  const lista = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  return lista.length ? lista : '*';
}

module.exports = { origensPermitidas };
