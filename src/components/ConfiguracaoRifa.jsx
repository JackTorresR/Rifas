import { useEffect, useState } from 'react';
import '../styles/Admin.css';
import { garantirNumerosCriados, salvarConfiguracao } from '../services/rifaService';
import { validarConfiguracao } from '../utils/validators';

export default function ConfiguracaoRifa({ config }) {
  const [form, setForm] = useState(config);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    setForm(config);
  }, [config]);

  function handleChange(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosValidacao = validarConfiguracao(form);
    setErros(errosValidacao);
    if (Object.keys(errosValidacao).length > 0) return;

    setSalvando(true);
    setMensagem('');
    try {
      await salvarConfiguracao({
        ...form,
        valorNumero: Number(form.valorNumero),
        quantidadeNumeros: Number(form.quantidadeNumeros),
      });
      const criados = await garantirNumerosCriados(Number(form.quantidadeNumeros));
      setMensagem(
        criados > 0
          ? `Configuração salva. ${criados} número(s) novo(s) foram criados no Firestore.`
          : 'Configuração salva com sucesso.'
      );
    } catch (err) {
      setMensagem('Erro ao salvar a configuração. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="painel-secao">
      <h2 style={{ marginBottom: 16 }}>Configuração da rifa</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="campo">
            <label htmlFor="nomeRifa">Nome da rifa</label>
            <input id="nomeRifa" value={form.nomeRifa} onChange={(e) => handleChange('nomeRifa', e.target.value)} />
            {erros.nomeRifa && <div className="campo__erro">{erros.nomeRifa}</div>}
          </div>

          <div className="campo">
            <label htmlFor="valorNumero">Valor por número (R$)</label>
            <input
              id="valorNumero"
              type="number"
              min="0"
              step="0.01"
              value={form.valorNumero}
              onChange={(e) => handleChange('valorNumero', e.target.value)}
            />
            {erros.valorNumero && <div className="campo__erro">{erros.valorNumero}</div>}
          </div>

          <div className="campo">
            <label htmlFor="quantidadeNumeros">Quantidade de números</label>
            <input
              id="quantidadeNumeros"
              type="number"
              min="10"
              step="1"
              value={form.quantidadeNumeros}
              onChange={(e) => handleChange('quantidadeNumeros', e.target.value)}
            />
            {erros.quantidadeNumeros && <div className="campo__erro">{erros.quantidadeNumeros}</div>}
          </div>

          <div className="campo">
            <label htmlFor="fotoPremio">URL da foto do prêmio</label>
            <input id="fotoPremio" value={form.fotoPremio} onChange={(e) => handleChange('fotoPremio', e.target.value)} />
          </div>

          <div className="campo form-grid--full">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              rows={3}
              value={form.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="whatsappContato">WhatsApp de contato</label>
            <input
              id="whatsappContato"
              placeholder="(00) 00000-0000"
              value={form.whatsappContato}
              onChange={(e) => handleChange('whatsappContato', e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="pixFavorecido">Nome do favorecido (PIX)</label>
            <input
              id="pixFavorecido"
              value={form.pixFavorecido}
              onChange={(e) => handleChange('pixFavorecido', e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="pixChave">Chave PIX</label>
            <input id="pixChave" value={form.pixChave} onChange={(e) => handleChange('pixChave', e.target.value)} />
          </div>
        </div>

        {mensagem && <div className="mensagem-sucesso" style={{ marginTop: 16 }}>{mensagem}</div>}

        <button type="submit" className="botao botao-primario" style={{ marginTop: 18 }} disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar configuração'}
        </button>
      </form>
    </div>
  );
}
