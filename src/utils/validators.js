/**
 * Valida os dados do formulário de reserva.
 * Retorna um objeto com os erros encontrados (chave: campo, valor: mensagem).
 * Objeto vazio significa que os dados são válidos.
 */
export function validarComprador({ nome, telefone }) {
  const erros = {};

  const naoTemNome = !nome || nome.trim().length < 3;
  if (naoTemNome) {
    erros.nome = "Informe seu nome completo.";
  }

  const telefoneDigitos = (telefone || "").replace(/\D/g, "");
  const quantidadeTelefone = telefoneDigitos.length;
  const naoTemTelefone = quantidadeTelefone > 0 && quantidadeTelefone < 10;

  if (quantidadeTelefone === 0) {
    erros.telefone = "Informe um números de telefone";
  }

  if (naoTemTelefone) {
    erros.telefone = "Informe um telefone válido com DDD.";
  }

  return erros;
}

export function validarConfiguracao(props = {}) {
  const { nomeRifa, valorNumero, quantidadeNumeros } = props;

  const erros = {};

  if (!nomeRifa || nomeRifa.trim().length < 3) {
    erros.nomeRifa = "Informe o nome da rifa.";
  }

  if (!valorNumero || Number(valorNumero) <= 0) {
    erros.valorNumero = "Informe um valor por número maior que zero.";
  }

  if (!quantidadeNumeros || Number(quantidadeNumeros) < 10) {
    erros.quantidadeNumeros = "A rifa deve ter pelo menos 10 números.";
  }

  return erros;
}
