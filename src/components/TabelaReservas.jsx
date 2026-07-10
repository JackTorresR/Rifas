import { useMemo, useState } from 'react';
import '../styles/Admin.css';
import {
  cancelarReserva,
  desmarcarComoPago,
  editarComprador,
  liberarNumero,
  marcarComoPago,
} from '../services/rifaService';
import { formatarData, formatarNumeroExibicao, formatarTelefone, gerarCsvReservas } from '../utils/formatters';

const FILTROS = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'disponivel', label: 'Disponíveis' },
  { valor: 'reservado', label: 'Reservados' },
  { valor: 'pago', label: 'Pagos' },
];

function statusDe(item) {
  if (item.pago) return 'pago';
  if (item.reservado) return 'reservado';
  return 'disponivel';
}

export default function TabelaReservas({ numeros, totalNumeros }) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [editandoId, setEditandoId] = useState(null);
  const [rascunho, setRascunho] = useState({});
  const [processandoId, setProcessandoId] = useState(null);
  const [erro, setErro] = useState('');

  const numerosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return numeros.filter((item) => {
      if (filtro !== 'todos' && statusDe(item) !== filtro) return false;
      if (!termo) return true;
      const numeroExibicao = formatarNumeroExibicao(item.numero, totalNumeros);
      return (
        numeroExibicao.includes(termo) ||
        (item.nome || '').toLowerCase().includes(termo) ||
        (item.telefone || '').toLowerCase().includes(termo) ||
        (item.email || '').toLowerCase().includes(termo)
      );
    });
  }, [numeros, busca, filtro, totalNumeros]);

  function iniciarEdicao(item) {
    setEditandoId(item.id);
    setRascunho({
      nome: item.nome || '',
      telefone: item.telefone || '',
      email: item.email || '',
      observacao: item.observacao || '',
    });
  }

  async function salvarEdicao(id) {
    setProcessandoId(id);
    setErro('');
    try {
      await editarComprador(id, rascunho);
      setEditandoId(null);
    } catch {
      setErro('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setProcessandoId(null);
    }
  }

  async function executarAcao(id, acao) {
    setProcessandoId(id);
    setErro('');
    try {
      if (acao === 'pagar') await marcarComoPago(id);
      if (acao === 'desmarcar-pago') await desmarcarComoPago(id);
      if (acao === 'cancelar') {
        // eslint-disable-next-line no-alert
        if (!window.confirm('Cancelar esta reserva? O número voltará a ficar disponível.')) return;
        await cancelarReserva(id);
      }
      if (acao === 'liberar') {
        // eslint-disable-next-line no-alert
        if (!window.confirm('Liberar este número imediatamente?')) return;
        await liberarNumero(id);
      }
    } catch {
      setErro('Não foi possível concluir a ação. Tente novamente.');
    } finally {
      setProcessandoId(null);
    }
  }

  function exportarCsv() {
    const csv = gerarCsvReservas(
      numerosFiltrados.map((n) => ({ ...n, numeroExibicao: formatarNumeroExibicao(n.numero, totalNumeros) }))
    );
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reservas-rifa.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="painel-secao">
      <div className="painel-secao__cabecalho">
        <h2>Reservas</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="busca-input"
            placeholder="Pesquisar por nome, telefone, email ou número"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <select className="campo" value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ padding: '10px 14px', borderRadius: 999, border: '2px solid var(--borda)' }}>
            {FILTROS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.label}
              </option>
            ))}
          </select>
          <button type="button" className="botao botao-secundario" onClick={exportarCsv}>
            Exportar CSV
          </button>
        </div>
      </div>

      {erro && <div className="mensagem-erro" style={{ marginBottom: 12 }}>{erro}</div>}

      <div className="tabela-wrapper">
        <table className="tabela-reservas">
          <thead>
            <tr>
              <th>Número</th>
              <th>Status</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {numerosFiltrados.map((item) => {
              const status = statusDe(item);
              const emEdicao = editandoId === item.id;
              const carregando = processandoId === item.id;

              return (
                <tr key={item.id}>
                  <td>{formatarNumeroExibicao(item.numero, totalNumeros)}</td>
                  <td>
                    <span className={`badge badge-${status}`}>
                      {status === 'disponivel' ? 'Disponível' : status === 'reservado' ? 'Reservado' : 'Pago'}
                    </span>
                  </td>

                  {emEdicao ? (
                    <>
                      <td>
                        <input
                          value={rascunho.nome}
                          onChange={(e) => setRascunho((r) => ({ ...r, nome: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          value={rascunho.telefone}
                          onChange={(e) => setRascunho((r) => ({ ...r, telefone: formatarTelefone(e.target.value) }))}
                        />
                      </td>
                      <td>
                        <input
                          value={rascunho.email}
                          onChange={(e) => setRascunho((r) => ({ ...r, email: e.target.value }))}
                        />
                      </td>
                      <td>{formatarData(item.dataReserva)}</td>
                      <td className="tabela-reservas__acoes">
                        <button className="botao-tabela botao-tabela--sucesso" disabled={carregando} onClick={() => salvarEdicao(item.id)}>
                          Salvar
                        </button>
                        <button className="botao-tabela" onClick={() => setEditandoId(null)}>
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.nome || '—'}</td>
                      <td>{item.telefone || '—'}</td>
                      <td>{item.email || '—'}</td>
                      <td>{formatarData(item.dataReserva)}</td>
                      <td className="tabela-reservas__acoes">
                        {status !== 'disponivel' && (
                          <button className="botao-tabela" disabled={carregando} onClick={() => iniciarEdicao(item)}>
                            Editar
                          </button>
                        )}
                        {status === 'reservado' && (
                          <button
                            className="botao-tabela botao-tabela--sucesso"
                            disabled={carregando}
                            onClick={() => executarAcao(item.id, 'pagar')}
                          >
                            Marcar pago
                          </button>
                        )}
                        {status === 'pago' && (
                          <button
                            className="botao-tabela"
                            disabled={carregando}
                            onClick={() => executarAcao(item.id, 'desmarcar-pago')}
                          >
                            Desfazer pagamento
                          </button>
                        )}
                        {status !== 'disponivel' && (
                          <button
                            className="botao-tabela botao-tabela--perigo"
                            disabled={carregando}
                            onClick={() => executarAcao(item.id, 'cancelar')}
                          >
                            Cancelar reserva
                          </button>
                        )}
                        {status === 'reservado' && (
                          <button
                            className="botao-tabela botao-tabela--perigo"
                            disabled={carregando}
                            onClick={() => executarAcao(item.id, 'liberar')}
                          >
                            Liberar número
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

        {numerosFiltrados.length === 0 && <div className="sem-resultados">Nenhum resultado encontrado.</div>}
      </div>
    </div>
  );
}
