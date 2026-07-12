import { useMemo, useState } from "react";
import {
  cancelarReserva,
  desmarcarComoPago,
  editarComprador,
  liberarNumero,
  marcarComoPago,
} from "../services/rifaService";
import "../styles/Admin.css";
import {
  formatarData,
  formatarNumeroExibicao,
  formatarTelefone,
  gerarCsvReservas,
} from "../utils/formatters";

const FILTROS = [
  { valor: "todos", label: "Todos" },
  { valor: "disponivel", label: "Disponíveis" },
  { valor: "reservado", label: "Reservados" },
  { valor: "pago", label: "Pagos" },
];

function statusDe(item) {
  if (item.pago) return "pago";
  if (item.reservado) return "reservado";
  return "disponivel";
}

export default function TabelaReservas({ numeros, totalNumeros }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [editandoId, setEditandoId] = useState(null);
  const [rascunho, setRascunho] = useState({});
  const [processandoId, setProcessandoId] = useState(null);
  const [erro, setErro] = useState("");

  const numerosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return numeros.filter((item) => {
      if (filtro !== "todos" && statusDe(item) !== filtro) return false;
      if (!termo) return true;
      const numeroExibicao = formatarNumeroExibicao(item.numero, totalNumeros);
      return (
        numeroExibicao.includes(termo) ||
        (item.nome || "").toLowerCase().includes(termo) ||
        (item.telefone || "").toLowerCase().includes(termo)
      );
    });
  }, [numeros, busca, filtro, totalNumeros]);

  function iniciarEdicao(item) {
    setEditandoId(item.id);
    setRascunho({
      nome: item.nome || "",
      telefone: item.telefone || "",
      observacao: item.observacao || "",
    });
  }

  async function salvarEdicao(id) {
    setProcessandoId(id);
    setErro("");
    try {
      await editarComprador(id, rascunho);
      setEditandoId(null);
    } catch {
      setErro("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function executarAcao(id, acao) {
    setProcessandoId(id);
    setErro("");
    try {
      if (acao === "pagar") await marcarComoPago(id);
      if (acao === "desmarcar-pago") await desmarcarComoPago(id);
      if (acao === "cancelar") {
        // eslint-disable-next-line no-alert
        if (
          !window.confirm(
            "Cancelar esta reserva? O número voltará a ficar disponível.",
          )
        )
          return;
        await cancelarReserva(id);
      }
      if (acao === "liberar") {
        // eslint-disable-next-line no-alert
        if (!window.confirm("Liberar este número imediatamente?")) return;
        await liberarNumero(id);
      }
    } catch {
      setErro("Não foi possível concluir a ação. Tente novamente.");
    } finally {
      setProcessandoId(null);
    }
  }

  function exportarCsv() {
    const csv = gerarCsvReservas(
      numeros
        .sort((a, b) => a.numero - b.numero)
        .map((n) => ({
          ...n,
          numeroExibicao: formatarNumeroExibicao(n.numero, totalNumeros),
        })),
    );

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "rifa-completa.csv";

    link.click();

    URL.revokeObjectURL(url);
  }

  function exportarTxtNumeros() {
    const disponiveis = numeros
      .filter((item) => !item.reservado && !item.pago)
      .sort((a, b) => a.numero - b.numero)
      .map((item) => formatarNumeroExibicao(item.numero, totalNumeros));

    const indisponiveis = numeros
      .filter((item) => item.reservado || item.pago)
      .sort((a, b) => a.numero - b.numero)
      .map((item) => formatarNumeroExibicao(item.numero, totalNumeros));

    let texto = `*Disponíveis:*`;
    texto += `\n  ${disponiveis.join(", ")}\n`;

    texto += `\n*Indisponíveis:*`;
    texto += `\n  ${indisponiveis.join(", ")}`;

    const blob = new Blob([texto], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "numeros-rifa.txt";

    link.click();

    URL.revokeObjectURL(url);
  }

  async function marcarFiltradosComoPagos() {
    const reservados = numerosFiltrados.filter(
      (item) => item.reservado && !item.pago,
    );

    if (reservados.length === 0) {
      setErro("Nenhum número reservado encontrado para marcar como pago.");
      return;
    }

    if (!window.confirm(`Marcar ${reservados.length} números como pagos?`)) {
      return;
    }

    setErro("");

    try {
      setProcessandoId("todos");

      await Promise.all(reservados.map((item) => marcarComoPago(item.id)));
    } catch {
      setErro("Não foi possível marcar todos como pagos.");
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div className="painel-secao">
      <div className="painel-secao__cabecalho">
        <h2>Reservas ({numerosFiltrados.length})</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            className="campo"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: "2px solid var(--borda)",
            }}
          >
            {FILTROS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            className="busca-input"
            placeholder="Informe nome, telefone ou número"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            type="button"
            className="botao botao-secundario"
            onClick={marcarFiltradosComoPagos}
          >
            Marcar reservados como pagos
          </button>
        </div>
      </div>
      {erro && (
        <div className="mensagem-erro" style={{ marginBottom: 12 }}>
          {erro}
        </div>
      )}
      <div className="tabela-wrapper">
        <table className="tabela-reservas">
          <thead>
            <tr>
              <th>Número</th>
              <th>Status</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {numerosFiltrados.map((item) => {
              const status = statusDe(item);
              const emEdicao = editandoId === item.id;
              const carregando = processandoId === item.id;

              const estaPago = status === "pago";

              return (
                <tr key={item.id}>
                  <td>{formatarNumeroExibicao(item.numero, totalNumeros)}</td>
                  <td>
                    <span className={`badge badge-${status}`}>
                      {status === "disponivel"
                        ? "Disponível"
                        : status === "reservado"
                          ? "Reservado"
                          : "Pago"}
                    </span>
                  </td>
                  {emEdicao ? (
                    <>
                      <td>
                        <input
                          value={rascunho.nome}
                          onChange={(e) =>
                            setRascunho((r) => ({ ...r, nome: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={rascunho.telefone}
                          onChange={(e) =>
                            setRascunho((r) => ({
                              ...r,
                              telefone: formatarTelefone(e.target.value),
                            }))
                          }
                        />
                      </td>
                      <td>{formatarData(item.dataReserva)}</td>
                      <td className="tabela-reservas__acoes">
                        <button
                          className="botao-tabela botao-tabela--sucesso"
                          disabled={carregando}
                          onClick={() => salvarEdicao(item.id)}
                        >
                          Salvar
                        </button>
                        <button
                          className="botao-tabela"
                          onClick={() => setEditandoId(null)}
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.nome || "—"}</td>
                      <td>{item.telefone || "—"}</td>
                      <td>{formatarData(item.dataReserva)}</td>
                      <td className="tabela-reservas__acoes">
                        {status !== "disponivel" && (
                          <button
                            className="botao-tabela"
                            disabled={carregando}
                            onClick={() => iniciarEdicao(item)}
                          >
                            Editar
                          </button>
                        )}
                        {status === "reservado" && (
                          <button
                            disabled={carregando}
                            title="Marcar número como pago"
                            className="botao-tabela botao-tabela--sucesso"
                            onClick={() => executarAcao(item.id, "pagar")}
                          >
                            Pagar
                          </button>
                        )}
                        {estaPago && (
                          <button
                            disabled={carregando}
                            className="botao-tabela"
                            title="Desfazer pagamento"
                            onClick={() =>
                              executarAcao(item.id, "desmarcar-pago")
                            }
                          >
                            Desfazer
                          </button>
                        )}
                        {estaPago && (
                          <button
                            disabled={carregando}
                            title="Cancelar reserva"
                            className="botao-tabela botao-tabela--perigo"
                            onClick={() => executarAcao(item.id, "cancelar")}
                          >
                            Cancelar
                          </button>
                        )}
                        {status === "reservado" && (
                          <button
                            disabled={carregando}
                            title="Liberar número"
                            className="botao-tabela botao-tabela--perigo"
                            onClick={() => executarAcao(item.id, "liberar")}
                          >
                            Liberar
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {numerosFiltrados.length === 0 && (
          <div className="sem-resultados">Nenhum resultado encontrado.</div>
        )}
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={exportarTxtNumeros}
          className="botao botao-secundario"
        >
          Exportar números TXT
        </button>
        <button
          type="button"
          className="botao botao-secundario"
          onClick={exportarCsv}
        >
          Exportar CSV completo
        </button>
      </div>
    </div>
  );
}
