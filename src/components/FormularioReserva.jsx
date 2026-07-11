import { formatarTelefone } from '../utils/formatters';

export default function FormularioReserva({ comprador, erros, enviando, onChange, onSubmit }) {
  function handleTelefone(e) {
    onChange('telefone', formatarTelefone(e.target.value));
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="campo">
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
          value={comprador.nome}
          onChange={(e) => onChange('nome', e.target.value)}
        />
        {erros.nome && <div className="campo__erro">{erros.nome}</div>}
      </div>

      <div className="campo">
        <label htmlFor="telefone">Telefone</label>
        <input
          id="telefone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          value={comprador.telefone}
          onChange={handleTelefone}
        />
        {erros.telefone && <div className="campo__erro">{erros.telefone}</div>}
      </div>
      <div className="modal__rodape">
        <button type="submit" className="botao botao-primario" disabled={enviando} style={{ flex: 1 }}>
          {enviando ? 'Reservando…' : 'Reservar números'}
        </button>
      </div>
    </form>
  );
}
