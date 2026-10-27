const mongoose = require('mongoose');

const laboratorioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório'],
      unique: true,
      trim: true,
      minlength: [3, 'O nome deve ter pelo menos 3 caracteres'],
      maxlength: [80, 'O nome deve ter no máximo 80 caracteres'],
    },
    bloco: {
      type: String,
      required: [true, 'O bloco é obrigatório'],
      trim: true,
    },
    capacidade: {
      type: Number,
      required: [true, 'A capacidade é obrigatória'],
      min: [1, 'A capacidade mínima é 1'],
      max: [200, 'A capacidade máxima é 200'],
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: [500, 'A descrição deve ter no máximo 500 caracteres'],
    },
    recursos: {
      type: [String],
      default: [],
    },
    // Horário de funcionamento em horas cheias (0-23)
    horaAbertura: {
      type: Number,
      default: 8,
      min: 0,
      max: 23,
    },
    horaFechamento: {
      type: Number,
      default: 18,
      min: 1,
      max: 24,
      validate: {
        validator: function (valor) {
          return valor > this.horaAbertura;
        },
        message: 'O horário de fechamento deve ser depois da abertura',
      },
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Laboratorio', laboratorioSchema);
