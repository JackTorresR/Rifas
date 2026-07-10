import '../styles/Dashboard.css';
import { formatarMoeda } from '../utils/formatters';

export default function Dashboard({ estatisticas, admin = false }) {
  const { total, disponiveis, reservados, pagos, valorArrecadado, valorPrevisto } = estatisticas;

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard__card">
          <div className="dashboard__valor">{total}</div>
          <div className="dashboard__label">Total de números</div>
        </div>
        <div className="dashboard__card dashboard__card--disponivel">
          <div className="dashboard__valor">{disponiveis}</div>
          <div className="dashboard__label">Disponíveis</div>
        </div>
        <div className="dashboard__card dashboard__card--reservado">
          <div className="dashboard__valor">{reservados}</div>
          <div className="dashboard__label">Reservados</div>
        </div>
        <div className="dashboard__card dashboard__card--pago">
          <div className="dashboard__valor">{pagos}</div>
          <div className="dashboard__label">Pagos</div>
        </div>
        {admin && (
          <>
            <div className="dashboard__card">
              <div className="dashboard__valor">{formatarMoeda(valorArrecadado)}</div>
              <div className="dashboard__label">Valor arrecadado</div>
            </div>
            <div className="dashboard__card">
              <div className="dashboard__valor">{formatarMoeda(valorPrevisto)}</div>
              <div className="dashboard__label">Valor previsto</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
