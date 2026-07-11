import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { formatarNumeroId } from "../utils/formatters";

const COLECAO_RIFA = "rifa";
const COLECAO_PEDIDOS = "pedidos";
const CONFIG_DOC = "config/rifa";

/* -------------------------------------------------------------------------- */
/* Configuração da rifa                                                      */
/* -------------------------------------------------------------------------- */

export const configPadrao = {
  nomeRifa: "Rifa Beneficente",
  descricao: "Ajude a nossa causa e concorra a um prêmio especial!",
  valorNumero: 10,
  quantidadeNumeros: 200,
  fotoPremio: "",
  pixChave: "",
  pixFavorecido: "",
  whatsappContato: "",
};

export function ouvirConfiguracao(callback) {
  const ref = doc(db, CONFIG_DOC);
  return onSnapshot(ref, (snap) => {
    callback(
      snap.exists() ? { ...configPadrao, ...snap.data() } : configPadrao,
    );
  });
}

export async function obterConfiguracao() {
  const snap = await getDoc(doc(db, CONFIG_DOC));
  return snap.exists() ? { ...configPadrao, ...snap.data() } : configPadrao;
}

export async function salvarConfiguracao(config) {
  await setDoc(doc(db, CONFIG_DOC), config, { merge: true });
}

/* -------------------------------------------------------------------------- */
/* Números da rifa                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Escuta em tempo real todos os documentos da coleção "rifa", ordenados por número.
 */
export function ouvirNumeros(callback) {
  const q = query(collection(db, COLECAO_RIFA), orderBy("numero"));
  return onSnapshot(q, (snapshot) => {
    const numeros = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(numeros);
  });
}

/**
 * Cria (ou completa) os documentos da rifa de 1 até quantidadeNumeros,
 * caso ainda não existam. Usa lotes de 400 gravações para respeitar o limite do Firestore.
 */
export async function garantirNumerosCriados(quantidadeNumeros) {
  const existentesSnap = await getDocs(collection(db, COLECAO_RIFA));
  const existentes = new Set(existentesSnap.docs.map((d) => d.id));

  const pendentes = [];
  for (let n = 1; n <= quantidadeNumeros; n += 1) {
    const id = formatarNumeroId(n, quantidadeNumeros);
    if (!existentes.has(id)) pendentes.push({ id, numero: n });
  }

  const TAMANHO_LOTE = 400;
  for (let i = 0; i < pendentes.length; i += TAMANHO_LOTE) {
    const lote = pendentes.slice(i, i + TAMANHO_LOTE);
    const batch = writeBatch(db);
    lote.forEach(({ id, numero }) => {
      batch.set(doc(db, COLECAO_RIFA, id), {
        numero,
        reservado: false,
        pago: false,
        nome: "",
        telefone: "",
        observacao: "",
        dataReserva: null,
      });
    });
    await batch.commit();
  }

  return pendentes.length;
}

/**
 * Reserva uma lista de números para um comprador, usando uma transação do
 * Firestore para impedir que dois usuários reservem o mesmo número ao mesmo tempo.
 *
 * Lança um erro com `erro.numerosIndisponiveis` (array) quando algum dos números
 * selecionados já havia sido reservado por outra pessoa. Os demais números que
 * ainda estavam livres são reservados normalmente.
 */
export async function reservarNumeros(
  numerosSelecionados,
  comprador,
  quantidadeNumeros,
) {
  let numerosIndisponiveis = [];
  let numerosReservados = [];

  await runTransaction(db, async (transaction) => {
    // Reinicia a cada tentativa da transação (o Firestore pode reexecutar em caso de conflito).
    numerosIndisponiveis = [];
    numerosReservados = [];

    const refs = numerosSelecionados.map((n) =>
      doc(db, COLECAO_RIFA, formatarNumeroId(n, quantidadeNumeros)),
    );

    // Todas as leituras devem ocorrer antes de qualquer escrita dentro da transação.
    const snaps = await Promise.all(refs.map((ref) => transaction.get(ref)));

    snaps.forEach((snap, i) => {
      const numero = numerosSelecionados[i];
      if (!snap.exists() || snap.data().reservado) {
        numerosIndisponiveis.push(numero);
      } else {
        numerosReservados.push({ numero, ref: refs[i] });
      }
    });

    numerosReservados.forEach(({ ref }) => {
      transaction.update(ref, {
        reservado: true,
        pago: false,
        nome: comprador.nome,
        telefone: comprador.telefone,
        dataReserva: serverTimestamp(),
      });
    });
  });

  if (numerosReservados.length > 0) {
    await addDoc(collection(db, COLECAO_PEDIDOS), {
      numeros: numerosReservados.map((n) => n.numero),
      nome: comprador.nome,
      telefone: comprador.telefone,
      data: serverTimestamp(),
    });
  }

  if (numerosIndisponiveis.length > 0) {
    const erro = new Error(
      "Alguns números já foram reservados por outra pessoa.",
    );
    erro.numerosIndisponiveis = numerosIndisponiveis;
    erro.numerosReservados = numerosReservados.map((n) => n.numero);
    throw erro;
  }

  return { numerosReservados: numerosReservados.map((n) => n.numero) };
}

/* -------------------------------------------------------------------------- */
/* Ações administrativas                                                    */
/* -------------------------------------------------------------------------- */

export async function marcarComoPago(numeroId) {
  await updateDoc(doc(db, COLECAO_RIFA, numeroId), { pago: true });
}

export async function desmarcarComoPago(numeroId) {
  await updateDoc(doc(db, COLECAO_RIFA, numeroId), { pago: false });
}

export async function cancelarReserva(numeroId) {
  await updateDoc(doc(db, COLECAO_RIFA, numeroId), {
    reservado: false,
    pago: false,
    nome: "",
    telefone: "",
    observacao: "",
    dataReserva: null,
  });
}

export async function liberarNumero(numeroId) {
  return cancelarReserva(numeroId);
}

export async function editarComprador(numeroId, dados) {
  await updateDoc(doc(db, COLECAO_RIFA, numeroId), {
    nome: dados.nome,
    telefone: dados.telefone,
    observacao: dados.observacao || "",
  });
}
