/**
 * Formata um valor numérico como moeda brasileira (R$).
 */
export function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Gera o ID do documento no Firestore a partir do número da rifa,
 * preenchendo com zeros à esquerda conforme a quantidade total de números.
 * Ex: numero=7, totalNumeros=200 -> "007"
 */
export function formatarNumeroId(numero, totalNumeros = 200) {
  const casas = String(totalNumeros).length;
  return String(numero).padStart(casas, '0');
}

/**
 * Formata a exibição do número da rifa (mesma lógica do ID, para exibir na grade).
 */
export function formatarNumeroExibicao(numero, totalNumeros = 200) {
  return formatarNumeroId(numero, totalNumeros);
}

/**
 * Aplica máscara de telefone brasileiro enquanto o usuário digita.
 * Aceita (11) 91234-5678 ou (11) 1234-5678.
 */
export function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/**
 * Formata um timestamp do Firestore (ou Date) em data/hora legível pt-BR.
 */
export function formatarData(timestamp) {
  if (!timestamp) return '—';
  const data = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Converte uma lista de reservas em uma string CSV pronta para download.
 */
export function gerarCsvReservas(reservas) {
  const cabecalho = ['Número', 'Nome', 'Telefone', 'Email', 'Status', 'Data da reserva'];
  const linhas = reservas.map((r) => {
    const status = r.pago ? 'Pago' : r.reservado ? 'Reservado' : 'Disponível';
    return [
      r.numeroExibicao ?? r.numero,
      r.nome || '',
      r.telefone || '',
      r.email || '',
      status,
      formatarData(r.dataReserva),
    ]
      .map(escaparCsv)
      .join(';');
  });
  return [cabecalho.join(';'), ...linhas].join('\n');
}

function escaparCsv(valor) {
  const texto = String(valor ?? '');
  if (texto.includes(';') || texto.includes('"') || texto.includes('\n')) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}
