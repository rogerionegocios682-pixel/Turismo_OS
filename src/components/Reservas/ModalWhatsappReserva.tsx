import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Download, 
  Phone, 
  Calendar, 
  Clock, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  FileText,
  Sparkles,
  ShieldCheck,
  Share2,
  Paperclip
} from 'lucide-react';
import { Reserva, EmpresaConfig } from '../../types';
import { formatarMoeda, formatarDataPtBr, gerarTextoWhatsappCliente } from '../../utils/formatters';
import { gerarVoucherPdf, GerarVoucherPdfResult } from '../../utils/geradorVoucherPdf';

interface ModalWhatsappReservaProps {
  reserva: Reserva;
  empresaConfig: EmpresaConfig;
  aoFechar: () => void;
  aoAbrirVoucher?: () => void;
}

export const ModalWhatsappReserva: React.FC<ModalWhatsappReservaProps> = ({
  reserva,
  empresaConfig,
  aoFechar,
  aoAbrirVoucher
}) => {
  const [copiado, setCopiado] = useState(false);
  const [telefoneDestino, setTelefoneDestino] = useState(reserva.clienteTelefone);
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState(() => 
    gerarTextoWhatsappCliente(reserva, empresaConfig)
  );
  
  const [gerandoPdf, setGerandoPdf] = useState(true);
  const [pdfResult, setPdfResult] = useState<GerarVoucherPdfResult | null>(null);

  const nomeArquivo = `Voucher_${reserva.codigoVoucher}.pdf`;

  // Gerar o PDF automaticamente ao abrir o modal
  useEffect(() => {
    let montado = true;

    async function gerar() {
      setGerandoPdf(true);
      try {
        const resultado = await gerarVoucherPdf(reserva, empresaConfig);
        if (montado) {
          setPdfResult(resultado);
        }
      } catch (err) {
        console.error('Erro ao gerar PDF do Voucher:', err);
        toast.error('Não foi possível gerar o PDF automaticamente.');
      } finally {
        if (montado) {
          setGerandoPdf(false);
        }
      }
    }

    gerar();

    return () => {
      montado = false;
      if (pdfResult?.urlBlob) {
        URL.revokeObjectURL(pdfResult.urlBlob);
      }
    };
  }, [reserva, empresaConfig]);

  const telefoneLimpo = useMemo(() => {
    return telefoneDestino.replace(/\D/g, '');
  }, [telefoneDestino]);

  // Copiar mensagem para área de transferência
  const handleCopiarMensagem = () => {
    navigator.clipboard.writeText(mensagemPersonalizada);
    setCopiado(true);
    toast.success('Mensagem de acompanhamento copiada!', { icon: '📋' });
    setTimeout(() => setCopiado(false), 2500);
  };

  // Baixar o arquivo PDF diretamente
  const handleBaixarPdf = async () => {
    try {
      let resultado = pdfResult;
      if (!resultado) {
        toast.loading('Gerando PDF...', { id: 'gerando-pdf' });
        resultado = await gerarVoucherPdf(reserva, empresaConfig);
        setPdfResult(resultado);
        toast.dismiss('gerando-pdf');
      }
      
      resultado.doc.save(resultado.nomeArquivo);
      toast.success(`Arquivo ${resultado.nomeArquivo} baixado com sucesso!`, { icon: '📥' });
    } catch (e) {
      console.error(e);
      toast.error('Erro ao baixar PDF');
    }
  };

  // Visualizar PDF em nova aba
  const handleVisualizarPdf = async () => {
    try {
      let resultado = pdfResult;
      if (!resultado) {
        toast.loading('Gerando PDF...', { id: 'gerando-pdf' });
        resultado = await gerarVoucherPdf(reserva, empresaConfig);
        setPdfResult(resultado);
        toast.dismiss('gerando-pdf');
      }
      window.open(resultado.urlBlob, '_blank');
    } catch (e) {
      console.error(e);
      if (aoAbrirVoucher) {
        aoAbrirVoucher();
      }
    }
  };

  // Enviar pelo WhatsApp com anexo de PDF
  const handleEnviarWhatsapp = async () => {
    if (!telefoneLimpo) {
      toast.error('Informe um número de telefone com DDD válido.');
      return;
    }

    try {
      let resultado = pdfResult;
      if (!resultado) {
        toast.loading('Preparando arquivo PDF do Voucher...', { id: 'gerando-pdf-envio' });
        resultado = await gerarVoucherPdf(reserva, empresaConfig);
        setPdfResult(resultado);
        toast.dismiss('gerando-pdf-envio');
      }

      // Tentativa de envio nativo de arquivo pelo Web Share API (Mobile / Suportado)
      if (navigator.canShare && navigator.canShare({ files: [resultado.file] })) {
        await navigator.share({
          files: [resultado.file],
          title: `Voucher #${reserva.codigoVoucher} - ${reserva.clienteNome}`,
          text: mensagemPersonalizada
        });
        toast.success(`Voucher compartilhado com sucesso!`, { icon: '📲' });
        aoFechar();
        return;
      }

      // Fallback padrão Desktop / Navegador Web:
      // 1. Baixa o arquivo PDF automaticamente para a máquina do operador
      resultado.doc.save(resultado.nomeArquivo);
      
      // 2. Abre a conversa no WhatsApp Web com o texto sem link
      const ddiTel = telefoneLimpo.startsWith('55') ? telefoneLimpo : `55${telefoneLimpo}`;
      const url = `https://wa.me/${ddiTel}?text=${encodeURIComponent(mensagemPersonalizada)}`;
      window.open(url, '_blank');

      toast.success(
        `PDF baixado automaticamente! Anexe o arquivo ${resultado.nomeArquivo} na conversa do WhatsApp.`,
        { duration: 5000, icon: '📎' }
      );
      aoFechar();

    } catch (err) {
      console.error('Erro no fluxo de envio:', err);
      // Se o usuário cancelou o menu de compartilhamento nativo, não faz nada
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Top Header do Modal */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Enviar Voucher em PDF pelo WhatsApp
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  #{reserva.codigoVoucher}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {reserva.agenciaEmissora || empresaConfig.nomeFantasia} • Documento oficial anexado
              </p>
            </div>
          </div>

          <button
            onClick={aoFechar}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          
          {/* Card Resumo do Passeio */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{reserva.passeioNome}</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {reserva.totalPax} PAX
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-blue-900">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {formatarDataPtBr(reserva.dataPasseio)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Embarque: {reserva.horarioEmbarquePrevisto || '08:00'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Building className="w-3.5 h-3.5 text-amber-500" />
                  {reserva.clienteHotel}
                </span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Situação Financeira</span>
              {reserva.saldoQuitado ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  100% Quitado
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Cobrar {formatarMoeda(reserva.valorSaldoRestante)}
                </span>
              )}
            </div>
          </div>

          {/* Destaque do Documento PDF Gerado com Botões de Ação Imediata */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-blue-950 block">
                    {nomeArquivo}
                  </span>
                  <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded">
                    PDF Oficial
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 mt-0.5 flex items-center gap-1.5">
                  <span>Documento em anexo formatado com logomarca e dados da agência</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleVisualizarPdf}
                type="button"
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                title="Visualizar o PDF oficial"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Visualizar</span>
              </button>

              <button
                onClick={handleBaixarPdf}
                type="button"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Baixar arquivo PDF no computador/celular"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar PDF</span>
              </button>
            </div>
          </div>

          {/* Campo de Telefone de Destino */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Número de WhatsApp do Passageiro:
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Destinatário do documento</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">🇧🇷 +55</span>
              <input
                type="text"
                value={telefoneDestino}
                onChange={(e) => setTelefoneDestino(e.target.value)}
                placeholder="DDD + Número (ex: 81 99988-7766)"
                className="w-full pl-16 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Prévia da Mensagem de Acompanhamento (SEM NENHUM LINK DO SISTEMA) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                Mensagem de Acompanhamento (Enviada com o PDF):
              </label>
              <span className="text-[10px] text-slate-400">Sem links internos do sistema</span>
            </div>

            <textarea
              value={mensagemPersonalizada}
              onChange={(e) => setMensagemPersonalizada(e.target.value)}
              rows={8}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all shadow-inner"
            />
          </div>

        </div>

        {/* Footer com Botões de Ação */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <button
            onClick={handleCopiarMensagem}
            className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiado ? 'Texto Copiado!' : 'Copiar Mensagem'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={aoFechar}
              className="w-1/3 sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>

            <button
              onClick={handleEnviarWhatsapp}
              disabled={gerandoPdf}
              className="w-2/3 sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{gerandoPdf ? 'Gerando PDF...' : 'Enviar PDF no WhatsApp'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
