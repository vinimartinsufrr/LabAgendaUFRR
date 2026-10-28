const mongoose = require('mongoose');

const STATUS = ['confirmado', 'cancelado'];

const agendamentoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    laboratorio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratorio',
      required: [true, 'O laboratório é obrigatório'],
    },
    // Data guardada como texto AAAA-MM-DD para evitar problemas de fuso horário
    data: {
      type: String,
      required: [true, 'A data é obrigatória'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'A data deve estar no formato AAAA-MM-DD'],
    },
    horaInicio: {
      type: Number,
      required: [true, 'A hora de início é obrigatória'],
      min: 0,
      max: 23,
    },
    horaFim: {
      type: Number,
      required: [true, 'A hora de fim é obrigatória'],
      min: 1,
      max: 24,
    },
    motivo: {
      type: String,
      required: [true, 'O motivo é obrigatório'],
      trim: true,
      maxlength: [200, 'O motivo deve ter no máximo 200 caracteres'],
    },
    status: {
      type: String,
      enum: STATUS,
      default: 'confirmado',
    },
  },
  { timestamps: true }
);

// Acelera a busca de conflitos (mesmo laboratório no mesmo dia)
agendamentoSchema.index({ laboratorio: 1, data: 1 });

const Agendamento = mongoose.model('Agendamento', agendamentoSchema);
Agendamento.STATUS = STATUS;

module.exports = Agendamento;
