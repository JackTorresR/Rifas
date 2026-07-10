import LoginAdmin from '../components/LoginAdmin';
import PainelAdmin from '../components/PainelAdmin';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { usuario, isAdmin, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="tela-carregando">
        <div className="spinner" />
        Verificando acesso…
      </div>
    );
  }

  if (!usuario) return <LoginAdmin />;

  if (!isAdmin) {
    return (
      <div className="tela-carregando">
        <div className="mensagem-erro">
          Esta conta não tem permissão de administrador. Peça para um administrador liberar seu acesso.
        </div>
      </div>
    );
  }

  return <PainelAdmin />;
}
