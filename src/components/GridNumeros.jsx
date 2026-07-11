import "../styles/GridNumeros.css";
import { formatarNumeroExibicao } from "../utils/formatters";
import Numero from "./Numero";

export default function GridNumeros({
  numeros,
  selecionados,
  onToggleNumero,
  totalNumeros,
}) {
  const ordenarNumeros = (a, b) => a.numero - b.numero;

  const numerosDisponiveis = numeros
    .filter((numero) => !numero.reservado && !numero.pago)
    .sort(ordenarNumeros);

  const numerosReservados = numeros
    .filter((numero) => numero.reservado && !numero.pago)
    .sort(ordenarNumeros);

  const numerosIndisponiveis = numeros
    .filter((numero) => numero.pago)
    .sort(ordenarNumeros);

  const renderNumeros = (lista, desabilitado = false) =>
    lista.map((item) => (
      <Numero
        key={item.id}
        item={item}
        numeroExibicao={formatarNumeroExibicao(item.numero, totalNumeros)}
        selecionado={selecionados.includes(item.numero)}
        onClick={desabilitado ? undefined : () => onToggleNumero(item.numero)}
      />
    ));

  return (
    <section className="container grade-secao">
      <div className="grade-secao__cabecalho">
        <h2>Escolha seus números</h2>

        <div className="grade-secao__legenda">
          <span className="badge badge-disponivel">● Disponível</span>
          <span className="badge badge-reservado">● Reservado</span>
          <span className="badge badge-pago">● Pago</span>
        </div>
      </div>

      <h3>Números disponíveis</h3>

      <div className="grade-numeros-wrapper">
        <div className="grade-numeros">
          {renderNumeros(numerosDisponiveis)}
        </div>
      </div>

      {numerosReservados.length > 0 && (
        <>
          <h3>Números reservados</h3>

          <div className="grade-numeros-wrapper">
            <div className="grade-numeros">
              {renderNumeros(numerosReservados, true)}
            </div>
          </div>
        </>
      )}

      {numerosIndisponiveis.length > 0 && (
        <>
          <h3>Números indisponíveis</h3>

          <div className="grade-numeros-wrapper">
            <div className="grade-numeros">
              {renderNumeros(numerosIndisponiveis, true)}
            </div>
          </div>
        </>
      )}
    </section>
  );
}