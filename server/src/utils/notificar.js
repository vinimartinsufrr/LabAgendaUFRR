// Envia eventos em tempo real sobre agendamentos.
// Nos testes o Socket.io não é iniciado, então "io" é undefined e nada acontece.
function notificarAgendamento(req, tipo, agendamento) {
  const io = req.app.get('io');
  if (!io) return;

  const labId = String(agendamento.laboratorio?._id || agendamento.laboratorio);
  const donoId = String(agendamento.usuario?._id || agendamento.usuario);

  // Todos: atualiza grades de horário abertas no mesmo laboratório/dia
  io.emit('agendamento:alterado', { tipo, laboratorio: labId, data: agendamento.data });

  const resumo = {
    tipo,
    _id: agendamento._id,
    laboratorio: agendamento.laboratorio?.nome,
    usuario: agendamento.usuario?.nome,
    data: agendamento.data,
    horaInicio: agendamento.horaInicio,
    horaFim: agendamento.horaFim,
  };

  // Admins: notificação de novos agendamentos e cancelamentos
  if (tipo === 'criado' || tipo === 'cancelado') {
    io.to('admins').emit('agendamento:notificacao', resumo);
  }

  // Dono: avisa quando outra pessoa (um admin) mexeu no agendamento dele
  if (donoId !== String(req.usuario._id) && tipo !== 'criado') {
    io.to(`usuario:${donoId}`).emit('agendamento:seu-alterado', resumo);
  }
}

module.exports = { notificarAgendamento };
