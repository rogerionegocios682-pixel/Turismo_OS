import React from 'react';
import { Toaster } from 'react-hot-toast';
import { TurismoProvider, useTurismo } from './context/TurismoContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { NovaReservaView } from './components/Reservas/NovaReservaView';
import { RotaMotoristaView } from './components/Rota/RotaMotoristaView';
import { RastreioColaboradoresView } from './components/Rastreio/RastreioColaboradoresView';
import { TabuaMaresView } from './components/Mares/TabuaMaresView';
import { FrotaMotoristasView } from './components/Frota/FrotaMotoristasView';
import { FrotaVendedoresView } from './components/Frota/FrotaVendedoresView';
import { TarifarioView } from './components/Tarifario/TarifarioView';
import { CaixaComissoesView } from './components/Financeiro/CaixaComissoesView';
import { EmpresaConfigView } from './components/Empresa/EmpresaConfigView';
import { VoucherA4Modal } from './components/Voucher/VoucherA4Modal';
import { VoucherTermicoModal } from './components/Voucher/VoucherTermicoModal';
import { VoucherPublicoModal } from './components/Voucher/VoucherPublicoModal';
import { RelatorioPdfModal } from './components/Relatorios/RelatorioPdfModal';
import { LoginView } from './components/Auth/LoginView';
import { PainelMasterView } from './components/Master/PainelMasterView';
import { ArrowLeft, Store } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    usuarioAutenticado, 
    lojaAtivaId, 
    lojaAtiva,
    activeTab, 
    voucherModalType,
    masterVoltarAoPainel
  } = useTurismo();

  // 1. SE NÃO ESTIVER AUTENTICADO: EXIBE TELA DE LOGIN INDIVIDUAL POR LOJA
  if (!usuarioAutenticado) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginView />
      </>
    );
  }

  // 2. SE FOR MASTER E NÃO TIVER NENHUMA LOJA SELECIONADA OU ESTIVER NA TAB DO PAINEL MASTER: EXIBE PAINEL MASTER
  if (usuarioAutenticado.perfil === 'master' && (!lojaAtivaId || activeTab === 'painel_master')) {
    return (
      <>
        <Toaster position="top-right" />
        <PainelMasterView />
      </>
    );
  }

  // 3. FLUXO REGULAR DO SISTEMA: Renderiza exatamente todas as telas e layout existentes
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'reservas':
        return <NovaReservaView />;
      case 'rota':
        return <RotaMotoristaView />;
      case 'rastreio':
        return <RastreioColaboradoresView />;
      case 'mares':
        return <TabuaMaresView />;
      case 'frota':
        return <FrotaMotoristasView />;
      case 'frota_vendedores':
        return <FrotaVendedoresView />;
      case 'tarifario':
        return <TarifarioView />;
      case 'caixa':
        return <CaixaComissoesView />;
      case 'empresa':
        return <EmpresaConfigView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Toast Notifications */}
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
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          }
        }} 
      />

      {/* Faixa Superior Especial: Exibida Exclusivamente quando o MASTER está dentro de uma Loja */}
      {usuarioAutenticado.perfil === 'master' && (
        <div className="bg-amber-500 text-slate-950 text-xs font-bold px-4 py-1.5 flex items-center justify-between shadow-xs no-print">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">
                👑 MODO MASTER
              </span>
              <span>Acessando: <strong>{lojaAtiva?.nome || 'Loja Selecionada'}</strong> ({lojaAtiva?.id})</span>
            </div>
            <button
              onClick={masterVoltarAoPainel}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Painel Master</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header />

      {/* Main Tab Navigation */}
      <Navbar />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 no-print">
        {renderActiveView()}
      </main>

      {/* Modais de Impressão e Envio de Voucher e Relatórios */}
      {voucherModalType === 'a4' && <VoucherA4Modal />}
      {voucherModalType === 'termico' && <VoucherTermicoModal />}
      <VoucherPublicoModal />
      <RelatorioPdfModal />

      {/* Footer Profissional */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            TurismoOS &bull; Sistema Integrado de Gestão para Receptivos e Passeios
          </p>
          <p className="text-[11px] text-slate-400">
            {lojaAtiva?.nome ? `${lojaAtiva.nome} • ${lojaAtiva.cidade}` : 'Porto de Galinhas • Maragogi • Carneiros'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TurismoProvider>
      <AppContent />
    </TurismoProvider>
  );
}
