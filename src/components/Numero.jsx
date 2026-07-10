function statusDoNumero(item) {
  if (item.pago) return 'pago';
  if (item.reservado) return 'reservado';
  return 'disponivel';
}

export default function Numero({ item, numeroExibicao, selecionado, onClick }) {
  const status = statusDoNumero(item);
  const bloqueado = status !== 'disponivel';

  const classes = [
    'numero-item',
    `numero-item--${status}`,
    selecionado ? 'numero-item--selecionado' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const rotulo = bloqueado
    ? `Número ${numeroExibicao}, ${status === 'pago' ? 'já pago' : 'reservado'}`
    : `Número ${numeroExibicao}, disponível${selecionado ? ', selecionado' : ''}`;

  return (
    <button
      type="button"
      className={classes}
      disabled={bloqueado}
      aria-pressed={selecionado}
      aria-label={rotulo}
      title={rotulo}
      onClick={() => onClick(item)}
    >
      {numeroExibicao}
    </button>
  );
}
