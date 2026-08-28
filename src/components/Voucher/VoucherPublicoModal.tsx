import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Ticket, 
  MapPin, 
  Calendar, 
  Clock, 
  Building, 
  DollarSign, 
  Users, 
  Share2, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sun, 
  Waves,
  Phone,
  MessageSquare,
  ShieldCheck,
  Download
} from 'lucide-react';
import { formatarMoeda, formatarDataPtBr, formatarDataHoraPtBr, gerarTextoWhatsappCliente } from '../../utils/formatters';
import { gerarVoucherPdf } from '../../utils/geradorVoucherPdf';
import { Reserva } from '../../types';

export const VoucherPublicoModal: React.FC = () => {
  const { reservas, empresaConfig, getMareDoDia } = useTurismo();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [aberto, setAberto] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => {
    const handleCheckHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#voucher')) {
        const params = new URLSearchParams(hash.replace('#voucher?', ''));
        const codigo = params.get('codigo');
        if (codigo) {
          const achada = reservas.find(r => r.codigoVoucher.toUpperCase() === codigo.toUpperCase());
          if (achada) {
            setReserva(achada);
            setAberto(true);
          }
        }
      }
    };

    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);
    return () => window.removeEventListener('hashchange', handleCheckHash);
  }, [reservas]);

  if (!aberto || !reserva) return null;

  const fechar = () => {
    setAberto(false);
    if (window.location.hash.startsWith('#voucher')) {
      window.location.hash = '';
    }
  };

  const mare = getMareDoDia(reserva.dataPasseio);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
    `VOUCHER:${reserva.codigoVoucher}|PAX:${reserva.totalPax}|SALDO:${reserva.valorSaldoRestante}`
  )}`;

  const handleBaixarPdf = async () => {
    try {
      setGerandoPdf(true);
      const resultado = await gerarVoucherPdf(reserva, empresaConfig);
      resultado.doc.save(resultado.nomeArquivo);
      toast.success(`Arquivo ${resultado.nomeArquivo} baixado!`, { icon: '📥' });
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar PDF');
    } finally {
      setGerandoPdf(false);
    }
  };

  const handleCompartilharZap = async () => {
    try {
      setGerandoPdf(true);
      const resultado = await gerarVoucherPdf(reserva, empresaConfig);
      const texto = gerarTextoWhatsappCliente(reserva, empresaConfig);
      const telLimpo = reserva.clienteTelefone.replace(/\D/g, '');

      if (navigator.canShare && navigator.canShare({ files: [resultado.file] })) {
        await navigator.share({
          files: [resultado.file],
          title: `Voucher #${reserva.codigoVoucher}`,
          text: texto
        });
        toast.success('Voucher compartilhado com sucesso!', { icon: '📲' });
        return;
      }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Superior */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white p-6 relative">
          <button
            onClick={fechar}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
              Voucher Digital do Passageiro
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">{reserva.passeioNome}</h2>
          <p className="text-xs text-blue-100 mt-1">
            {empresaConfig.nomeFantasia} • CADASTUR {empresaConfig.cadastur}
          </p>

          <div className="mt-4 flex items-center justify-between bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
            <div>
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Código do Voucher</span>
              <span className="text-xl font-mono font-black text-white">#{reserva.codigoVoucher}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Titular</span>
              <span className="text-sm font-bold text-white truncate block max-w-[180px]">{reserva.clienteNome}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo do Voucher */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* Dados do Embarque */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Data do Passeio</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">{formatarDataPtBr(reserva.dataPasseio)}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Horário de Embarque</span>
              <p className="text-sm font-black text-blue-700 mt-0.5">{reserva.horarioEmbarquePrevisto || '08:00'}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Local / Hotel de Embarque</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                🏨 {reserva.clienteHotel} {reserva.clienteQuarto ? `• Quarto: ${reserva.clienteQuarto}` : ''}
              </p>
            </div>
          </div>

          {/* Passageiros & Opcionais */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Passageiros Confirmados:</span>
              </span>
              <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">
                {reserva.totalPax} PAX ({reserva.paxAdultos} adt {reserva.paxCriancas ? `+ ${reserva.paxCriancas} chd` : ''})
              </span>
            </div>

            {reserva.opcionaisSelecionados && reserva.opcionaisSelecionados.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Opcionais Inclusos:</span>
                <div className="flex flex-wrap gap-1.5">
                  {reserva.opcionaisSelecionados.map((op, i) => (
                    <span key={i} className="bg-amber-100 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                      {op.quantidade}x {op.nome}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resumo Financeiro & Situação do Saldo */}
          <div className={`p-4 rounded-2xl border ${
            reserva.saldoQuitado ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-600">Resumo do Pagamento</span>
              {reserva.saldoQuitado ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Saldo Quitado
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  Pagar no Embarque
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200/60">
              <div>
                <span className="text-[10px] text-slate-500 block">Total</span>
                <span className="text-xs font-bold text-slate-900">{formatarMoeda(reserva.valorTotal)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 block">Sinal Pago</span>
                <span className="text-xs font-bold text-emerald-700">{formatarMoeda(reserva.valorSinalPago)}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-800 block">Saldo Restante</span>
                <span className="text-sm font-black text-amber-900">{formatarMoeda(reserva.valorSaldoRestante)}</span>
              </div>
            </div>
          </div>

          {/* QR Code de Embarque & Validação */}
          <div className="flex items-center gap-4 bg-slate-900 text-white p-4 rounded-2xl">
            <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 bg-white p-1 rounded-xl shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Comprovante Oficial Válido</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Apresente este QR Code no momento do embarque ao motorista ou guia credenciado.
              </p>
              <p className="text-[10px] text-slate-400">
                Central de Suporte: {empresaConfig.telefoneWhatsapp}
              </p>
            </div>
          </div>

          {/* Dicas e Recomendações */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sky-950 space-y-1">
            <span className="text-xs font-bold flex items-center gap-1.5 text-sky-900">
              <Sun className="w-4 h-4 text-amber-500" />
              Recomendações para seu Passeio:
            </span>
            <ul className="text-[11px] text-sky-900 list-disc list-inside space-y-0.5 pt-1">
              <li>Leve protetor solar, óculos escuros e toalha.</li>
              <li>Calçado aquático (sapatilha/crocs) para caminhadas nos corais.</li>
              <li>Esteja no lobby/portaria 10 minutos antes do horário previsto.</li>
            </ul>
          </div>

        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleBaixarPdf}
              disabled={gerandoPdf}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{gerandoPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>
          </div>

          <button
            onClick={handleCompartilharZap}
            disabled={gerandoPdf}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar WhatsApp (PDF)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
