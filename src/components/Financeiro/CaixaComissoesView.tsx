import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  Users, 
  Check, 
  Plus, 
  Download, 
  CreditCard,
  Building,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { formatarMoeda, formatarDataHoraPtBr, formatarDataPtBr } from '../../utils/formatters';
import { FormaPagamento, TransacaoCaixa } from '../../types';

export const CaixaComissoesView: React.FC = () => {
  const { 
    transacoesCaixa, 
    reservas, 
    vendedores, 
    agenciaAtiva, 
    empresaConfig,
    registrarTransacaoManual, 
    pagarComissaoVendedor,
    abrirRelatorioPdfModal
  } = useTurismo();

  const [modalSangriaAberto, setModalSangriaAberto] = useState(false);
  const [tipoSangria, setTipoSangria] = useState<'saida_despesa' | 'sangria_retirada'>('sangria_retirada');
  const [valorSangria, setValorSangria] = useState(100.00);
  const [descricaoSangria, setDescricaoSangria] = useState('');
  const [formaPagtoSangria, setFormaPagtoSangria] = useState<FormaPagamento>('dinheiro');

  // Filtrar transações por agência
  const transacoesFiltradas = useMemo(() => {
    return transacoesCaixa.filter((t) => {
      if (agenciaAtiva !== "Todas as Agências" && t.agencia !== agenciaAtiva) {
        return false;
      }
      return true;
    });
  }, [transacoesCaixa, agenciaAtiva]);

  // Cálculos de Totais do Caixa
  const resumoFinanceiro = useMemo(() => {
    let totalEntradasSinais = 0;
    let totalEntradasSaldos = 0;
    let totalComissoesPagas = 0;
    let totalDespesasSangrias = 0;

    let totalPix = 0;
    let totalCartao = 0;
    let totalDinheiro = 0;

    transacoesFiltradas.forEach((t) => {
      if (t.tipo === 'entrada_sinal') {
        totalEntradasSinais += t.valor;
      } else if (t.tipo === 'entrada_saldo_embarque') {
        totalEntradasSaldos += t.valor;
      } else if (t.tipo === 'saida_comissao') {
        totalComissoesPagas += t.valor;
      } else if (t.tipo === 'saida_despesa' || t.tipo === 'sangria_retirada') {
        totalDespesasSangrias += t.valor;
      }

      // Por método
      if (t.tipo.startsWith('entrada')) {
        if (t.formaPagamento === 'pix') totalPix += t.valor;
        else if (t.formaPagamento.startsWith('cartao')) totalCartao += t.valor;
        else if (t.formaPagamento === 'dinheiro') totalDinheiro += t.valor;
      }
    });

    const saldoLiquidoEmCaixa = (totalEntradasSinais + totalEntradasSaldos) - (totalComissoesPagas + totalDespesasSangrias);

    return {
      totalEntradasSinais,
      totalEntradasSaldos,
      totalComissoesPagas,
      totalDespesasSangrias,
      saldoLiquidoEmCaixa,
      totalPix,
      totalCartao,
      totalDinheiro
    };
  }, [transacoesFiltradas]);

  // Lista de Comissões de Vendedores Pendentes vs Pagas
  const comissoesReservas = useMemo(() => {
    return reservas.filter(r => r.comissaoValor > 0 && r.status !== 'cancelada');
  }, [reservas]);

  const handleSalvarSangria = (e: React.FormEvent) => {
    e.preventDefault();

    registrarTransacaoManual({
      tipo: tipoSangria,
      agencia: agenciaAtiva !== "Todas as Agências" ? agenciaAtiva : "Matriz - Centro de Porto de Galinhas",
      valor: valorSangria,
      formaPagamento: formaPagtoSangria,
      descricao: descricaoSangria || (tipoSangria === 'sangria_retirada' ? 'Retirada / Sangria de Caixa' : 'Despesa Operacional'),
      operadorNome: 'Gerente / Caixa'
    });

    toast.success(
      tipoSangria === 'sangria_retirada'
        ? `Sangria de ${formatarMoeda(valorSangria)} registrada no caixa.`
        : `Despesa de ${formatarMoeda(valorSangria)} lançada no caixa.`,
      { icon: '💸' }
    );

    setModalSangriaAberto(false);
    setDescricaoSangria('');
  };

  const exportarRelatorioCsv = () => {
    const cabecalho = "Data/Hora,Tipo,Voucher,Agencia,Valor (R$),Forma Pagamento,Descricao,Operador\n";
    const linhas = transacoesFiltradas.map(t => 
      `"${formatarDataHoraPtBr(t.dataHora)}","${t.tipo}","${t.codigoVoucher || ''}","${t.agencia}","${t.valor.toFixed(2)}","${t.formaPagamento}","${t.descricao}","${t.operadorNome}"`
    ).join("\n");

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extrato_caixa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Extrato financeiro exportado em CSV com sucesso!', { icon: '📊' });
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <span>Fluxo de Caixa, Extrato & Comissões de Promotores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Controle de sinais capturados no balcão, saldos recolhidos pelos motoristas e repasse de comissões.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setModalSangriaAberto(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Lançar Retirada / Despesa</span>
          </button>

          <button
            onClick={() => {
              abrirRelatorioPdfModal({
                tipo: 'financeiro',
                titulo: 'EXTRATO FINANCEIRO & FLUXO DE CAIXA',
                subtitulo: `Unidade: ${agenciaAtiva}`,
                periodoOuFiltro: `Agência: ${agenciaAtiva}`,
                dados: {
                  transacoes: transacoesFiltradas,
                  resumo: resumoFinanceiro
                }
              });
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            title="Gerar PDF oficial do extrato e fechamento de caixa"
          >
            <Receipt className="w-4 h-4" />
            <span>🖨️ Imprimir / Gerar PDF</span>
          </button>

          <button
            onClick={exportarRelatorioCsv}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo de Caixa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Saldo Líquido em Caixa</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {formatarMoeda(resumoFinanceiro.saldoLiquidoEmCaixa)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Entradas menos saídas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Sinais Capturados (Balcão)</span>
          <p className="text-2xl font-black text-blue-700 mt-1">
            {formatarMoeda(resumoFinanceiro.totalEntradasSinais)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Arrecadado na venda</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Saldos Recebidos no Embarque</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">
            {formatarMoeda(resumoFinanceiro.totalEntradasSaldos)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Cobrados pelos motoristas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Comissões & Despesas</span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {formatarMoeda(resumoFinanceiro.totalComissoesPagas + resumoFinanceiro.totalDespesasSangrias)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Repasses e custos</span>
        </div>

      </div>

      {/* Breakdown por Meio de Pagamento */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Total Arrecadado via PIX</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">{formatarMoeda(resumoFinanceiro.totalPix)}</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Total em Cartão Crédito/Débito</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">{formatarMoeda(resumoFinanceiro.totalCartao)}</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Total em Dinheiro Vivo</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">{formatarMoeda(resumoFinanceiro.totalDinheiro)}</span>
        </div>
      </div>

      {/* Grid Duplo: Extrato de Transações Recentes & Painel de Comissões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lado Esquerdo: Extrato do Caixa */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Extrato de Movimentações Recentes</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{transacoesFiltradas.length} lançamentos</span>
          </div>

          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Lançamento / Descrição</th>
                  <th className="py-2.5 px-3">Forma</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacoesFiltradas.map((t) => {
                  const isEntrada = t.tipo.startsWith('entrada');

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {isEntrada ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800">{t.descricao}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatarDataHoraPtBr(t.dataHora)} • {t.agencia}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 uppercase font-semibold text-slate-600">
                        {t.formaPagamento.replace('_', ' ')}
                      </td>

                      <td className={`py-2.5 px-3 text-right font-black ${
                        isEntrada ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {isEntrada ? '+' : '-'} {formatarMoeda(t.valor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lado Direito: Controle de Comissões de Promotores */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Comissões de Promotores / Balcão</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{comissoesReservas.length} vendas comissionadas</span>
          </div>

          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Vendedor / Voucher</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Comissão</th>
                  <th className="py-2.5 px-3 text-center">Status / Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comissoesReservas.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{r.vendedorNome || 'Promotor'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{r.codigoVoucher}</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700">
                        {r.clienteNome}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {formatarMoeda(r.comissaoValor)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {r.comissaoPaga ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Pago
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              pagarComissaoVendedor(r.id);
                              toast.success(
                                `Comissão de ${formatarMoeda(r.comissaoValor)} paga para ${r.vendedorNome || 'Promotor'}!`,
                                { icon: '💰' }
                              );
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                          >
                            Pagar PIX
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal de Sangria / Retirada */}
      {modalSangriaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-amber-600" />
              <span>Registrar Retirada / Despesa no Caixa</span>
            </h3>

            <form onSubmit={handleSalvarSangria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo de Lançamento</label>
                <select
                  value={tipoSangria}
                  onChange={(e) => setTipoSangria(e.target.value as 'saida_despesa' | 'sangria_retirada')}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                >
                  <option value="sangria_retirada">Sangria de Caixa (Retirada de segurança)</option>
                  <option value="saida_despesa">Despesa Operacional (Combustível, lanche, manutenção)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorSangria}
                    onChange={(e) => setValorSangria(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Forma de Saída</label>
                  <select
                    value={formaPagtoSangria}
                    onChange={(e) => setFormaPagtoSangria(e.target.value as FormaPagamento)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="dinheiro">Dinheiro Físico (Gaveta)</option>
                    <option value="pix">Transferência PIX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Descrição / Motivo</label>
                <input
                  type="text"
                  required
                  value={descricaoSangria}
                  onChange={(e) => setDescricaoSangria(e.target.value)}
                  placeholder="Ex: Abastecimento Buggy #042 ou Repasse ao Banco"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSangriaAberto(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
