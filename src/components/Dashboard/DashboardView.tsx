import React, { useState, useMemo } from 'react';
import { useTurismo } from '../../context/TurismoContext';
import { 
  DollarSign, 
  AlertCircle, 
  AlertTriangle,
  Users, 
  Ticket, 
  Search, 
  Calendar, 
  Printer, 
  Share2, 
  CheckCircle2, 
  XCircle, 
  Receipt,
  Eye,
  Plus,
  Filter,
  ArrowUpDown,
  CreditCard,
  MessageSquare,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { formatarMoeda, formatarDataPtBr, verificarPendenciaSaldo } from '../../utils/formatters';
import { FormaPagamento, Reserva } from '../../types';
import { ModalWhatsappReserva } from '../Reservas/ModalWhatsappReserva';

export const DashboardView: React.FC = () => {
  const { 
    reservas, 
    agenciaAtiva, 
    empresaConfig,
    setActiveTab, 
    abrirVoucherModal, 
    quitarSaldoReserva, 
    cancelarReserva,
    abrirRelatorioPdfModal
  } = useTurismo();

  // Estados de Filtros
  const [busca, setBusca] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'hoje' | 'amanha' | 'semana' | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'saldo_pendente' | 'saldo_urgente' | 'embarcado' | 'confirmada'>('todos');
  
  // Modal de Baixa de Saldo Rápida
  const [reservaParaBaixa, setReservaParaBaixa] = useState<Reserva | null>(null);
  const [formaPagtoBaixa, setFormaPagtoBaixa] = useState<FormaPagamento>('pix');

  // Modal de Enviar no WhatsApp
  const [reservaParaWhatsapp, setReservaParaWhatsapp] = useState<Reserva | null>(null);

  const hojeIso = new Date().toISOString().split('T')[0];
  const amanhaIso = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Filtragem de Reservas
  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r) => {
      // 1. Filtro de Agência
      if (agenciaAtiva !== "Todas as Agências" && r.agenciaEmissora !== agenciaAtiva) {
        return false;
      }

      // 2. Filtro de Período
      if (filtroPeriodo === 'hoje' && r.dataPasseio !== hojeIso) return false;
      if (filtroPeriodo === 'amanha' && r.dataPasseio !== amanhaIso) return false;

      // 3. Filtro de Status
      if (filtroStatus === 'saldo_pendente' && (r.saldoQuitado || r.status === 'cancelada')) return false;
      if (filtroStatus === 'saldo_urgente') {
        if (r.saldoQuitado || r.status === 'cancelada') return false;
        const pendencia = verificarPendenciaSaldo(r);
        if (pendencia.urgencia !== 'urgente') return false;
      }
      if (filtroStatus === 'embarcado' && r.statusEmbarque !== 'embarcado_saldo_pago' && r.statusEmbarque !== 'embarcado_saldo_cortesia') return false;
      if (filtroStatus === 'confirmada' && r.status !== 'confirmada') return false;

      // 4. Busca de texto
      if (busca.trim()) {
        const query = busca.toLowerCase();
        const matchNome = r.clienteNome.toLowerCase().includes(query);
        const matchCodigo = r.codigoVoucher.toLowerCase().includes(query);
        const matchHotel = r.clienteHotel.toLowerCase().includes(query);
        const matchPasseio = r.passeioNome.toLowerCase().includes(query);
        const matchMotorista = r.motoristaNome?.toLowerCase().includes(query);
        if (!matchNome && !matchCodigo && !matchHotel && !matchPasseio && !matchMotorista) {
          return false;
        }
      }

      return true;
    });
  }, [reservas, agenciaAtiva, filtroPeriodo, filtroStatus, busca, hojeIso, amanhaIso]);

  // Cálculos de KPIs em tempo real
  const kpis = useMemo(() => {
    let faturamentoTotal = 0;
    let sinaisRecebidos = 0;
    let saldosPendentes = 0;
    let totalPax = 0;
    let totalReservasAtivas = 0;
    let saldosUrgentesCount = 0;

    reservas.forEach((r) => {
      if (r.status !== 'cancelada' && (agenciaAtiva === "Todas as Agências" || r.agenciaEmissora === agenciaAtiva)) {
        const pend = verificarPendenciaSaldo(r);
        if (pend.urgencia === 'urgente') {
          saldosUrgentesCount += 1;
        }
      }
    });

    reservasFiltradas.forEach((r) => {
      if (r.status !== 'cancelada') {
        faturamentoTotal += r.valorTotal;
        sinaisRecebidos += r.valorSinalPago;
        if (!r.saldoQuitado) {
          saldosPendentes += r.valorSaldoRestante;
        }
        totalPax += r.totalPax;
        totalReservasAtivas += 1;
      }
    });

    return {
      faturamentoTotal,
      sinaisRecebidos,
      saldosPendentes,
      totalPax,
      totalReservasAtivas,
      saldosUrgentesCount
    };
  }, [reservas, reservasFiltradas, agenciaAtiva]);

  const handleConfirmarBaixaSaldo = (e: React.FormEvent) => {
    e.preventDefault();
    if (reservaParaBaixa) {
      quitarSaldoReserva(reservaParaBaixa.id, formaPagtoBaixa);
      setReservaParaBaixa(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Bruto</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {formatarMoeda(kpis.faturamentoTotal)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {kpis.totalReservasAtivas} reservas no filtro
            </span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Sinais Recebidos pelo Vendedor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SINAIS RECEBIDOS PELO VENDEDOR</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1 tracking-tight">
              {formatarMoeda(kpis.sinaisRecebidos)}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
              Sinais recebidos
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Saldos a Receber no Embarque */}
        <div className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between transition-all ${
          kpis.saldosUrgentesCount > 0 ? 'border-red-300 bg-red-50/10' : 'border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldos a Cobrar (Embarque)</p>
              {kpis.saldosUrgentesCount > 0 && (
                <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {kpis.saldosUrgentesCount} Urgentes
                </span>
              )}
            </div>
            <h3 className={`text-2xl font-black mt-1 tracking-tight ${
              kpis.saldosUrgentesCount > 0 ? 'text-red-600' : 'text-amber-600'
            }`}>
              {formatarMoeda(kpis.saldosPendentes)}
            </h3>
            <span className={`text-[11px] font-bold mt-1 inline-block ${
              kpis.saldosUrgentesCount > 0 ? 'text-red-700' : 'text-amber-700'
            }`}>
              {kpis.saldosUrgentesCount > 0 
                ? `Atenção: ${kpis.saldosUrgentesCount} passeio(s) próximo(s) com saldo!`
                : 'Para guias e motoristas'}
            </span>
          </div>
          <div className={`p-3.5 rounded-2xl ${
            kpis.saldosUrgentesCount > 0 ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total de Passageiros */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passageiros (PAX)</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {kpis.totalPax} PAX
            </h3>
            <span className="text-[11px] text-indigo-600 font-medium mt-1 inline-block">
              Capacidade em trânsito
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Barra de Filtros e Busca Rápida */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Campo de Busca */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente, voucher, hotel ou passeio..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filtros de Período e Status */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          
          {/* Período */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 shrink-0">
            <button
              onClick={() => setFiltroPeriodo('hoje')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filtroPeriodo === 'hoje' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setFiltroPeriodo('amanha')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filtroPeriodo === 'amanha' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Amanhã
            </button>
            <button
              onClick={() => setFiltroPeriodo('todos')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filtroPeriodo === 'todos' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Todos
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 shrink-0">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filtroStatus === 'todos' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus('saldo_urgente')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroStatus === 'saldo_urgente' 
                  ? 'bg-red-600 text-white shadow-xs font-bold' 
                  : 'text-red-700 hover:bg-red-50'
              }`}
              title="Reservas com passeio próximo (hoje, amanhã ou 2 dias) e saldo ainda a cobrar"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>⚠️ Cobranças Iminentes</span>
              {kpis.saldosUrgentesCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  filtroStatus === 'saldo_urgente' ? 'bg-white text-red-700' : 'bg-red-200 text-red-900'
                }`}>
                  {kpis.saldosUrgentesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFiltroStatus('saldo_pendente')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filtroStatus === 'saldo_pendente' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Todos Pendentes
            </button>
            <button
              onClick={() => setFiltroStatus('embarcado')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filtroStatus === 'embarcado' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Embarcados
            </button>
          </div>

          {/* Botão Nova Reserva */}
          <button
            onClick={() => setActiveTab('reservas')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir</span>
          </button>

        </div>

      </div>

      {/* Tabela de Histórico e Gestão de Reservas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-600" />
              <span>Painel Geral de Reservas e Saldos</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exibindo {reservasFiltradas.length} reservas ({agenciaAtiva})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                abrirRelatorioPdfModal({
                  tipo: 'reservas',
                  titulo: 'RELATÓRIO DE RESERVAS & PASSAGEIROS',
                  subtitulo: `Agência: ${agenciaAtiva} | Período: ${filtroPeriodo.toUpperCase()}`,
                  periodoOuFiltro: `Status: ${filtroStatus.toUpperCase()} | Filtro: ${filtroPeriodo.toUpperCase()}`,
                  dados: {
                    reservas: reservasFiltradas,
                    totalPax: kpis.totalPax,
                    totalVendas: kpis.faturamentoTotal,
                    totalSaldos: kpis.saldosPendentes
                  }
                });
              }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              title="Gerar PDF oficial com a listagem de reservas"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>🖨️ Imprimir / Gerar PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Passageiro / Hotel</th>
                <th className="py-3.5 px-4">Passeio Contratado</th>
                <th className="py-3.5 px-4">Data / Embarque</th>
                <th className="py-3.5 px-4">Valor Total</th>
                <th className="py-3.5 px-4">Sinal Pago</th>
                <th className="py-3.5 px-4 text-amber-700">Saldo a Cobrar</th>
                <th className="py-3.5 px-4">Guia / Motorista</th>
                <th className="py-3.5 px-4 text-center">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Ticket className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Nenhuma reserva encontrada</p>
                    <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros ou emitir uma nova reserva no balcão.</p>
                  </td>
                </tr>
              ) : (
                reservasFiltradas.map((r) => {
                  const isCancelada = r.status === 'cancelada';
                  const isEmbarcado = r.statusEmbarque === 'embarcado_saldo_pago' || r.statusEmbarque === 'embarcado_saldo_cortesia';
                  const pendencia = verificarPendenciaSaldo(r);
                  const isUrgente = pendencia.urgencia === 'urgente';
                  const isAtencao = pendencia.urgencia === 'atencao';

                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCancelada 
                          ? 'opacity-50 bg-slate-50/50' 
                          : isUrgente 
                            ? 'bg-red-50/35 border-l-4 border-l-red-600' 
                            : isAtencao 
                              ? 'border-l-4 border-l-amber-500' 
                              : ''
                      }`}
                    >
                      {/* Passageiro e Local */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{r.clienteNome}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-normal">
                            #{r.codigoVoucher}
                          </span>

                          {/* Badge de Alerta Vermelho de Saldo Próximo */}
                          {isUrgente && !isCancelada && (
                            <span 
                              className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse"
                              title="Passeio próximo com saldo ainda pendente de pagamento!"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Cobrar Saldo Imediato
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          🏨 {r.clienteHotel} {r.clienteQuarto ? `• Qto: ${r.clienteQuarto}` : ''}
                        </p>
                        <p className="text-[11px] text-slate-400">{r.clienteTelefone}</p>
                      </td>

                      {/* Passeio */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 text-xs line-clamp-1">{r.passeioNome}</p>
                        <span className="text-[11px] text-blue-700 font-medium">
                          {r.totalPax} pax ({r.paxAdultos} adt {r.paxCriancas ? `+ ${r.paxCriancas} chd` : ''})
                        </span>
                      </td>

                      {/* Data & Horário */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold block ${isUrgente ? 'text-red-700' : 'text-slate-800'}`}>
                            {formatarDataPtBr(r.dataPasseio)}
                          </span>
                          {isUrgente && (
                            <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                              {pendencia.diasParaPasseio === 0 ? 'HOJE' : pendencia.diasParaPasseio === 1 ? 'AMANHÃ' : `em ${pendencia.diasParaPasseio}d`}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Saída: {r.horarioEmbarquePrevisto || '08:00'}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                        {formatarMoeda(r.valorTotal)}
                      </td>

                      {/* Sinal */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-extrabold text-emerald-700 block">
                          {formatarMoeda(r.valorSinalPago)}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          via {r.formaPagamentoSinal}
                        </span>
                      </td>

                      {/* Saldo */}
                      <td className="py-3.5 px-4 text-xs">
                        {r.saldoQuitado ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Quitado
                          </span>
                        ) : (
                          <div className={`p-1.5 rounded-xl border ${
                            isUrgente 
                              ? 'bg-red-100/80 border-red-300 text-red-900' 
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}>
                            <div className="flex items-center gap-1">
                              {isUrgente ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              )}
                              <span className={`font-black text-sm block ${isUrgente ? 'text-red-700' : 'text-amber-800'}`}>
                                {formatarMoeda(r.valorSaldoRestante)}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold block ${isUrgente ? 'text-red-700' : 'text-amber-600'}`}>
                              {isUrgente ? '⚠️ Saldo Pendente Próximo' : 'Pagar no embarque'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Motorista */}
                      <td className="py-3.5 px-4 text-xs">
                        {r.motoristaNome ? (
                          <div>
                            <span className="font-semibold text-slate-900 block">{r.motoristaNome}</span>
                            <span className="text-[10px] text-slate-500">{r.veiculoInfo || 'Veículo escalado'}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Pendente escala</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Botão Baixar Saldo (se pendente) */}
                          {!r.saldoQuitado && !isCancelada && (
                            <button
                              onClick={() => setReservaParaBaixa(r)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title="Dar baixa no saldo recebido no embarque"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Baixar Saldo</span>
                            </button>
                          )}

                          {/* Botão Enviar no WhatsApp */}
                          {!isCancelada && (
                            <button
                              onClick={() => setReservaParaWhatsapp(r)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                              title="Enviar confirmação e voucher no WhatsApp do cliente"
                            >
                              <MessageSquare className="w-4 h-4 text-emerald-600" />
                              <span className="hidden xl:inline text-xs font-bold">WhatsApp</span>
                            </button>
                          )}

                          {/* Botão Voucher A4 */}
                          <button
                            onClick={() => abrirVoucherModal(r, 'a4')}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-all cursor-pointer"
                            title="Imprimir Voucher A4 (2 Vias)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Botão Cupom 80mm */}
                          <button
                            onClick={() => abrirVoucherModal(r, 'termico')}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 transition-all cursor-pointer"
                            title="Imprimir Cupom Térmico 80mm"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>

                          {/* Botão Cancelar (se não cancelada) */}
                          {!isCancelada && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja cancelar a reserva #${r.codigoVoucher} de ${r.clienteNome}?`)) {
                                  cancelarReserva(r.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                              title="Cancelar Reserva"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Rápido de Baixa de Saldo */}
      {reservaParaBaixa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Receber Saldo no Embarque</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Passageiro: <strong>{reservaParaBaixa.clienteNome}</strong> (Voucher #{reservaParaBaixa.codigoVoucher})
            </p>

            <form onSubmit={handleConfirmarBaixaSaldo} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-amber-800 uppercase block">Valor do Saldo a Receber:</span>
                <span className="text-2xl font-black text-amber-950">
                  {formatarMoeda(reservaParaBaixa.valorSaldoRestante)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Forma de Pagamento Recebida:
                </label>
                <select
                  value={formaPagtoBaixa}
                  onChange={(e) => setFormaPagtoBaixa(e.target.value as FormaPagamento)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="pix">PIX (Comprovante verificado)</option>
                  <option value="dinheiro">Dinheiro em Espécie</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReservaParaBaixa(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Confirmar Recebimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação e Envio no WhatsApp */}
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
