import jsPDF from 'jspdf';
import { Reserva, EmpresaConfig } from '../types';
import { formatarMoeda, formatarDataPtBr, formatarDataHoraPtBr } from './formatters';

export interface GerarVoucherPdfResult {
  doc: jsPDF;
  blob: Blob;
  file: File;
  nomeArquivo: string;
  urlBlob: string;
}

/**
 * Gera o documento PDF oficial do Voucher da Reserva
 * em formato A4 profissional com dados da agência, destaque de embarque,
 * dados do passageiro e resumo financeiro.
 */
export async function gerarVoucherPdf(
  reserva: Reserva,
  empresa: EmpresaConfig
): Promise<GerarVoucherPdfResult> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2); // 182mm

  const nomeAgencia = reserva.agenciaEmissora || empresa.nomeFantasia || 'AGÊNCIA DE TURISMO';
  const dataPasseioFmt = formatarDataPtBr(reserva.dataPasseio);
  const dataEmissaoFmt = formatarDataHoraPtBr(reserva.dataEmissao || new Date().toISOString());
  const nomeArquivo = `Voucher_${reserva.codigoVoucher}.pdf`;

  // 1. CABEÇALHO DA AGÊNCIA (Fundo elegante superior)
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, margin, contentWidth, 32, 3, 3, 'F');

  // Adicionar Logomarca se houver
  let logoXOffset = margin + 4;
  if (empresa.logoBase64 && empresa.logoBase64.startsWith('data:image')) {
    try {
      const format = empresa.logoBase64.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(empresa.logoBase64, format, logoXOffset, margin + 3.5, 25, 25);
      logoXOffset += 28;
    } catch (e) {
      console.warn('Erro ao inserir imagem no PDF, usando placeholder:', e);
      // Fallback ícone
      doc.setFillColor(37, 99, 235); // Blue 600
      doc.roundedRect(logoXOffset, margin + 4, 24, 24, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TURISMO', logoXOffset + 12, margin + 17, { align: 'center' });
      logoXOffset += 27;
    }
  } else {
    // Placeholder estilizado
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.roundedRect(logoXOffset, margin + 4, 24, 24, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TURISMO', logoXOffset + 12, margin + 17, { align: 'center' });
    logoXOffset += 27;
  }

  // Textos do Cabeçalho
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(nomeAgencia.toUpperCase(), logoXOffset, margin + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate 300
  const razaoSocialTxt = empresa.razaoSocial || nomeAgencia;
  const cnpjTxt = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
  const cadasturTxt = empresa.cadastur ? `CADASTUR: ${empresa.cadastur}` : '';
  const telTxt = empresa.telefoneWhatsapp ? `WhatsApp: ${empresa.telefoneWhatsapp}` : '';
  const enderecoTxt = empresa.enderecoCompleto ? `${empresa.enderecoCompleto}` : (empresa.cidadeBase || '');

  doc.text(`${razaoSocialTxt}  ${cnpjTxt ? '• ' + cnpjTxt : ''}`, logoXOffset, margin + 15);
  doc.text(`${cadasturTxt ? cadasturTxt + ' • ' : ''}${telTxt}`, logoXOffset, margin + 20);
  if (enderecoTxt) {
    doc.text(enderecoTxt, logoXOffset, margin + 25);
  }

  // TÍTULO DO DOCUMENTO (Badge lateral direita)
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.roundedRect(margin + contentWidth - 52, margin + 5, 48, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CONFIRMAÇÃO DE RESERVA', margin + contentWidth - 28, margin + 11, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`VOUCHER #${reserva.codigoVoucher}`, margin + contentWidth - 28, margin + 20, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`Emissão: ${dataEmissaoFmt}`, margin + contentWidth - 28, margin + 26, { align: 'center' });

  // 2. BLOCO DE DESTAQUE MÁXIMO VISUAL: EMBARQUE
  let currentY = margin + 36;
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.setDrawColor(99, 102, 241); // Indigo 500
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'FD');

  // Ícone / Faixa de Embarque
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.roundedRect(margin + 3, currentY + 3, contentWidth - 6, 6, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DADOS CRÍTICOS DE EMBARQUE (ATENÇÃO AOS HORÁRIOS)', margin + (contentWidth / 2), currentY + 7.2, { align: 'center' });

  // 3 Colunas: DATA | HORÁRIO | LOCAL
  const colWidth = (contentWidth - 8) / 3;

  // Coluna 1: DATA
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DATA DO PASSEIO', margin + 6, currentY + 14);
  doc.setTextColor(30, 27, 75); // Indigo 950
  doc.setFontSize(11);
  doc.text(dataPasseioFmt, margin + 6, currentY + 20);

  // Coluna 2: HORÁRIO
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.text('HORÁRIO PREVISTO', margin + 6 + colWidth, currentY + 14);
  doc.setTextColor(190, 24, 93); // Rose 700
  doc.setFontSize(11);
  doc.text(reserva.horarioEmbarquePrevisto || '08:00 (Aguardar no Lobby)', margin + 6 + colWidth, currentY + 20);

  // Coluna 3: LOCAL
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.text('HOTEL / LOCAL DE EMBARQUE', margin + 6 + (colWidth * 2), currentY + 14);
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(10);
  const localTexto = `${reserva.clienteHotel}${reserva.clienteQuarto ? ` (Apto ${reserva.clienteQuarto})` : ''}`;
  doc.text(localTexto.length > 28 ? localTexto.substring(0, 26) + '...' : localTexto, margin + 6 + (colWidth * 2), currentY + 20);

  // 3. DADOS DO PASSAGEIRO & SERVIÇO CONTRATADO
  currentY += 30;
  
  // Caixa de Passageiro e Serviço
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 54, 2, 2, 'FD');

  // Cabeçalho da seção
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DETALHES DO PASSAGEIRO & PASSEIO CONTRATADO', margin + 4, currentY + 5);

  let py = currentY + 13;
  // Linha 1: Titular e Telefone
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PASSAGEIRO TITULAR:', margin + 4, py);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(reserva.clienteNome.toUpperCase(), margin + 42, py);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('TELEFONE/WHATSAPP:', margin + 110, py);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text(reserva.clienteTelefone, margin + 148, py);

  // Linha 2: Passeio e Quantidade
  py += 9;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('PASSEIO / ROTEIRO:', margin + 4, py);
  doc.setTextColor(29, 78, 216); // Blue 700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(reserva.passeioNome, margin + 42, py);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('TOTAL DE PAX:', margin + 110, py);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  const paxDetalhe = `${reserva.totalPax} PAX (${reserva.paxAdultos} adt${reserva.paxCriancas ? ` + ${reserva.paxCriancas} chd` : ''}${reserva.paxBebes ? ` + ${reserva.paxBebes} bebê` : ''})`;
  doc.text(paxDetalhe, margin + 148, py);

  // Linha 3: Opcionais e Escala
  py += 9;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('OPCIONAIS INCLUSOS:', margin + 4, py);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const opcTexto = reserva.opcionaisSelecionados && reserva.opcionaisSelecionados.length > 0
    ? reserva.opcionaisSelecionados.map(o => `${o.quantidade}x ${o.nome}`).join(', ')
    : 'Nenhum opcional adicional selecionado';
  doc.text(opcTexto.length > 38 ? opcTexto.substring(0, 36) + '...' : opcTexto, margin + 42, py);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MOTORISTA / GUIA:', margin + 110, py);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  const motoristaTxt = reserva.motoristaNome 
    ? `${reserva.motoristaNome} ${reserva.veiculoInfo ? `(${reserva.veiculoInfo})` : ''}` 
    : 'Central de Logística (Em Escala)';
  doc.text(motoristaTxt.length > 25 ? motoristaTxt.substring(0, 23) + '...' : motoristaTxt, margin + 148, py);

  // Linha 4: Observações
  py += 9;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OBSERVAÇÕES:', margin + 4, py);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  const obsTexto = reserva.observacoesVoucher || reserva.observacoesInternas || 'Chegar com 10 minutos de antecedência na recepção do hotel.';
  doc.text(obsTexto.length > 90 ? obsTexto.substring(0, 88) + '...' : obsTexto, margin + 42, py);

  // Linha 5: Agência Emissora & Vendedor
  py += 9;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AGÊNCIA EMISSORA:', margin + 4, py);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${reserva.agenciaEmissora} ${reserva.vendedorNome ? `(Vendedor: ${reserva.vendedorNome})` : ''}`, margin + 42, py);

  // 4. RESUMO FINANCEIRO E SITUAÇÃO DE PAGAMENTO
  currentY += 58;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 36, 2, 2, 'FD');

  // Cabeçalho Financeiro
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CONDIÇÕES FINANCEIRAS & STATUS DE PAGAMENTO', margin + 4, currentY + 5);

  const cardW = (contentWidth - 12) / 3;
  const fY = currentY + 10;

  // Bloco 1: Valor Total
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 3, fY, cardW, 22, 1.5, 1.5, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('VALOR TOTAL DO PASSEIO', margin + 3 + (cardW / 2), fY + 6, { align: 'center' });
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(formatarMoeda(reserva.valorTotal), margin + 3 + (cardW / 2), fY + 14, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`${reserva.totalPax} passageiro(s)`, margin + 3 + (cardW / 2), fY + 19, { align: 'center' });

  // Bloco 2: Sinal Pago
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.roundedRect(margin + 6 + cardW, fY, cardW, 22, 1.5, 1.5, 'FD');
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('SINAL PAGO (CONFIRMADO)', margin + 6 + cardW + (cardW / 2), fY + 6, { align: 'center' });
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.setFontSize(11);
  doc.text(formatarMoeda(reserva.valorSinalPago), margin + 6 + cardW + (cardW / 2), fY + 14, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text(`via ${reserva.formaPagamentoSinal.toUpperCase()}`, margin + 6 + cardW + (cardW / 2), fY + 19, { align: 'center' });

  // Bloco 3: Saldo / Status
  if (reserva.saldoQuitado) {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(52, 211, 153);
    doc.roundedRect(margin + 9 + (cardW * 2), fY, cardW, 22, 1.5, 1.5, 'FD');
    doc.setTextColor(6, 95, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('SITUAÇÃO DO SALDO', margin + 9 + (cardW * 2) + (cardW / 2), fY + 6, { align: 'center' });
    doc.setTextColor(4, 120, 87);
    doc.setFontSize(10);
    doc.text('100% QUITADO', margin + 9 + (cardW * 2) + (cardW / 2), fY + 14, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text('Nenhum valor a pagar', margin + 9 + (cardW * 2) + (cardW / 2), fY + 19, { align: 'center' });
  } else {
    doc.setFillColor(254, 242, 242); // Red 50
    doc.setDrawColor(254, 202, 202); // Red 200
    doc.roundedRect(margin + 9 + (cardW * 2), fY, cardW, 22, 1.5, 1.5, 'FD');
    doc.setTextColor(153, 27, 27); // Red 800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('SALDO A PAGAR NO EMBARQUE', margin + 9 + (cardW * 2) + (cardW / 2), fY + 6, { align: 'center' });
    doc.setTextColor(185, 28, 28); // Red 700
    doc.setFontSize(11);
    doc.text(formatarMoeda(reserva.valorSaldoRestante), margin + 9 + (cardW * 2) + (cardW / 2), fY + 14, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(220, 38, 38);
    doc.text('Pagar ao motorista/guia', margin + 9 + (cardW * 2) + (cardW / 2), fY + 19, { align: 'center' });
  }

  // 5. INSTRUÇÕES GERAIS AO PASSAGEIRO
  currentY += 40;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 42, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INSTRUÇÕES IMPORTANTES & TERMOS GERAIS', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  let ty = currentY + 12;
  doc.text('1. APRESENTAÇÃO: Apresente este voucher digital no celular ou impresso no momento do embarque.', margin + 4, ty);
  ty += 5.5;
  doc.text('2. TOLERÂNCIA DE EMBARQUE: O tempo limite de espera no lobby é de 10 minutos para não atrasar os demais passageiros.', margin + 4, ty);
  ty += 5.5;
  doc.text('3. O QUE LEVAR: Protetor solar, toalha, óculos de sol, calçado próprio para água (crocs/sapatilha) e documento com foto.', margin + 4, ty);
  ty += 5.5;
  doc.text('4. CANCELAMENTO / REMARCAÇÃO: Solicitações com menos de 24 horas implicam em retenção do sinal para custos de escala.', margin + 4, ty);
  ty += 5.5;
  doc.text(`5. SUPORTE DA AGÊNCIA: Central de Atendimento e Dúvidas através do WhatsApp: ${empresa.telefoneWhatsapp}.`, margin + 4, ty);

  // 6. CAMPO DE ASSINATURA / ACEITE E AUTENTICAÇÃO DIGITAL
  currentY += 46;

  // Linha de Assinatura do Cliente
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(margin + 8, currentY + 14, margin + 85, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Assinatura / Aceite do Passageiro Titular', margin + 8, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(reserva.clienteNome, margin + 8, currentY + 22);

  // Linha de Visto da Agência
  doc.line(margin + 105, currentY + 14, margin + 175, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Visto de Embarque / Central de Operações', margin + 105, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${nomeAgencia} • Cadastur: ${empresa.cadastur || '-'}`, margin + 105, currentY + 22);

  // 7. RODAPÉ OFICIAL OBRIGATÓRIO
  const footerY = pageHeight - margin + 4;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Voucher emitido pelo TurismoOS', margin, footerY);
  doc.text(`${nomeAgencia} • ${empresa.telefoneWhatsapp}`, margin + (contentWidth / 2), footerY, { align: 'center' });
  doc.text(`Voucher #${reserva.codigoVoucher} • ${dataEmissaoFmt}`, margin + contentWidth, footerY, { align: 'right' });

  // Gerar Blob e File
  const blob = doc.output('blob');
  const file = new File([blob], nomeArquivo, { type: 'application/pdf' });
  const urlBlob = URL.createObjectURL(blob);

  return {
    doc,
    blob,
    file,
    nomeArquivo,
    urlBlob
  };
}
