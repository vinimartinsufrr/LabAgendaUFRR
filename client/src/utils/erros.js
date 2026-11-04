// Transforma o erro do axios em uma mensagem amigável para a tela
export function mensagemDeErro(erro, padrao = 'Algo deu errado. Tente novamente.') {
  if (!erro.response) {
    return 'Não foi possível conectar ao servidor. Verifique se a API está rodando.';
  }
  return erro.response.data?.mensagem || padrao;
}

// Converte os "detalhes" de validação da API em { campo: mensagem }
export function errosPorCampo(erro) {
  const detalhes = erro.response?.data?.detalhes || [];
  return Object.fromEntries(detalhes.map((d) => [d.campo, d.mensagem]));
}
