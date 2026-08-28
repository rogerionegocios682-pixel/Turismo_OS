import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  X, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  FileText, 
  Receipt,
  QrCode,
  Download
} from 'lucide-react';
import { 
  formatarMoeda, 
  formatarDataPtBr, 
  formatarDataHoraPtBr, 
  gerarTextoWhatsappCliente 
} from '../../utils/formatters';
import { gerarPixCopiaECola } from '../../utils/pix';
import { gerarVoucherPdf } from '../../utils/geradorVoucherPdf';

export const VoucherA4Modal: React.FC = () => {
  const { 
    selectedVoucher, 
    fecharVoucherModal, 
    abrirVoucherModal, 
    empresaConfig 
  } = useTurismo();

  const [copiado, setCopiado] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  if (!selectedVoucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setGerandoPdf(true);
      const resultado = await gerarVoucherPdf(selectedVoucher, empresaConfig);
      resultado.doc.save(resultado.nomeArquivo);
      toast.success(`Arquivo ${resultado.nomeArquivo} baixado com sucesso!`, { icon: '📥' });
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar arquivo PDF');
    } finally {
      setGerandoPdf(false);
    }
  };

  const handleCopyWhatsapp = () => {
    const texto = gerarTextoWhatsappCliente(selectedVoucher, empresaConfig);
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success('Texto do voucher copiado para a área de transferência!', { icon: '📋' });
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleOpenWhatsapp = async () => {
    try {
      setGerandoPdf(true);
      const resultado = await gerarVoucherPdf(selectedVoucher, empresaConfig);
      const texto = gerarTextoWhatsappCliente(selectedVoucher, empresaConfig);
      const telLimpo = selectedVoucher.clienteTelefone.replace(/\D/g, '');

      // Tentar Web Share com arquivo
      if (navigator.canShare && navigator.canShare({ files: [resultado.file] })) {
        await navigator.share({
          files: [resultado.file],
          title: `Voucher #${selectedVoucher.codigoVoucher}`,
          text: texto
        });
        toast.success('Voucher compartilhado com sucesso!', { icon: '📲' });
        return;
      }

      // Fallback: baixa o arquivo e abre o WhatsApp com a mensagem limpa
      resultado.doc.save(resultado.nomeArquivo);
      const ddiTel = telLimpo.startsWith('55') ? telLimpo : `55${telLimpo}`;
      const url = `https://wa.me/${ddiTel}?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
      toast.success(`PDF baixado! Anexe ${resultado.nomeArquivo} no WhatsApp.`, { duration: 5000, icon: '📎' });
    } catch (e) {
      console.error(e);
    } finally {
      setGerandoPdf(false);
    }
  };

  // Gerador de QR Code URL ou PIX para o saldo se houver
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
    `VOUCHER:${selectedVoucher.codigoVoucher}|PAX:${selectedVoucher.totalPax}|SALDO:${selectedVoucher.valorSaldoRestante}`
  )}`;

  const renderBlocoVia = (tituloVia: string, subtitulo: string) => {
    return (
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 mb-4 text-slate-900 relative">
        {/* Topo do Voucher */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
          <div className="flex items-center gap-3">
            {empresaConfig.logoBase64 ? (
              <img 
                src={empresaConfig.logoBase64} 
                alt="Logo" 
                className="w-14 h-14 object-contain rounded-lg border border-slate-200" 
              />
            ) : (
              <div className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center font-black rounded-lg text-sm">
                PORTO
              </div>
            )}
            <div>
              <h2 className="font-extrabold text-base tracking-tight leading-none text-slate-950">
                {empresaConfig.nomeFantasia}
              </h2>
              <p className="text-[10px] text-slate-600 mt-1">
                {empresaConfig.razaoSocial} • CNPJ: {empresaConfig.cnpj}
              </p>
              <p className="text-[10px] text-slate-600">
                CADASTUR: {empresaConfig.cadastur} • Tel/WhatsApp: {empresaConfig.telefoneWhatsapp}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white text-[10px] font-extrabold px-3 py-1 rounded tracking-wider uppercase">
              {tituloVia}
            </span>
            <p className="text-xs font-black text-blue-700 mt-1 tracking-tight">
              VOUCHER: #{selectedVoucher.codigoVoucher}
            </p>
            <p className="text-[9px] text-slate-500">{subtitulo}</p>
          </div>
        </div>

        {/* Informações Principais da Reserva */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Passageiro Titular</span>
            <span className="font-bold text-slate-950 text-sm truncate block">{selectedVoucher.clienteNome}</span>
            <span className="text-[10px] text-slate-600">{selectedVoucher.clienteTelefone}</span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Hotel / Local de Embarque</span>
            <span className="font-bold text-slate-950 block">{selectedVoucher.clienteHotel}</span>
            {selectedVoucher.clienteQuarto && (
              <span className="text-[10px] text-blue-700 font-semibold">Quarto/Apto: {selectedVoucher.clienteQuarto}</span>
            )}
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Data do Passeio</span>
            <span className="font-extrabold text-blue-700 text-sm block">
              {formatarDataPtBr(selectedVoucher.dataPasseio)}
            </span>
            <span className="text-[10px] text-slate-600 font-semibold">
              Embarque Previsto: {selectedVoucher.horarioEmbarquePrevisto || '08:00'}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Qtd de Passageiros</span>
            <span className="font-extrabold text-slate-900 text-sm block">
              {selectedVoucher.totalPax} {selectedVoucher.totalPax === 1 ? 'Pessoa' : 'Pessoas'}
            </span>
            <span className="text-[10px] text-slate-600">
              ({selectedVoucher.paxAdultos} adt {selectedVoucher.paxCriancas ? `+ ${selectedVoucher.paxCriancas} chd` : ''})
            </span>
          </div>
        </div>

        {/* Detalhes do Serviço Contratado */}
        <div className="mb-3 border border-slate-200 rounded-lg p-2.5 bg-white text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-900 text-sm">
              🏖️ {selectedVoucher.passeioNome}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Emitido por: {selectedVoucher.agenciaEmissora}
            </span>
          </div>

          {selectedVoucher.opcionaisSelecionados && selectedVoucher.opcionaisSelecionados.length > 0 && (
            <div className="text-[11px] text-blue-800 bg-blue-50/70 p-1.5 rounded mt-1">
              <strong>Opcionais Inclusos:</strong>{' '}
              {selectedVoucher.opcionaisSelecionados.map(op => `${op.nome} (${op.quantidade}x)`).join(', ')}
            </div>
          )}

          {selectedVoucher.motoristaNome && (
            <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-2">
              <span><strong>Guia/Motorista:</strong> {selectedVoucher.motoristaNome}</span>
              {selectedVoucher.veiculoInfo && <span>• <strong>Veículo:</strong> {selectedVoucher.veiculoInfo}</span>}
            </div>
          )}
        </div>

        {/* Valores & Condições Financeiras (Sinal vs Saldo) */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-2 text-center">
            <span className="text-[9px] font-black uppercase text-slate-600 block">VALOR TOTAL</span>
            <span className="text-sm font-extrabold text-slate-900">
              {formatarMoeda(selectedVoucher.valorTotal)}
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-center">
            <span className="text-[9px] font-black uppercase text-emerald-800 block">SINAL PAGO (ENTRADA)</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {formatarMoeda(selectedVoucher.valorSinalPago)}
            </span>
            <span className="text-[8px] text-emerald-800 block font-semibold">
              via {selectedVoucher.formaPagamentoSinal.toUpperCase()}
            </span>
          </div>

          <div className={`rounded-lg p-2 text-center border ${
            selectedVoucher.saldoQuitado 
              ? 'bg-emerald-100 border-emerald-400 text-emerald-900' 
              : 'bg-amber-50 border-amber-400 text-amber-950'
          }`}>
            <span className="text-[9px] font-black uppercase block">
              {selectedVoucher.saldoQuitado ? 'SALDO QUITADO' : 'SALDO A PAGAR NO EMBARQUE'}
            </span>
            <span className="text-sm font-black">
              {selectedVoucher.saldoQuitado ? 'R$ 0,00' : formatarMoeda(selectedVoucher.valorSaldoRestante)}
            </span>
            {!selectedVoucher.saldoQuitado && (
              <span className="text-[8px] text-amber-800 block font-semibold">Direto ao motorista / guia</span>
            )}
          </div>
        </div>

        {/* QR Code de Autenticação + Termos & Assinatura */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200 text-[9px] text-slate-500">
          <div className="flex items-center gap-3">
            <img src={qrCodeUrl} alt="QR Code" className="w-14 h-14 border border-slate-300 rounded bg-white p-0.5" />
            <div className="max-w-xs leading-tight">
              <p className="font-bold text-slate-800">Autenticação Digital #{selectedVoucher.codigoVoucher}</p>
              <p>Emitido em {formatarDataHoraPtBr(selectedVoucher.dataEmissao)}</p>
              <p className="text-[8px] text-slate-400 mt-0.5">Cancelamentos &lt; 24h implicam em retenção do sinal.</p>
            </div>
          </div>

          <div className="text-center min-w-[180px] border-t border-slate-900 pt-1 mt-4">
            <span className="font-semibold text-slate-900 block">De Acordo / Assinatura do Cliente</span>
            <span className="text-[8px] text-slate-500">{selectedVoucher.clienteNome}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-300">
        
        {/* Barra de Ferramentas Superior do Modal */}
        <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">Voucher Oficial A4 (2 Vias: Agência & Cliente)</h3>
              <p className="text-xs text-slate-400">Código: #{selectedVoucher.codigoVoucher} • {selectedVoucher.clienteNome}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => abrirVoucherModal(selectedVoucher, 'termico')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700 cursor-pointer"
              title="Mudar para formato de cupom térmico de 80mm"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Ver Cupom 80mm</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={gerandoPdf}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              title="Baixar arquivo PDF oficial da reserva"
            >
              <Download className="w-4 h-4" />
              <span>{gerandoPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>

            <button
              onClick={handleCopyWhatsapp}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleOpenWhatsapp}
              disabled={gerandoPdf}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95"
              title="Enviar Voucher em PDF pelo WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar WhatsApp (PDF)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir A4</span>
            </button>

            <button
              onClick={fecharVoucherModal}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo de Impressão do Voucher (Renderiza as 2 vias com destaque de corte) */}
        <div id="print-voucher-container" className="p-6 overflow-y-auto flex-1 bg-slate-200 space-y-4">
          {/* VIA 1: CONTROLE DA AGÊNCIA / LOJA */}
          {renderBlocoVia("VIA 1 - CONTROLE DA AGÊNCIA & GUIA", "Retenção no balcão / Guia de embarque")}

          {/* Linha de Corte Picotada */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-slate-400"></div>
            <span className="absolute bg-slate-300 text-slate-700 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              ✂️ Destaque aqui na linha pontilhada
            </span>
          </div>

          {/* VIA 2: COMPROVANTE DO PASSAGEIRO */}
          {renderBlocoVia("VIA 2 - COMPROVANTE DO PASSAGEIRO", "Guarde este documento com você até o final do passeio")}
        </div>

        {/* Rodapé Informativo */}
        <div className="bg-white p-3 border-t border-slate-200 rounded-b-2xl text-center text-xs text-slate-500 no-print flex items-center justify-between px-6">
          <span>💡 Dica: Ao clicar em <strong>Imprimir A4</strong>, o navegador formatará automaticamente as 2 vias na mesma folha sulfite.</span>
          <button
            onClick={fecharVoucherModal}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
};
