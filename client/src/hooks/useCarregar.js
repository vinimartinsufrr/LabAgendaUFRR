import { useCallback, useEffect, useRef, useState } from 'react';
import { mensagemDeErro } from '../utils/erros';

// Faz uma requisição ao montar o componente (e quando "deps" mudarem)
// e devolve { dados, carregando, erro, recarregar, setDados }
export default function useCarregar(buscar, deps = [], { inicial = null, ativo = true } = {}) {
  const [dados, setDados] = useState(inicial);
  const [carregando, setCarregando] = useState(ativo);
  const [erro, setErro] = useState('');
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  // "silencioso" recarrega sem mostrar o spinner (ex: depois de uma ação)
  const recarregar = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      setDados(await buscarRef.current());
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (ativo) recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, ...deps]);

  return { dados, setDados, carregando, erro, recarregar };
}
