/**
 * Script opcional para popular o Firestore com os números da rifa e a
 * configuração inicial, direto do seu computador (não faz parte do site
 * publicado — é só uma ferramenta de apoio para quem preferir rodar via
 * linha de comando em vez de usar a tela "Configuração" do painel admin).
 *
 * Como usar:
 *  1. No Console do Firebase, gere uma chave de conta de serviço em
 *     Configurações do projeto > Contas de serviço > Gerar nova chave privada.
 *  2. Salve o arquivo baixado como "serviceAccountKey.json" na raiz do projeto
 *     (ele já está ignorado pelo .gitignore — nunca suba esse arquivo pro GitHub).
 *  3. Rode: npm install firebase-admin --save-dev
 *  4. Rode: npm run seed
 */
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const QUANTIDADE_NUMEROS = 200;

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function formatarId(numero, total) {
  const casas = String(total).length;
  return String(numero).padStart(casas, '0');
}

async function seed() {
  await db.doc('config/rifa').set(
    {
      nomeRifa: 'Rifa Beneficente — Festinha das Crianças',
      descricao: 'Faça não só uma criança feliz, mas várias! Concorra a um jogo de panelas.',
      valorNumero: 10,
      quantidadeNumeros: QUANTIDADE_NUMEROS,
      fotoPremio: '',
      pixChave: '',
      pixFavorecido: '',
      whatsappContato: '',
    },
    { merge: true }
  );

  let lote = db.batch();
  let contador = 0;

  for (let numero = 1; numero <= QUANTIDADE_NUMEROS; numero += 1) {
    const id = formatarId(numero, QUANTIDADE_NUMEROS);
    const ref = db.doc(`rifa/${id}`);
    lote.set(ref, {
      numero,
      reservado: false,
      pago: false,
      nome: '',
      telefone: '',
      email: '',
      observacao: '',
      dataReserva: null,
    });
    contador += 1;

    if (contador % 400 === 0) {
      await lote.commit();
      lote = db.batch();
    }
  }

  await lote.commit();
  console.log(`Concluído: ${QUANTIDADE_NUMEROS} números criados/atualizados.`);
}

seed().catch((err) => {
  console.error('Erro ao popular o Firestore:', err);
  process.exit(1);
});
