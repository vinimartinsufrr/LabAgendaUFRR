import { useState } from 'react';
import api from '../services/api';
import { mensagemDeErro } from '../utils/erros';

// Estado e chamadas para cancelar/excluir agendamentos, compartilhado entre telas
export default function useAcoesAgendamento(aoConcluir) {
  const [acao, setAcao] = useState(null); // { tipo: 'cancelar' | 'excluir', agendamento }
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const confirmar = async () => {
    setProcessando(true);
    try {
      if (acao.tipo === 'cancelar') {
        await api.patch(`/agendamentos/${acao.agendamento._id}/cancelar`);
        setMensagem({ tipo: 'sucesso', texto: 'Agendamento cancelado. O horário foi liberado.' });
      } else {
        await api.delete(`/agendamentos/${acao.agendamento._id}`);
        setMensagem({ tipo: 'sucesso', texto: 'Agendamento excluído.' });
      }
      await aoConcluir();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: mensagemDeErro(err) });
    } finally {
      setProcessando(false);
      setAcao(null);
    }
  };

  return {
    acao,
    processando,
    mensagem,
    limparMensagem: () => setMensagem({ tipo: '', texto: '' }),
    pedirCancelamento: (agendamento) => setAcao({ tipo: 'cancelar', agendamento }),
    pedirExclusao: (agendamento) => setAcao({ tipo: 'excluir', agendamento }),
    fechar: () => setAcao(null),
    confirmar,
    dialogo: {
      aberto: !!acao,
      titulo: acao?.tipo === 'excluir' ? 'Excluir agendamento' : 'Cancelar agendamento',
      mensagem:
        acao?.tipo === 'excluir'
          ? 'O agendamento será apagado definitivamente. Deseja continuar?'
          : 'O horário ficará livre para outras pessoas. Deseja cancelar?',
      textoConfirmar: acao?.tipo === 'excluir' ? 'Excluir' : 'Cancelar agendamento',
    },
  };
}
