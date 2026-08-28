import React, { useRef } from 'react';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Printer, 
  Download, 
  X, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Phone, 
  User, 
  Truck, 
  ShieldCheck, 
  Compass,
  AlertTriangle
} from 'lucide-react';
import { 
  formatarMoeda, 
  formatarDataPtBr, 
  formatarDataHoraPtBr 
} from '../../utils/formatters';
import { Reserva, TransacaoCaixa, MotoristaVeiculo, Passeio } from '../../types';

export const RelatorioPdfModal: React.FC = () => {
  const { 
    relatorioAtivoModal, 
    fecharRelatorioPdfModal, 
    empresaConfig, 
    usuarioLogado 
  } = useTurismo();

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!relatorioAtivoModal) return null;

  const { tipo, titulo, subtitulo, periodoOuFiltro, dados } = relatorioAtivoModal;
  const dataHoraEmissao = formatarDataHoraPtBr(new Date().toISOString());

  const handleImprimir = () => {
    window.print();
  };

  // Exportar dados em CSV
  const handleBaixarCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    
    if (tipo === 'rota') {
      const reservas: Reserva[] = dados.reservas || [];
      csvContent += "Parada,Horario,Voucher,Titular,Telefone,Hotel,Quarto,Passeio,PAX,Cobrar_Embarque,Sinal_Pago,Status_Pagamento,Status_Embarque\n";
      reservas.forEach((r, idx) => {
        csvContent += `"${idx + 1}","${r.horarioEmbarquePrevisto || '08:00'}","${r.codigoVoucher}","${r.clienteNome}","${r.clienteTelefone}","${r.clienteHotel}","${r.clienteQuarto || '-'}","${r.passeioNome}","${r.totalPax}","${r.saldoQuitado ? 0 : r.valorSaldoRestante}","${r.valorSinalPago}","${r.saldoQuitado ? 'Quitado' : 'A Receber'}","${r.statusEmbarque}"\n`;
      });
    } else if (tipo === 'reservas') {
      const reservas: Reserva[] = dados.reservas || [];
      csvContent += "Voucher,Data_Passeio,Titular,Telefone,Hotel,Passeio,PAX,Valor_Total,Sinal_Pago,Saldo_Restante,Status_Pagamento,Agencia,Vendedor\n";
      reservas.forEach((r) => {
        csvContent += `"${r.codigoVoucher}","${r.dataPasseio}","${r.clienteNome}","${r.clienteTelefone}","${r.clienteHotel}","${r.passeioNome}","${r.totalPax}","${r.valorTotal}","${r.valorSinalPago}","${r.valorSaldoRestante}","${r.saldoQuitado ? 'Quitado' : 'Pendente'}","${r.agenciaEmissora}","${r.vendedorNome || '-'}"\n`;
      });
    } else if (tipo === 'financeiro') {
      const transacoes: TransacaoCaixa[] = dados.transacoes || [];
      csvContent += "Data_Hora,Tipo,Agencia,Voucher,Descricao,Valor,Forma_Pagamento,Operador\n";
      transacoes.forEach((t) => {
        csvContent += `"${t.dataHora}","${t.tipo}","${t.agencia}","${t.codigoVoucher || '-'}","${t.descricao}","${t.valor}","${t.formaPagamento}","${t.operadorNome}"\n`;
      });
    } else if (tipo === 'frota') {
      const motoristas: MotoristaVeiculo[] = dados.motoristas || [];
      csvContent += "Motorista,Telefone,Veiculo,Tipo,Placa_Registro,Capacidade_PAX,Status\n";
      motoristas.forEach((m) => {
        csvContent += `"${m.nomeMotorista}","${m.telefone}","${m.veiculoModelo}","${m.tipoVeiculo}","${m.placaOuRegistro}","${m.capacidadePax}","${m.status}"\n`;
      });
    } else if (tipo === 'tarifario') {
      const passeios: Passeio[] = dados.passeios || [];
      csvContent += "Passeio,Categoria,Preco_Base,Tipo_Cobranca,Duracao_Horas,Destino,Ativo\n";
      passeios.forEach((p) => {
        csvContent += `"${p.nome}","${p.categoria}","${p.precoPadrao}","${p.tipoCobranca}","${p.duracaoHoras}","${p.destinoPrincipal}","${p.ativo ? 'Sim' : 'Não'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Modal Box */}
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Barra de Ações Superior (Oculta na Impressão) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">{titulo}</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  Documento Oficial A4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {empresaConfig.nomeFantasia} • Visualização de Impressão & Exportação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBaixarCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              title="Baixar planilha CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={handleImprimir}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
              title="Imprimir direto ou salvar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar como PDF</span>
            </button>

            <button
              onClick={fecharRelatorioPdfModal}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Documento A4 Renderizado (Visível na tela e na Impressão) */}
        <div 
          ref={printAreaRef}
          id="print-document-container"
          className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:overflow-visible print:w-full"
        >
          {/* 1. CABEÇALHO OFICIAL DO RELATÓRIO */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6">
            <div className="flex items-start justify-between gap-4">
              
              {/* Logomarca & Identificação da Agência */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {empresaConfig.logoBase64 ? (
                    <img 
                      src={empresaConfig.logoBase64} 
                      alt="Logo" 
                      className="w-full h-full object-contain p-1" 
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-700 flex items-center justify-center text-white font-black text-xl">
                      <Compass className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                    {empresaConfig.nomeFantasia}
                  </h1>
                  <p className="text-xs text-slate-700 font-medium">
                    {empresaConfig.razaoSocial}
                  </p>
                  <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span><strong>CNPJ:</strong> {empresaConfig.cnpj}</span>
                    <span><strong>CADASTUR:</strong> {empresaConfig.cadastur}</span>
                    <span><strong>TEL:</strong> {empresaConfig.telefoneWhatsapp}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {empresaConfig.enderecoCompleto} • {empresaConfig.cidadeBase}
                  </p>
                </div>
              </div>

              {/* Informações de Emissão */}
              <div className="text-right shrink-0">
                <span className="inline-block bg-slate-900 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wider">
                  {titulo}
                </span>
                <p className="text-[11px] text-slate-600 mt-1.5 font-semibold">
                  {subtitulo || 'Relatório Operacional'}
                </p>
                <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                  <p><strong>Emissão:</strong> {dataHoraEmissao}</p>
                  {periodoOuFiltro && <p><strong>Filtro:</strong> {periodoOuFiltro}</p>}
                  <p><strong>Operador:</strong> {usuarioLogado.nome}</p>
                </div>
              </div>

            </div>
          </div>

          {/* 2. CONTEÚDO ESPECÍFICO DE CADA RELATÓRIO */}

          {/* A. MANIFESTO DE EMBARQUE & ROTA DO MOTORISTA */}
          {tipo === 'rota' && (
            <div className="space-y-6">
              
              {/* Cartões de Resumo da Rota */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Data do Manifesto</span>
                  <strong className="text-sm text-slate-950">{formatarDataPtBr(dados.data)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Motorista / Veículo</span>
                  <strong className="text-xs text-blue-900 block truncate">{dados.motoristaNome || 'Todos os Motoristas'}</strong>
                  <span className="text-[10px] text-slate-500">{dados.veiculoInfo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Passageiros</span>
                  <strong className="text-sm text-slate-950">{dados.totais.totalPax} PAX</strong>
                  <span className="text-[10px] text-slate-500">({dados.reservas.length} paradas)</span>
                </div>
                <div>
                  <span className="text-amber-800 text-[10px] uppercase font-bold block">Saldos a Recolher</span>
                  <strong className="text-sm text-amber-900">{formatarMoeda(dados.totais.totalSaldosPendentes)}</strong>
                  <span className="text-[10px] text-amber-700">Cobrar no embarque</span>
                </div>
                <div>
                  <span className="text-emerald-800 text-[10px] uppercase font-bold block">Saldos Já Recebidos</span>
                  <strong className="text-sm text-emerald-900">{formatarMoeda(dados.totais.totalSaldosQuitados)}</strong>
                  <span className="text-[10px] text-emerald-700">Quitados</span>
                </div>
              </div>

              {/* Tabela Detalhada de Paradas */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center justify-between">
                  <span>Ordens de Parada & Lista de Passageiros</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Total: {dados.reservas.length} embarques
                  </span>
                </h3>

                {dados.reservas.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                    Nenhum passageiro agendado para esta data ou motorista.
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 text-[11px] font-black uppercase">
                        <th className="py-2.5 px-2 text-center w-12 border-r border-slate-300">Parada</th>
                        <th className="py-2.5 px-2 w-16 border-r border-slate-300">Horário</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Passageiro / Contato</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Hotel / Quarto</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Passeio / Opcionais</th>
                        <th className="py-2.5 px-2 text-center w-12 border-r border-slate-300">PAX</th>
                        <th className="py-2.5 px-2.5 text-right w-24 border-r border-slate-300">A Cobrar</th>
                        <th className="py-2.5 px-2 text-center w-20 border-r border-slate-300">Situação</th>
                        <th className="py-2.5 px-2 text-center w-24">Assinatura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dados.reservas.map((r: Reserva, idx: number) => {
                        const isQuitado = r.saldoQuitado;
                        const isEmbarcado = r.statusEmbarque === 'embarcado_saldo_pago' || r.statusEmbarque === 'embarcado_saldo_cortesia';
                        
                        return (
                          <tr key={r.id} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                            {/* Número Parada */}
                            <td className="py-2.5 px-2 text-center font-black text-slate-900 border-r border-slate-200">
                              #{idx + 1}
                            </td>

                            {/* Horário */}
                            <td className="py-2.5 px-2 font-bold text-blue-900 border-r border-slate-200 text-center">
                              {r.horarioEmbarquePrevisto || '08:00'}
                            </td>

                            {/* Passageiro & Telefone */}
                            <td className="py-2.5 px-3 border-r border-slate-200">
                              <div className="font-black text-slate-900">{r.clienteNome}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <span>Voucher: #{r.codigoVoucher}</span>
                                <span>•</span>
                                <span>{r.clienteTelefone}</span>
                              </div>
                            </td>

                            {/* Hotel / Quarto */}
                            <td className="py-2.5 px-3 border-r border-slate-200">
                              <div className="font-bold text-slate-800">{r.clienteHotel}</div>
                              {r.clienteQuarto && (
                                <div className="text-[10px] text-slate-500 font-medium">
                                  Apto/Quarto: {r.clienteQuarto}
                                </div>
                              )}
                            </td>

                            {/* Passeio */}
                            <td className="py-2.5 px-3 border-r border-slate-200">
                              <div className="font-semibold text-slate-900 text-[11px] leading-tight">{r.passeioNome}</div>
                              {r.opcionaisSelecionados && r.opcionaisSelecionados.length > 0 && (
                                <div className="text-[10px] text-amber-800 mt-0.5 font-medium">
                                  + {r.opcionaisSelecionados.map(o => `${o.quantidade}x ${o.nome}`).join(', ')}
                                </div>
                              )}
                            </td>

                            {/* PAX */}
                            <td className="py-2.5 px-2 text-center font-black text-slate-900 border-r border-slate-200">
                              {r.totalPax}
                              <span className="text-[9px] block font-normal text-slate-400">
                                {r.paxAdultos}a{r.paxCriancas ? `+${r.paxCriancas}c` : ''}
                              </span>
                            </td>

                            {/* A Cobrar no Embarque */}
                            <td className="py-2.5 px-2.5 text-right border-r border-slate-200">
                              {isQuitado ? (
                                <span className="text-emerald-700 font-bold text-[11px] block">R$ 0,00</span>
                              ) : (
                                <div className="font-black text-red-700 text-xs">
                                  {formatarMoeda(r.valorSaldoRestante)}
                                </div>
                              )}
                              <span className="text-[9px] text-slate-400 block">
                                (Sinal: {formatarMoeda(r.valorSinalPago)})
                              </span>
                            </td>

                            {/* Situação */}
                            <td className="py-2.5 px-2 text-center border-r border-slate-200 text-[10px]">
                              {isQuitado ? (
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                  Quitado
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                                  Cobrar
                                </span>
                              )}
                              <span className="text-[9px] block text-slate-500 mt-0.5">
                                {isEmbarcado ? 'Embarcado' : 'Aguardando'}
                              </span>
                            </td>

                            {/* Campo de Assinatura */}
                            <td className="py-2.5 px-2 text-center">
                              <div className="border-b border-slate-400 w-full h-5 mt-2"></div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Termo e Assinatura do Motorista */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
                <div>
                  <p className="font-bold text-slate-900 mb-1">Instruções aos Motoristas & Guias:</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    1. Conferir nome do titular e quantidade de passageiros antes do embarque.<br/>
                    2. Receber o saldo pendente antes da partida via PIX ou maquininha da empresa.<br/>
                    3. Em caso de no-show após 15 minutos, notificar imediatamente a central.
                  </p>
                </div>
                <div className="text-center flex flex-col justify-end">
                  <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
                  <span className="text-[11px] font-bold text-slate-800">
                    {dados.motoristaNome || 'Assinatura do Motorista Responsável'}
                  </span>
                  <span className="text-[9px] text-slate-400">Visto de Conferência Operacional</span>
                </div>
              </div>

            </div>
          )}

          {/* B. RELATÓRIO DE RESERVAS & PASSAGEIROS */}
          {tipo === 'reservas' && (
            <div className="space-y-6">
              
              {/* Resumo do Período */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Reservas</span>
                  <strong className="text-sm text-slate-950">{dados.reservas.length} reservas</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Passageiros</span>
                  <strong className="text-sm text-slate-950">{dados.totalPax} PAX</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Faturamento Total</span>
                  <strong className="text-sm text-blue-900">{formatarMoeda(dados.totalVendas)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Saldos a Receber</span>
                  <strong className="text-sm text-amber-900">{formatarMoeda(dados.totalSaldos)}</strong>
                </div>
              </div>

              {/* Tabela de Reservas */}
              <table className="w-full border-collapse text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 text-[11px] font-black uppercase">
                    <th className="py-2.5 px-3 border-r border-slate-300">Voucher / Titular</th>
                    <th className="py-2.5 px-2.5 border-r border-slate-300">Data Passeio</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Passeio</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">PAX</th>
                    <th className="py-2.5 px-2.5 text-right border-r border-slate-300">Valor Total</th>
                    <th className="py-2.5 px-2.5 text-right border-r border-slate-300">Sinal Pago</th>
                    <th className="py-2.5 px-2.5 text-right border-r border-slate-300">Saldo</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dados.reservas.map((r: Reserva, idx: number) => (
                    <tr key={r.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{r.clienteNome}</div>
                        <div className="text-[10px] text-slate-500">#{r.codigoVoucher} • {r.clienteHotel}</div>
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-200 font-semibold text-slate-800">
                        {formatarDataPtBr(r.dataPasseio)}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-800">
                        {r.passeioNome}
                      </td>
                      <td className="py-2 px-2 text-center font-bold border-r border-slate-200">
                        {r.totalPax}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-slate-900 border-r border-slate-200">
                        {formatarMoeda(r.valorTotal)}
                      </td>
                      <td className="py-2 px-2.5 text-right text-emerald-700 font-semibold border-r border-slate-200">
                        {formatarMoeda(r.valorSinalPago)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold border-r border-slate-200">
                        {r.saldoQuitado ? (
                          <span className="text-emerald-700">R$ 0,00</span>
                        ) : (
                          <span className="text-amber-800">{formatarMoeda(r.valorSaldoRestante)}</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          r.saldoQuitado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.saldoQuitado ? 'Quitado' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}

          {/* C. RELATÓRIO FINANCEIRO & CAIXA */}
          {tipo === 'financeiro' && (
            <div className="space-y-6">
              
              {/* Resumo Caixa */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-emerald-800 text-[10px] uppercase font-bold block">Entradas Sinais</span>
                  <strong className="text-sm text-emerald-900">{formatarMoeda(dados.resumo.totalEntradasSinais)}</strong>
                </div>
                <div>
                  <span className="text-emerald-800 text-[10px] uppercase font-bold block">Entradas Saldos</span>
                  <strong className="text-sm text-emerald-900">{formatarMoeda(dados.resumo.totalEntradasSaldos)}</strong>
                </div>
                <div>
                  <span className="text-red-800 text-[10px] uppercase font-bold block">Comissões & Despesas</span>
                  <strong className="text-sm text-red-900">{formatarMoeda(dados.resumo.totalComissoesPagas + dados.resumo.totalDespesasSangrias)}</strong>
                </div>
                <div>
                  <span className="text-blue-900 text-[10px] uppercase font-bold block">Saldo Líquido em Caixa</span>
                  <strong className="text-sm text-blue-900">{formatarMoeda(dados.resumo.saldoLiquidoEmCaixa)}</strong>
                </div>
              </div>

              {/* Tabela de Transações */}
              <table className="w-full border-collapse text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 text-[11px] font-black uppercase">
                    <th className="py-2.5 px-3 border-r border-slate-300">Data / Hora</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Tipo</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Agência / Voucher</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Descrição</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Forma</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dados.transacoes.map((t: TransacaoCaixa, idx: number) => {
                    const isEntrada = t.tipo.startsWith('entrada');
                    return (
                      <tr key={t.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px]">
                          {formatarDataHoraPtBr(t.dataHora)}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-[11px] font-bold">
                          <span className={isEntrada ? 'text-emerald-700' : 'text-red-700'}>
                            {t.tipo.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                          {t.agencia} {t.codigoVoucher ? `• #${t.codigoVoucher}` : ''}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-800">
                          {t.descricao}
                        </td>
                        <td className="py-2 px-2 text-center uppercase font-semibold text-[10px] border-r border-slate-200">
                          {t.formaPagamento}
                        </td>
                        <td className={`py-2 px-3 text-right font-black ${isEntrada ? 'text-emerald-700' : 'text-red-700'}`}>
                          {isEntrada ? '+' : '-'} {formatarMoeda(t.valor)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            </div>
          )}

          {/* D. RELATÓRIO DE FROTA & GUIAS */}
          {tipo === 'frota' && (
            <div className="space-y-6">
              <table className="w-full border-collapse text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 text-[11px] font-black uppercase">
                    <th className="py-2.5 px-3 border-r border-slate-300">Motorista / Guia</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Telefone</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Veículo / Modelo</th>
                    <th className="py-2.5 px-2.5 border-r border-slate-300">Placa / Registro</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Capacidade</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dados.motoristas.map((m: MotoristaVeiculo, idx: number) => (
                    <tr key={m.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {m.nomeMotorista}
                      </td>
                      <td className="py-2 px-3 text-slate-700 border-r border-slate-200 font-mono">
                        {m.telefone}
                      </td>
                      <td className="py-2 px-3 text-slate-800 border-r border-slate-200">
                        {m.veiculoModelo} ({m.tipoVeiculo.toUpperCase()})
                      </td>
                      <td className="py-2 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-200">
                        {m.placaOuRegistro}
                      </td>
                      <td className="py-2 px-2 text-center font-bold border-r border-slate-200">
                        {m.capacidadePax} PAX
                      </td>
                      <td className="py-2 px-2 text-center text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          m.status === 'disponivel' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* E. RELATÓRIO DE TARIFÁRIO & PASSEIOS */}
          {tipo === 'tarifario' && (
            <div className="space-y-6">
              <table className="w-full border-collapse text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 text-[11px] font-black uppercase">
                    <th className="py-2.5 px-3 border-r border-slate-300">Passeio / Destino</th>
                    <th className="py-2.5 px-2.5 border-r border-slate-300">Categoria</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Cobrança</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Duração</th>
                    <th className="py-2.5 px-3 text-right">Tarifa Padrão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dados.passeios.map((p: Passeio, idx: number) => (
                    <tr key={p.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{p.nome}</div>
                        <div className="text-[10px] text-slate-500">{p.destinoPrincipal}</div>
                      </td>
                      <td className="py-2 px-2.5 uppercase font-semibold text-slate-700 text-[10px] border-r border-slate-200">
                        {p.categoria}
                      </td>
                      <td className="py-2 px-2 text-center font-medium text-slate-700 text-[10px] border-r border-slate-200">
                        {p.tipoCobranca === 'por_pessoa' ? 'Por Pessoa' : 'Privativo'}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-slate-800 border-r border-slate-200">
                        {p.duracaoHoras}h
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900">
                        {formatarMoeda(p.precoPadrao)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. RODAPÉ OFICIAL DO RELATÓRIO */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
            <div>
              <span className="font-bold text-slate-700">TurismoOS v2.0</span> • Sistema de Gestão para Turismo Receptivo
            </div>
            <div>
              Agência Responsável: <strong>{usuarioLogado.agenciaVinculada || empresaConfig.nomeFantasia}</strong>
            </div>
            <div>
              Gerado em: {dataHoraEmissao} • Página 1 de 1
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
