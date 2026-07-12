import "../styles/SorteadorNumeros.css";

export default function SorteadorNumeros({ onAbrir }) {
  return (
    <button className="botao-sorteio" onClick={onAbrir}>
      🎲 Sortear meus números
    </button>
  );
}
