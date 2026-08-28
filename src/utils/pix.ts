/**
 * Gerador de Payload PIX Padrão Banco Central do Brasil (EMVCo)
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16CCITT(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function gerarPixCopiaECola(
  chavePix: string,
  beneficiario: string,
  cidade: string,
  valor: number,
  txid: string = '***'
): string {
  const chaveFormatada = chavePix.replace(/[^\w@.-]/g, '');
  const nomeLimpo = beneficiario
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 25)
    .toUpperCase();
  const cidadeLimpa = cidade
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 15)
    .toUpperCase() || 'RECIFE';

  const merchantAccountInfo = 
    formatField('00', 'BR.GOV.BCB.PIX') +
    formatField('01', chaveFormatada);

  const additionalDataField = formatField('05', txid || '***');

  let raw = 
    formatField('00', '01') + // Payload Format Indicator
    formatField('26', merchantAccountInfo) +
    formatField('52', '0000') + // Merchant Category Code
    formatField('53', '986') + // Transaction Currency (BRL)
    formatField('54', valor.toFixed(2)) + // Transaction Amount
    formatField('58', 'BR') + // Country Code
    formatField('59', nomeLimpo) + // Merchant Name
    formatField('60', cidadeLimpa) + // Merchant City
    formatField('62', additionalDataField) +
    '6304'; // CRC16 placeholder

  const crc = crc16CCITT(raw);
  return `${raw}${crc}`;
}
