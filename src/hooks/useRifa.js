import { useEffect, useMemo, useState } from 'react';
import { ouvirConfiguracao, ouvirNumeros } from '../services/rifaService';

/**
 * Hook central que assina as atualizações em tempo real da rifa
 * (configuração + números) e calcula as estatísticas derivadas.
 */
export function useRifa() {
  const [config, setConfig] = useState(null);
  const [numeros, setNumeros] = useState([]);
  const [carregandoConfig, setCarregandoConfig] = useState(true);
  const [carregandoNumeros, setCarregandoNumeros] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const unsubConfig = ouvirConfiguracao((c) => {
      setConfig(c);
      setCarregandoConfig(false);
    });
    const unsubNumeros = ouvirNumeros((n) => {
      setNumeros(n);
      setCarregandoNumeros(false);
    });
    return () => {
      unsubConfig();
      unsubNumeros();
    };
  }, []);

  const estatisticas = useMemo(() => {
    const total = numeros.length;
    const pagos = numeros.filter((n) => n.pago).length;
    const reservados = numeros.filter((n) => n.reservado && !n.pago).length;
    const disponiveis = total - pagos - reservados;
    const valorNumero = config?.valorNumero || 0;

    return {
      total,
      disponiveis,
      reservados,
      pagos,
      valorArrecadado: pagos * valorNumero,
      valorPrevisto: total * valorNumero,
    };
  }, [numeros, config]);

  return {
    config,
    numeros,
    estatisticas,
    carregando: carregandoConfig || carregandoNumeros,
    erro,
    setErro,
  };
}
