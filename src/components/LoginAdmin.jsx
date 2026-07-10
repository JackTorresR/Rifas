import { useState } from 'react';
import '../styles/Admin.css';
import { useAuth } from '../context/AuthContext';

export default function LoginAdmin() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (err) {
      setErro('Não foi possível entrar. Verifique seu email e senha.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-login">
      <div className="card-login">
        <h1>Painel administrativo</h1>
        <p>Entre com sua conta de administrador para gerenciar a rifa.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <div className="mensagem-erro">{erro}</div>}

          <button type="submit" className="botao botao-primario" style={{ width: '100%', marginTop: 6 }} disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
