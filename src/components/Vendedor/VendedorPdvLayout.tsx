import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { NovaReservaView } from '../Reservas/NovaReservaView';
import { VoucherA4Modal } from '../Voucher/VoucherA4Modal';
import { VoucherTermicoModal } from '../Voucher/VoucherTermicoModal';
import { VoucherPublicoModal } from '../Voucher/VoucherPublicoModal';
import { Compass, ShoppingCart, LogOut, Store } from 'lucide-react';

/**
 * Layout EXCLUSIVO para o perfil "vendedor".
 * Renderiza apenas a Nova Reserva / PDV, sem nenhum menu administrativo.
 * Independe do activeTab: mesmo que o estado seja alterado, o vendedor
 * nunca acessa telas administrativas por aqui.
 */
export const VendedorPdvLayout: React.FC = () => {
  const {
    usuarioAutenticado,
    lojaAtiva,
    empresaConfig,
    voucherModalType,
    fazerLogout
  } = useTurismo();

  const nomeVendedor = usuarioAutenticado?.nome || 'Vendedor';
  const nomeLoja = empresaConfig?.nomeFantasia || lojaAtiva?.nome || 'Loja';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-600 selection:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-xs font-semibold shadow-lg border border-slate-200 rounded-xl',
          style: {
            background: '#ffffff',
            color: '#0f172a',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }
        }}
      />

      {/* Cabeçalho simplificado do Vendedor */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 overflow-hidden border border-white/10">
              {empresaConfig?.logoBase64 ? (
                <img src={empresaConfig.logoBase64} alt="Logomarca da Loja" className="w-full h-full object-cover" />
              ) : (
                <Compass className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-extrabold leading-tight">Olá, {nomeVendedor.split(' ')[0]}</p>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Store className="w-3 h-3 text-blue-400" />
                <span className="truncate max-w-[200px]">Loja: {nomeLoja}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-bold px-2.5 py-1.5 rounded-xl">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Nova Reserva / PDV</span>
            </span>
            <button
              onClick={fazerLogout}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-red-600/20 text-red-300 hover:text-white border border-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Sair do sistema"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Faixa de identificação do perfil */}
      <div className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 text-center no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Modo Vendedor — acesso exclusivo à emissão de reservas</span>
        </div>
      </div>

      {/* Conteúdo único: PDV / Nova Reserva */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 no-print">
        <NovaReservaView />
      </main>

      {/* Modais de impressão de voucher (necessários ao finalizar a reserva) */}
      {voucherModalType === 'a4' && <VoucherA4Modal />}
      {voucherModalType === 'termico' && <VoucherTermicoModal />}
      <VoucherPublicoModal />

      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            TurismoOS &bull; Ponto de Venda
          </p>
          <p className="text-[11px] text-slate-400">
            {nomeLoja}{lojaAtiva?.cidade ? ` • ${lojaAtiva.cidade}` : ''}
          </p>
        </div>
      </footer>
    </div>
  );
};
