import { useState } from 'react';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import GridNumeros from '../components/GridNumeros';
import SelecaoFlutuante from '../components/SelecaoFlutuante';
import ModalReserva from '../components/ModalReserva';
import Footer from '../components/Footer';
import { useRifa } from '../hooks/useRifa';
import { reservarNumeros } from '../services/rifaService';

export default function Home() {
  const { config, numeros, estatisticas, carregando } = useRifa();
  const [selecionados, setSelecionados] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);

  function alternarNumero(numero) {
    setSelecionados((atual) =>
      atual.includes(numero) ? atual.filter((n) => n !== numero) : [...atual, numero]
    );
  }

  function removerNumero(numero) {
    setSelecionados((atual) => atual.filter((n) => n !== numero));
  }

  function fecharModal() {
    setModalAberto(false);
    // Remove da seleção os números que foram reservados com sucesso;
    // mantém selecionados os que ainda estão livres, caso o usuário queira tentar de novo.
  }

  async function handleReservar(comprador) {
    try {
      const { numerosReservados } = await reservarNumeros(
        selecionados,
        comprador,
        config.quantidadeNumeros
      );
      setSelecionados((atual) => atual.filter((n) => !numerosReservados.includes(n)));
      return { numerosReservados, numerosIndisponiveis: [] };
    } catch (err) {
      if (err.numerosIndisponiveis) {
        setSelecionados((atual) => atual.filter((n) => !err.numerosReservados?.includes(n) && !err.numerosIndisponiveis.includes(n)));
        return { numerosReservados: err.numerosReservados || [], numerosIndisponiveis: err.numerosIndisponiveis };
      }
      throw err;
    }
  }

  if (carregando) {
    return (
      <div className="tela-carregando">
        <div className="spinner" />
        Carregando rifa…
      </div>
    );
  }

  return (
    <>
      <Header config={config} />
      <Dashboard estatisticas={estatisticas} />
      <GridNumeros
        numeros={numeros}
        selecionados={selecionados}
        onToggleNumero={alternarNumero}
        totalNumeros={config.quantidadeNumeros}
      />
      <SelecaoFlutuante
        selecionados={selecionados}
        totalNumeros={config.quantidadeNumeros}
        onAbrirModal={() => setModalAberto(true)}
        onLimpar={() => setSelecionados([])}
      />
      {modalAberto && (
        <ModalReserva
          selecionados={selecionados}
          totalNumeros={config.quantidadeNumeros}
          onFechar={fecharModal}
          onRemoverNumero={removerNumero}
          onReservar={handleReservar}
        />
      )}
      <Footer config={config} />
    </>
  );
}
