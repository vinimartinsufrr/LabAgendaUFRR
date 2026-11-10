import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { TOKEN_KEY } from '../services/api';
import { formatarData, formatarIntervalo } from '../utils/datas';

const SocketContext = createContext({ socket: null, conectado: false });

// Mesmo endereço da API, sem o "/api" do final
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || 'http://localhost:3333/api').replace(/\/api\/?$/, '');

const descrever = (a) => `${a.laboratorio} · ${formatarData(a.data)} · ${formatarIntervalo(a.horaInicio, a.horaFim)}`;

// Abre a conexão em tempo real enquanto houver usuário logado
export function SocketProvider({ children }) {
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const mostrarRef = useRef(mostrar);
  mostrarRef.current = mostrar;

  useEffect(() => {
    if (!usuario) return undefined;

    const s = io(SOCKET_URL, { auth: { token: localStorage.getItem(TOKEN_KEY) } });
    s.on('connect', () => setConectado(true));
    s.on('disconnect', () => setConectado(false));

    // Admin: avisos de novos agendamentos e cancelamentos
    s.on('agendamento:notificacao', (a) => {
      if (a.tipo === 'criado') mostrarRef.current(`Novo agendamento de ${a.usuario}: ${descrever(a)}`, 'sucesso');
      if (a.tipo === 'cancelado') mostrarRef.current(`Agendamento cancelado: ${descrever(a)}`, 'aviso');
    });

    // Usuário: um admin alterou, cancelou ou excluiu um agendamento seu
    s.on('agendamento:seu-alterado', (a) => {
      const verbo = { cancelado: 'cancelou', excluido: 'excluiu', atualizado: 'alterou' }[a.tipo];
      mostrarRef.current(`Um administrador ${verbo} seu agendamento: ${descrever(a)}`, 'aviso');
    });

    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
      setConectado(false);
    };
  }, [usuario?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return <SocketContext.Provider value={{ socket, conectado }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

// Executa "aoReceber" sempre que o evento chegar (e remove o ouvinte ao desmontar)
export function useEventoSocket(evento, aoReceber) {
  const { socket } = useSocket();
  const ref = useRef(aoReceber);
  ref.current = aoReceber;

  useEffect(() => {
    if (!socket) return undefined;
    const ouvinte = (dados) => ref.current(dados);
    socket.on(evento, ouvinte);
    return () => socket.off(evento, ouvinte);
  }, [socket, evento]);
}
