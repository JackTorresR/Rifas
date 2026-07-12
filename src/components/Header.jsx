import "../styles/Header.css";
import { formatarMoeda } from "../utils/formatters";

export default function Header({ config }) {
  return (
    <header className="cabecalho">
      <div className="container cabecalho__conteudo">
        <div>
          <span className="cabecalho__ribbon">Rifa beneficente</span>
          <h1 className="cabecalho__titulo">{config.nomeRifa}</h1>
          <p className="cabecalho__descricao">{config.descricao}</p>
        </div>
        <div className="cabecalho__premio">
          {config.fotoPremio ? (
            <img
              className="cabecalho__premio-foto"
              src={config.fotoPremio}
              alt="Foto do prêmio"
            />
          ) : (
            <div className="cabecalho__premio-placeholder">Foto do prêmio</div>
          )}
          <div className="medalhao-preco">
            <span className="medalhao-preco__valor">
              {formatarMoeda(config.valorNumero)}
            </span>
            <span className="medalhao-preco__label">o ponto</span>
          </div>
        </div>
      </div>
    </header>
  );
}
