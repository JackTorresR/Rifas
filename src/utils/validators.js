/**
 * Valida os dados do formulário de reserva.
 * Retorna um objeto com os erros encontrados (chave: campo, valor: mensagem).
 * Objeto vazio significa que os dados são válidos.
 */
export function validarComprador({ nome, telefone, email }) {
  const erros = {};

  if (!nome || nome.trim().length < 3) {
    erros.nome = 'Informe seu nome completo.';
  }

  const telefoneDigitos = (telefone || '').replace(/\D/g, '');
  if (telefoneDigitos.length < 10) {
    erros.telefone = 'Informe um telefone válido com DDD.';
  }

  if (email && email.trim().length > 0) {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailValido) {
      erros.email = 'Informe um email válido ou deixe em branco.';
    }
  }

  return erros;
}

export function validarConfiguracao({ nomeRifa, valorNumero, quantidadeNumeros }) {
  const erros = {};

  if (!nomeRifa || nomeRifa.trim().length < 3) {
    erros.nomeRifa = 'Informe o nome da rifa.';
  }

  if (!valorNumero || Number(valorNumero) <= 0) {
    erros.valorNumero = 'Informe um valor por número maior que zero.';
  }

  if (!quantidadeNumeros || Number(quantidadeNumeros) < 10) {
    erros.quantidadeNumeros = 'A rifa deve ter pelo menos 10 números.';
  }

  return erros;
}
