const idCampo = (id, valor) =>
  `${id}${String(valor.length).padStart(2, "0")}${valor}`;

function crc16(str) {
  let crc = 0xffff;

  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }

      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function gerarPix({
  chave,
  nome,
  cidade,
  valor,
  descricao = "",
  txid = "***",
}) {
  const gui = idCampo("00", "br.gov.bcb.pix");

  const chavePix = idCampo("01", chave);

  const descricaoPix = "";

  const merchantAccount = idCampo("26", gui + chavePix + descricaoPix);

  const nomePix = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/gi, "")
    .substring(0, 25)
    .toUpperCase();

  const cidadePix = cidade
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/gi, "")
    .substring(0, 15)
    .toUpperCase();

  const payload =
    idCampo("00", "01") +
    idCampo("01", "11") +
    merchantAccount +
    idCampo("52", "0000") +
    idCampo("53", "986") +
    idCampo("54", Number(valor).toFixed(2)) +
    idCampo("58", "BR") +
    idCampo("59", nomePix) +
    idCampo("60", cidadePix) +
    idCampo("62", idCampo("05", txid)) +
    "6304";

  return payload + crc16(payload);
}
