import { Reserva, EmpresaConfig } from '../types';

export function formatarMoeda(valor: number | undefined | null): string {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

export function formatarDataPtBr(dataIsoOuYmd: string | undefined | null): string {
  if (!dataIsoOuYmd) return '-';
  if (dataIsoOuYmd.includes('T')) {
    const d = new Date(dataIsoOuYmd);
    return d.toLocaleDateString('pt-BR');
  }
  const parts = dataIsoOuYmd.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataIsoOuYmd;
}

export function formatarDataHoraPtBr(dataIso: string | undefined | null): string {
  if (!dataIso) return '-';
  const d = new Date(dataIso);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export interface PendenciaSaldoInfo {
  temSaldoPendente: boolean;
  diasParaPasseio: number;
  urgencia: 'urgente' | 'atencao' | 'futuro' | 'quitado';
  mensagem: string;
}

export function verificarPendenciaSaldo(reserva: Reserva): PendenciaSaldoInfo {
  if (reserva.saldoQuitado || reserva.valorSaldoRestante <= 0 || reserva.status === 'cancelada') {
    return {
      temSaldoPendente: false,
      diasParaPasseio: 0,
      urgencia: 'quitado',
      mensagem: 'Saldo Quitado'
    };
  }

  // Calcular diferença em dias para a data do passeio
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [ano, mes, dia] = reserva.dataPasseio.split('-').map(Number);
  const dataPasseioObj = new Date(ano, mes - 1, dia);
  dataPasseioObj.setHours(0, 0, 0, 0);

  const diffMs = dataPasseioObj.getTime() - hoje.getTime();
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (dias <= 0) {
    // Hoje ou atrasado
    return {
      temSaldoPendente: true,
      diasParaPasseio: dias,
      urgencia: 'urgente',
      mensagem: dias === 0 ? 'Passeio HOJE - Saldo em aberto!' : `Passeio ocorreu há ${Math.abs(dias)} dia(s) com saldo pendente!`
    };
  } else if (dias <= 2) {
    // Amanhã ou em até 2 dias
    return {
      temSaldoPendente: true,
      diasParaPasseio: dias,
      urgencia: 'urgente',
      mensagem: dias === 1 ? 'Passeio AMANHÃ - Saldo em aberto!' : `Passeio em 2 dias - Saldo em aberto!`
    };
  } else if (dias <= 5) {
    return {
      temSaldoPendente: true,
      diasParaPasseio: dias,
      urgencia: 'atencao',
      mensagem: `Passeio em ${dias} dias - Saldo pendente`
    };
  } else {
    return {
      temSaldoPendente: true,
      diasParaPasseio: dias,
      urgencia: 'futuro',
      mensagem: `Passeio agendado (${dias} dias)`
    };
  }
}

export function gerarTextoWhatsappCliente(reserva: Reserva, empresa: EmpresaConfig): string {
  const nomeAgencia = reserva.agenciaEmissora || empresa.nomeFantasia || 'Agência de Turismo';

  return `Olá, *${reserva.clienteNome}*!

Segue em anexo o seu *Voucher de Confirmação da Reserva (PDF)*.

📄 *VOUCHER Nº:* #${reserva.codigoVoucher}
📍 *Passeio:* ${reserva.passeioNome}
📅 *Data do Passeio:* ${formatarDataPtBr(reserva.dataPasseio)}
⏰ *Horário de Embarque:* ${reserva.horarioEmbarquePrevisto || '08:00'}
🏨 *Local de Embarque:* ${reserva.clienteHotel}${reserva.clienteQuarto ? ` (Apto/Quarto: ${reserva.clienteQuarto})` : ''}

Por favor, confira os dados de sua reserva, data, horário e local de embarque descritos no PDF em anexo.

Atenciosamente,
*${nomeAgencia.toUpperCase()}*
WhatsApp / Suporte: ${empresa.telefoneWhatsapp}`;
}

export function gerarTextoWhatsappMotorista(
  data: string,
  nomeMotorista: string,
  veiculo: string,
  reservasDoDia: Reserva[],
  empresa: EmpresaConfig
): string {
  const dataFmt = formatarDataPtBr(data);
  let totalPax = 0;
  let totalSaldos = 0;

  const listaParadas = reservasDoDia.map((r, i) => {
    totalPax += r.totalPax;
    totalSaldos += r.saldoQuitado ? 0 : r.valorSaldoRestante;
    const saldoTxt = r.saldoQuitado
      ? '✅ [Saldo Quitado]'
      : `⚠️ *Cobrar Saldo:* ${formatarMoeda(r.valorSaldoRestante)}`;

    return `*PARADA #${i + 1}* - ${r.horarioEmbarquePrevisto || '08:00'}
👤 *Pax:* ${r.clienteNome} (${r.totalPax} pessoas)
📞 *Tel:* ${r.clienteTelefone}
🏨 *Hotel:* ${r.clienteHotel} ${r.clienteQuarto ? `(${r.clienteQuarto})` : ''}
🎟️ *Voucher:* #${r.codigoVoucher}
💵 ${saldoTxt}
------------------------`;
  }).join('\n');

  return `🚐 *MANIFESTO DE ROTA & EMBARQUE* 🚐
🏢 *${empresa.nomeFantasia}*
📅 *Data:* ${dataFmt}
👨‍✈️ *Motorista/Guia:* ${nomeMotorista}
🚘 *Veículo:* ${veiculo}
👥 *Total Pax a Bordo:* ${totalPax} passageiros
💰 *Total de Saldos a Recolher no Embarque:* ${formatarMoeda(totalSaldos)}

📋 *LISTA DE EMBARQUE:*
${listaParadas}

🚨 *Atenção:* Favor conferir o voucher e dar baixa nos saldos recebidos no sistema ao finalizar o embarque. Bom trabalho e boa viagem!`;
}
