import "../styles/GridNumeros.css";
import { formatarNumeroExibicao } from "../utils/formatters";
import Numero from "./Numero";

export default function GridNumeros({
  numeros,
  selecionados,
  onToggleNumero,
  totalNumeros,
}) {
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

      <div className="grade-numeros-wrapper">
        <div className="grade-numeros">
          {numeros.map((item) => (
            <Numero
              key={item.id}
              item={item}
              numeroExibicao={formatarNumeroExibicao(item.numero, totalNumeros)}
              selecionado={selecionados.includes(item.numero)}
              onClick={() => onToggleNumero(item.numero)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
