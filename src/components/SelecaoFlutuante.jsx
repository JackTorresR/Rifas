import '../styles/Modal.css';
import { formatarNumeroExibicao } from '../utils/formatters';

export default function SelecaoFlutuante({ selecionados, totalNumeros, onAbrirModal, onLimpar }) {
  if (selecionados.length === 0) return null;

  return (
    <div className="barra-selecao">
      <div className="barra-selecao__conteudo">
        <span className="barra-selecao__texto">
          {selecionados.length} número{selecionados.length > 1 ? 's' : ''}
        </span>
        <div className="barra-selecao__numeros">
          {selecionados.slice(0, 6).map((n) => (
            <span key={n} className="barra-selecao__chip">
              {formatarNumeroExibicao(n, totalNumeros)}
            </span>
          ))}
          {selecionados.length > 6 && (
            <span className="barra-selecao__chip">+{selecionados.length - 6}</span>
          )}
        </div>
        <button type="button" className="botao botao-fantasma" style={{ color: 'white' }} onClick={onLimpar}>
          Limpar
        </button>
        <button type="button" className="botao botao-primario" onClick={onAbrirModal}>
          Reservar
        </button>
      </div>
    </div>
  );
}
