import Modal from './Modal';
import Spinner from './Spinner';

// Pede confirmação antes de ações destrutivas (excluir, cancelar...)
export default function ConfirmarDialogo({
  aberto,
  titulo = 'Confirmar ação',
  mensagem,
  textoConfirmar = 'Confirmar',
  perigo = true,
  processando = false,
  aoConfirmar,
  aoFechar,
}) {
  return (
    <Modal
      aberto={aberto}
      titulo={titulo}
      aoFechar={processando ? () => {} : aoFechar}
      rodape={
        <>
          <button type="button" className="botao botao--contorno" onClick={aoFechar} disabled={processando}>
            Voltar
          </button>
          <button
            type="button"
            className={`botao ${perigo ? 'botao--perigo' : ''}`}
            onClick={aoConfirmar}
            disabled={processando}
          >
            {processando && <Spinner pequeno />} {textoConfirmar}
          </button>
        </>
      }
    >
      <p>{mensagem}</p>
    </Modal>
  );
}
