import { useState } from "react";
import "../styles/ModalSorteio.css";

export default function ModalSorteio(props = {}) {
  const { numeros, onFechar, onSelecionar } = props;

  const [bolas, setBolas] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [quantidade, setQuantidade] = useState(1);
  const [sorteando, setSorteando] = useState(false);

  function sortear() {
    const disponiveis = numeros
      .filter((n) => n?.reservado !== true && n?.pago !== true)
      .map((numero) => numero.numero);

    const sorteados = [...disponiveis]
      .sort(() => Math.random() - 0.5)
      .slice(0, quantidade);

    setSorteando(true);

    setBolas(sorteados.map(() => ({ valor: "?", sorteando: true })));

    sorteados.forEach((numero, index) => {
      setTimeout(
        () => {
          setBolas((atual) =>
            atual.map((bola, i) =>
              i === index
                ? {
                    valor: numero,
                    sorteando: false,
                  }
                : bola,
            ),
          );
        },
        1000 + index * 800,
      );
    });

    setTimeout(
      () => {
        setSorteando(false);
        setResultado(sorteados);
      },
      1000 + quantidade * 800,
    );
  }

  function confirmar() {
    onSelecionar(resultado);
    onFechar();
  }

  function sortearNovamente() {
    setBolas([]);
    setResultado([]);
    setSorteando(false);

    setTimeout(() => {
      sortear();
    }, 100);
  }

  function mudarQuantidade() {
    setBolas([]);
    setResultado([]);
    setSorteando(false);
  }

  const mostrarInputQuantidade = !resultado.length && !sorteando;

  const mostrarNumeros =
    resultado?.length > 0 && !bolas.some((bola) => bola.sorteando);

  const mostrarBolasSorteio = bolas.length > 0 && !mostrarNumeros;

  return (
    <div className="modal-sorteio">
      <div className="modal-sorteio__conteudo">
        <button className="modal-sorteio__fechar" onClick={onFechar}>
          ×
        </button>
        <h2>🎲 Sortear números</h2>
        {mostrarInputQuantidade && (
          <>
            <label>
              Quantos números deseja?
              <input
                min="1"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
              />
            </label>
            <button className="modal-sorteio__botao" onClick={sortear}>
              Sortear
            </button>
          </>
        )}
        {mostrarBolasSorteio && (
          <div className="bolas-container">
            {bolas.map((bola, index) => (
              <div
                key={index}
                className={`bola-sorteio ${bola.sorteando ? "girando" : ""}`}
              >
                {bola.valor}
              </div>
            ))}
          </div>
        )}
        {mostrarNumeros && (
          <>
            <h3>Seus números:</h3>
            <div className="numeros-sorteados-container">
              <div className="numeros-sorteados">
                {resultado.map((numero) => (
                  <span key={numero}>{numero}</span>
                ))}
              </div>
            </div>
            <div className="modal-sorteio__acoes">
              <button
                onClick={sortearNovamente}
                className="modal-sorteio__botao modal-sorteio__botao--secundario"
              >
                🔄 Repetir sorteio
              </button>
              <button
                onClick={mudarQuantidade}
                className="modal-sorteio__botao modal-sorteio__botao--terciario"
              >
                ✏️ Mudar quantidade
              </button>
              <button className="modal-sorteio__botao" onClick={confirmar}>
                ✅ Usar esses números
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
