import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer({ config }) {
  return (
    <footer className="rodape">
      <div className="container rodape__grade">
        <div>
          <div className="rodape__titulo">Contato</div>
          <div className="rodape__destaque">{config.whatsappContato || 'Fale conosco pelo WhatsApp'}</div>
        </div>

        {config.pixChave && (
          <div>
            <div className="rodape__titulo">Pague com PIX</div>
            <div className="rodape__destaque">{config.pixFavorecido}</div>
            <div>{config.pixChave}</div>
          </div>
        )}

        <div>
          <div className="rodape__titulo">Sua ajuda faz toda a diferença</div>
          <div>Obrigada por participar e apoiar essa causa! 💜</div>
        </div>
      </div>

      <div className="rodape__baixo">
        <Link to="/admin" className="rodape__link-admin">
          Área administrativa
        </Link>
      </div>
    </footer>
  );
}
