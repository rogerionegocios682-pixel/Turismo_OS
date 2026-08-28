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
  Receipt
} from 'lucide-react';
import { 
  formatarMoeda, 
  formatarDataPtBr, 
  formatarDataHoraPtBr, 
  gerarTextoWhatsappCliente 
} from '../../utils/formatters';

export const VoucherTermicoModal: React.FC = () => {
  const { 
    selectedVoucher, 
    fecharVoucherModal, 
    abrirVoucherModal, 
    empresaConfig 
  } = useTurismo();

  const [copiado, setCopiado] = useState(false);

  if (!selectedVoucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsapp = () => {
    const texto = gerarTextoWhatsappCliente(selectedVoucher, empresaConfig);
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success('Texto do cupom copiado para a área de transferência!', { icon: '📋' });
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleOpenWhatsapp = () => {
    const texto = gerarTextoWhatsappCliente(selectedVoucher, empresaConfig);
    const telLimpo = selectedVoucher.clienteTelefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telLimpo}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
    `VOUCHER:${selectedVoucher.codigoVoucher}|PAX:${selectedVoucher.totalPax}|SALDO:${selectedVoucher.valorSaldoRestante}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-300">
        
        {/* Header do Modal */}
        <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Cupom Térmico (80mm / 58mm)</h3>
              <p className="text-xs text-slate-400">Voucher #{selectedVoucher.codigoVoucher}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => abrirVoucherModal(selectedVoucher, 'a4')}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Ver A4</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={fecharVoucherModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prévia da Bobina Térmica */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-300 flex justify-center">
          <div 
            id="print-voucher-container" 
            className="bg-white text-black p-5 shadow-xl font-mono text-xs w-[320px] max-w-full border-t-4 border-b-4 border-slate-400 leading-tight"
          >
            <div className="text-center pb-2 border-b border-black">
              <h2 className="font-bold text-sm uppercase tracking-wider">{empresaConfig.nomeFantasia}</h2>
              <p className="text-[10px]">{empresaConfig.razaoSocial}</p>
              <p className="text-[10px]">CNPJ: {empresaConfig.cnpj}</p>
              <p className="text-[10px]">CADASTUR: {empresaConfig.cadastur}</p>
              <p className="text-[10px]">Tel: {empresaConfig.telefoneWhatsapp}</p>
            </div>

            <div className="py-2 text-center border-b border-black font-bold">
              <p className="text-sm">*** VOUCHER DE EMBARQUE ***</p>
              <p className="text-base tracking-wider">#{selectedVoucher.codigoVoucher}</p>
            </div>

            <div className="py-2 border-b border-black space-y-1">
              <p><strong>PASSAGEIRO:</strong> {selectedVoucher.clienteNome}</p>
              <p><strong>TEL:</strong> {selectedVoucher.clienteTelefone}</p>
              <p><strong>HOTEL/LOCAL:</strong> {selectedVoucher.clienteHotel}</p>
              {selectedVoucher.clienteQuarto && <p><strong>QUARTO:</strong> {selectedVoucher.clienteQuarto}</p>}
              <p><strong>DATA DO PASSEIO:</strong> {formatarDataPtBr(selectedVoucher.dataPasseio)}</p>
              <p><strong>EMBARQUE:</strong> {selectedVoucher.horarioEmbarquePrevisto || '08:00'}</p>
              <p><strong>PAX:</strong> {selectedVoucher.totalPax} pessoa(s)</p>
            </div>

            <div className="py-2 border-b border-black">
              <p className="font-bold uppercase">SERVIÇO:</p>
              <p className="font-bold">{selectedVoucher.passeioNome}</p>
              {selectedVoucher.motoristaNome && (
                <p className="text-[11px] mt-1">Guia/Motorista: {selectedVoucher.motoristaNome}</p>
              )}
              {selectedVoucher.veiculoInfo && (
                <p className="text-[11px]">Veículo: {selectedVoucher.veiculoInfo}</p>
              )}
            </div>

            <div className="py-2 border-b border-black space-y-1">
              <div className="flex justify-between">
                <span>VALOR TOTAL:</span>
                <span className="font-bold">{formatarMoeda(selectedVoucher.valorTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>SINAL PAGO:</span>
                <span className="font-bold text-emerald-800">{formatarMoeda(selectedVoucher.valorSinalPago)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-dotted border-black">
                <span>{selectedVoucher.saldoQuitado ? 'SALDO QUITADO:' : 'SALDO A PAGAR:'}</span>
                <span>{selectedVoucher.saldoQuitado ? 'R$ 0,00' : formatarMoeda(selectedVoucher.valorSaldoRestante)}</span>
              </div>
              {!selectedVoucher.saldoQuitado && (
                <p className="text-[10px] text-right font-bold">* Pagar no embarque</p>
              )}
            </div>

            <div className="py-3 flex flex-col items-center justify-center text-center">
              <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 mb-1" />
              <p className="text-[9px]">Autenticação #{selectedVoucher.codigoVoucher}</p>
            </div>

            <div className="pt-2 border-t border-black text-[9px] text-center space-y-1">
              <p>Emissão: {formatarDataHoraPtBr(selectedVoucher.dataEmissao)}</p>
              <p>Obrigatório apresentar este comprovante ao motorista credenciado.</p>
              <p>Desejamos um excelente passeio!</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="bg-white p-3 border-t border-slate-200 rounded-b-2xl flex items-center justify-between no-print px-4">
          <button
            onClick={handleOpenWhatsapp}
            className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:text-emerald-800 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>
          
          <button
            onClick={fecharVoucherModal}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
