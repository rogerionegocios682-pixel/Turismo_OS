import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Truck, 
  Calendar, 
  MapPin, 
  Phone, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Printer, 
  UserCheck, 
  AlertTriangle,
  Building,
  Users,
  MessageSquare
} from 'lucide-react';
import { 
  formatarMoeda, 
  formatarDataPtBr, 
  gerarTextoWhatsappMotorista,
  verificarPendenciaSaldo 
} from '../../utils/formatters';
import { FormaPagamento, Reserva, StatusEmbarque } from '../../types';
import { ModalWhatsappReserva } from '../Reservas/ModalWhatsappReserva';

export const RotaMotoristaView: React.FC = () => {
  const { 
    reservas, 
    motoristas, 
    empresaConfig, 
    agenciaAtiva,
    usuarioLogado,
    atualizarStatusEmbarque, 
    quitarSaldoReserva,
    abrirVoucherModal,
    abrirRelatorioPdfModal
  } = useTurismo();

  const hojeIso = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState(hojeIso);
  const [motoristaFiltro, setMotoristaFiltro] = useState<string>('todos');

  // Modal para recebimento de saldo no embarque
  const [reservaBaixa, setReservaBaixa] = useState<Reserva | null>(null);
  const [formaPagto, setFormaPagto] = useState<FormaPagamento>('pix');

  // Modal para Enviar no WhatsApp do Passageiro
  const [reservaParaWhatsapp, setReservaParaWhatsapp] = useState<Reserva | null>(null);

  // Filtrar reservas do dia com isolamento de agência
  const reservasDoDia = useMemo(() => {
    return reservas
      .filter((r) => {
        if (agenciaAtiva !== "Todas as Agências" && r.agenciaEmissora !== agenciaAtiva) return false;
        if (r.dataPasseio !== dataSelecionada) return false;
        if (r.status === 'cancelada') return false;
        if (motoristaFiltro !== 'todos' && r.motoristaVeiculoId !== motoristaFiltro) return false;
        return true;
      })
      .sort((a, b) => (a.horarioEmbarquePrevisto || '08:00').localeCompare(b.horarioEmbarquePrevisto || '08:00'));
  }, [reservas, dataSelecionada, motoristaFiltro, agenciaAtiva]);

  // Totais da rota
  const totaisRota = useMemo(() => {
    let totalPax = 0;
    let totalSaldosPendentes = 0;
    let totalSaldosQuitados = 0;
    let totalEmbarcados = 0;

    reservasDoDia.forEach((r) => {
      totalPax += r.totalPax;
      if (r.saldoQuitado) {
        totalSaldosQuitados += (r.valorTotal - r.valorSinalPago);
      } else {
        totalSaldosPendentes += r.valorSaldoRestante;
      }
      if (r.statusEmbarque === 'embarcado_saldo_pago' || r.statusEmbarque === 'embarcado_saldo_cortesia') {
        totalEmbarcados += r.totalPax;
      }
    });

    return { totalPax, totalSaldosPendentes, totalSaldosQuitados, totalEmbarcados };
  }, [reservasDoDia]);

  // Enviar manifesto para o WhatsApp do motorista
  const handleEnviarWhatsappMotorista = () => {
    const motoristaObj = motoristas.find(m => m.id === motoristaFiltro);
    const nomeMot = motoristaObj ? motoristaObj.nomeMotorista : 'Equipe de Transporte';
    const veic = motoristaObj ? `${motoristaObj.veiculoModelo} (${motoristaObj.placaOuRegistro})` : 'Frota Geral';
    
    const texto = gerarTextoWhatsappMotorista(
      dataSelecionada,
      nomeMot,
      veic,
      reservasDoDia,
      empresaConfig
    );

    const tel = motoristaObj?.telefone.replace(/\D/g, '') || '';
    const url = tel 
      ? `https://wa.me/55${tel}?text=${encodeURIComponent(texto)}`
      : `https://wa.me/?text=${encodeURIComponent(texto)}`;
    
    window.open(url, '_blank');
  };

  // Abrir Documento Oficial de Impressão / PDF da Rota
  const handleAbrirPdfRota = () => {
    const motoristaObj = motoristas.find(m => m.id === motoristaFiltro);
    abrirRelatorioPdfModal({
      tipo: 'rota',
      titulo: 'MANIFESTO DE EMBARQUE & ROTA DO MOTORISTA',
      subtitulo: `Operação de Transporte & Transfer: ${formatarDataPtBr(dataSelecionada)}`,
      periodoOuFiltro: `Data: ${formatarDataPtBr(dataSelecionada)} | Motorista: ${motoristaObj ? motoristaObj.nomeMotorista : 'Todos os Motoristas'}`,
      dados: {
        data: dataSelecionada,
        motoristaNome: motoristaObj ? motoristaObj.nomeMotorista : 'Todos os Motoristas',
        veiculoInfo: motoristaObj ? `${motoristaObj.veiculoModelo} (${motoristaObj.placaOuRegistro})` : 'Frota Geral',
        totais: totaisRota,
        reservas: reservasDoDia
      }
    });
  };

  const handleConfirmarBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (reservaBaixa) {
      atualizarStatusEmbarque(reservaBaixa.id, 'embarcado_saldo_pago', formaPagto);
      toast.success(
        (t) => (
          <div>
            <span className="font-bold text-slate-900">Embarque confirmado!</span>
            <p className="text-[11px] text-slate-600">
              {reservaBaixa.clienteNome} • Saldo de {formatarMoeda(reservaBaixa.valorSaldoRestante)} recebido ({formaPagto.toUpperCase()}).
            </p>
          </div>
        ),
        { icon: '✅', duration: 4000 }
      );
      setReservaBaixa(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho & Filtro de Rota */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Truck className="w-6 h-6 text-blue-600" />
            <span>Manifesto de Embarque & Rota do Motorista</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Controle de paradas nos resorts, verificação de passageiros e recebimento de saldos na van/buggy.
          </p>
        </div>

        {/* Controles de Filtro de Data e Motorista */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <label className="text-slate-500">Motorista:</label>
            <select
              value={motoristaFiltro}
              onChange={(e) => setMotoristaFiltro(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos os Motoristas</option>
              {motoristas.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nomeMotorista} ({m.veiculoModelo})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleEnviarWhatsappMotorista}
            disabled={reservasDoDia.length === 0}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Enviar lista de embarque formatada no WhatsApp do Motorista"
          >
            <Share2 className="w-4 h-4" />
            <span>Zap Motorista</span>
          </button>

          <button
            onClick={handleAbrirPdfRota}
            disabled={reservasDoDia.length === 0}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            title="Abrir prancheta oficial para imprimir ou salvar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Gerar PDF</span>
          </button>

        </div>
      </div>

      {/* Resumo da Rota (KPIs da Viagem) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Data da Rota</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            {formatarDataPtBr(dataSelecionada)}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold">{reservasDoDia.length} paradas agendadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total Passageiros</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            {totaisRota.totalPax} PAX
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">{totaisRota.totalEmbarcados} já embarcados</span>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase">Saldos a Recolher (Embarque)</span>
          <p className="text-lg font-black text-amber-950 mt-0.5">
            {formatarMoeda(totaisRota.totalSaldosPendentes)}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold">Cobrar dos passageiros na van/buggy</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase">Saldos Já Arrecadados</span>
          <p className="text-lg font-black text-emerald-950 mt-0.5">
            {formatarMoeda(totaisRota.totalSaldosQuitados)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">Baixados no sistema</span>
        </div>

      </div>

      {/* Lista de Paradas / Cards de Embarque */}
      <div className="space-y-4">
        {reservasDoDia.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <Truck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-base text-slate-700">Nenhum embarque agendado para esta data ou motorista</p>
            <p className="text-xs text-slate-400 mt-1">Selecione outra data no topo ou escale novas reservas.</p>
          </div>
        ) : (
          reservasDoDia.map((r, index) => {
            const isEmbarcado = r.statusEmbarque === 'embarcado_saldo_pago' || r.statusEmbarque === 'embarcado_saldo_cortesia';
            const isNoShow = r.statusEmbarque === 'no_show';
            const pendencia = verificarPendenciaSaldo(r);
            const isSaldoPendenteUrgente = !r.saldoQuitado && !isEmbarcado && !isNoShow;

            return (
              <div 
                key={r.id}
                className={`bg-white border-2 rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  isEmbarcado 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : isNoShow 
                      ? 'border-red-200 bg-red-50/20' 
                      : isSaldoPendenteUrgente
                        ? 'border-red-400 bg-red-50/15 shadow-sm'
                        : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Lado Esquerdo: Dados da Parada */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                      Parada #{index + 1}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {r.horarioEmbarquePrevisto || '08:00'}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-lg">
                      {r.totalPax} pax ({r.paxAdultos} adt {r.paxCriancas ? `+ ${r.paxCriancas} chd` : ''})
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{r.codigoVoucher}
                    </span>

                    {/* Alerta de Saldo a Receber */}
                    {isSaldoPendenteUrgente && (
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Cobrança Obrigatória no Embarque
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-900">{r.clienteNome}</h3>
                    <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{r.clienteHotel} {r.clienteQuarto ? `• Quarto: ${r.clienteQuarto}` : ''}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span><strong>Passeio:</strong> {r.passeioNome}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {r.clienteTelefone}
                    </span>
                    {r.motoristaNome && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500">Motorista: {r.motoristaNome}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Lado Direito: Saldo & Ações de Embarque */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  
                  {/* Bloco de Saldo */}
                  <div className={`p-3 rounded-xl text-right min-w-[160px] border ${
                    r.saldoQuitado 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-red-100/90 border-red-300 text-red-900 shadow-xs'
                  }`}>
                    <span className={`text-[9px] font-black uppercase block ${
                      r.saldoQuitado ? 'text-slate-500' : 'text-red-700'
                    }`}>
                      {r.saldoQuitado ? 'SALDO QUITADO' : '⚠️ COBRAR NO EMBARQUE'}
                    </span>
                    <span className={`text-base font-black ${r.saldoQuitado ? 'text-emerald-700' : 'text-red-700'}`}>
                      {r.saldoQuitado ? 'R$ 0,00' : formatarMoeda(r.valorSaldoRestante)}
                    </span>
                    <span className={`text-[9px] block ${r.saldoQuitado ? 'text-slate-500' : 'text-red-600 font-semibold'}`}>
                      (Sinal pago: {formatarMoeda(r.valorSinalPago)})
                    </span>
                  </div>

                  {/* Botões de Ação de Embarque */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    
                    {/* Botão Enviar no WhatsApp */}
                    <button
                      onClick={() => setReservaParaWhatsapp(r)}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                      title="Enviar detalhes e voucher no WhatsApp do cliente"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold">WhatsApp</span>
                    </button>

                    {/* Se ainda não embarcou */}
                    {!isEmbarcado && (
                      <button
                        onClick={() => {
                          if (r.saldoQuitado) {
                            atualizarStatusEmbarque(r.id, 'embarcado_saldo_cortesia');
                            toast.success(`Embarque confirmado para ${r.clienteNome} (Saldo 100% quitado)!`, {
                              icon: '🎫'
                            });
                          } else {
                            setReservaBaixa(r);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Embarcar & Receber</span>
                      </button>
                    )}

                    {/* Se já embarcou */}
                    {isEmbarcado && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-2 rounded-xl border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Embarcado ({r.horaEmbarqueEfetivo || 'OK'})</span>
                      </span>
                    )}

                    {/* No Show */}
                    {!isEmbarcado && !isNoShow && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Confirmar No-Show (Passageiro ausente) para ${r.clienteNome}?`)) {
                            atualizarStatusEmbarque(r.id, 'no_show');
                            toast.error(`No-Show registrado para ${r.clienteNome}.`, {
                              icon: '❌'
                            });
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Marcar No-Show (Passageiro não compareceu)"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Baixa de Saldo na Rota */}
      {reservaBaixa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Receber Saldo no Embarque</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Passageiro: <strong>{reservaBaixa.clienteNome}</strong> (Hotel: {reservaBaixa.clienteHotel})
            </p>

            <form onSubmit={handleConfirmarBaixa} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-amber-800 uppercase block">Saldo a Recolher Agora:</span>
                <span className="text-2xl font-black text-amber-950">
                  {formatarMoeda(reservaBaixa.valorSaldoRestante)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Forma de Pagamento Recebida no Local:
                </label>
                <select
                  value={formaPagto}
                  onChange={(e) => setFormaPagto(e.target.value as FormaPagamento)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="pix">PIX (Comprovante verificado pelo motorista)</option>
                  <option value="dinheiro">Dinheiro em Espécie</option>
                  <option value="cartao_credito">Cartão de Crédito (Maquininha móvel)</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReservaBaixa(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Confirmar Embarque & Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Enviar no WhatsApp do Passageiro */}
      {reservaParaWhatsapp && (
        <ModalWhatsappReserva
          reserva={reservaParaWhatsapp}
          empresaConfig={empresaConfig}
          aoFechar={() => setReservaParaWhatsapp(null)}
          aoAbrirVoucher={() => {
            const res = reservaParaWhatsapp;
            setReservaParaWhatsapp(null);
            abrirVoucherModal(res, 'a4');
          }}
        />
      )}

    </div>
  );
};
