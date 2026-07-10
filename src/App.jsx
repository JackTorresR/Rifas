import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { AuthProvider } from './context/AuthContext';

// Usamos HashRouter (URLs como /#/admin) para funcionar sem configuração
// extra de servidor no GitHub Pages, que não suporta rotas do lado do servidor.
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
