import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Admin.css';
import Dashboard from './Dashboard';
import TabelaReservas from './TabelaReservas';
import ConfiguracaoRifa from './ConfiguracaoRifa';
import { useAuth } from '../context/AuthContext';
import { useRifa } from '../hooks/useRifa';

const ABAS = [
  { id: 'reservas', label: 'Reservas' },
  { id: 'configuracao', label: 'Configuração' },
];

export default function PainelAdmin() {
  const { sair } = useAuth();
  const { config, numeros, estatisticas, carregando } = useRifa();
  const [aba, setAba] = useState('reservas');

  if (carregando) {
    return (
      <div className="tela-carregando">
        <div className="spinner" />
        Carregando painel…
      </div>
    );
  }

  return (
    <div>
      <div className="admin-topo">
        <div className="container admin-topo__conteudo">
          <h1>Painel administrativo — {config.nomeRifa}</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/" className="botao botao-secundario">
              Ver site
            </Link>
            <button type="button" className="botao botao-secundario" onClick={sair}>
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <Dashboard estatisticas={estatisticas} admin />

        <div className="admin-abas">
          {ABAS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`admin-aba ${aba === a.id ? 'admin-aba--ativa' : ''}`}
              onClick={() => setAba(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>

        {aba === 'reservas' && <TabelaReservas numeros={numeros} totalNumeros={config.quantidadeNumeros} />}
        {aba === 'configuracao' && <ConfiguracaoRifa config={config} />}
      </div>
    </div>
  );
}
