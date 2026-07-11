import { useState } from "react";
import "../styles/Modal.css";
import FormularioReserva from "./FormularioReserva";
import { validarComprador } from "../utils/validators";
import { formatarNumeroExibicao } from "../utils/formatters";

const COMPRADOR_VAZIO = { nome: "", telefone: "" };

export default function ModalReserva({
  selecionados,
  totalNumeros,
  onFechar,
  onRemoverNumero,
  onReservar,
}) {
  const [comprador, setComprador] = useState(COMPRADOR_VAZIO);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  function handleChange(campo, valor) {
    setComprador((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosValidacao = validarComprador(comprador);
    setErros(errosValidacao);
    if (Object.keys(errosValidacao).length > 0) return;

    setEnviando(true);
    setResultado(null);
    try {
      const { numerosIndisponiveis, numerosReservados } =
        await onReservar(comprador);
      setResultado({
        sucesso: true,
        indisponiveis: numerosIndisponiveis || [],
        reservados: numerosReservados || [],
      });
      if (!numerosIndisponiveis || numerosIndisponiveis.length === 0) {
        setComprador(COMPRADOR_VAZIO);
      }
    } catch (err) {
      setResultado({
        sucesso: false,
        erroGeral: err.message || "Não foi possível concluir a reserva.",
      });
    } finally {
      setEnviando(false);
    }
  }

  const numerosRestantes = selecionados.filter(
    (n) => !(resultado?.reservados || []).includes(n),
  );

  return (
    <div
      className="overlay-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Reservar números"
    >
      <div className="modal">
        <div className="modal__cabecalho">
          <h2>Confirmar reserva</h2>
          <button
            type="button"
            className="modal__fechar"
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {resultado?.sucesso && resultado.reservados.length > 0 && (
          <div className="mensagem-sucesso">
            Reserva realizada com sucesso.
            <br />
            Entraremos em contato para confirmar o pagamento.
          </div>
        )}

        {resultado?.indisponiveis?.length > 0 && (
          <div className="mensagem-indisponiveis">
            <strong>Os seguintes números já foram reservados:</strong>
            {resultado.indisponiveis
              .map((n) => formatarNumeroExibicao(n, totalNumeros))
              .join(", ")}
            . Escolha outros números.
          </div>
        )}

        {resultado?.erroGeral && (
          <div className="mensagem-erro">{resultado.erroGeral}</div>
        )}

        {numerosRestantes.length > 0 && !resultado?.sucesso ? (
          <>
            <div className="modal__lista-numeros">
              {numerosRestantes.map((n) => (
                <span className="modal__numero-chip" key={n}>
                  {formatarNumeroExibicao(n, totalNumeros)}
                  <button
                    type="button"
                    onClick={() => onRemoverNumero(n)}
                    aria-label={`Remover número ${n}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <FormularioReserva
              comprador={comprador}
              erros={erros}
              enviando={enviando}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </>
        ) : (
          !resultado?.sucesso && (
            <p>
              Nenhum número selecionado. Feche esta janela e escolha números na
              grade.
            </p>
          )
        )}

        {resultado?.sucesso && (
          <button
            type="button"
            className="botao botao-secundario"
            style={{ width: "100%", marginTop: 8 }}
            onClick={onFechar}
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}
