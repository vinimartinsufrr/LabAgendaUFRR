const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PAPEIS = ['admin', 'usuario'];
const SALT_ROUNDS = 10;

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório'],
      trim: true,
      minlength: [3, 'O nome deve ter pelo menos 3 caracteres'],
      maxlength: [100, 'O nome deve ter no máximo 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'E-mail inválido'],
    },
    // select: false -> a senha nunca volta nas consultas, a não ser que seja pedida
    senha: {
      type: String,
      required: [true, 'A senha é obrigatória'],
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
      select: false,
    },
    matricula: {
      type: String,
      trim: true,
    },
    papel: {
      type: String,
      enum: { values: PAPEIS, message: 'Papel inválido' },
      default: 'usuario',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.senha;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Gera o hash da senha (bcrypt) sempre que ela for criada ou alterada
usuarioSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  this.senha = await bcrypt.hash(this.senha, SALT_ROUNDS);
});

usuarioSchema.methods.compararSenha = function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);
Usuario.PAPEIS = PAPEIS;

module.exports = Usuario;
