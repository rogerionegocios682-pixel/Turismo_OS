import React from 'react';
import { useTurismo } from '../context/TurismoContext';
import {
  LayoutDashboard,
  Ticket,
  Truck,
  Waves,
  Car,
  Tag,
  Wallet,
  Building2,
  Radio,
  Users
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, reservas, telemetriaColaboradores } = useTurismo();

  const hojeIso = new Date().toISOString().split('T')[0];
  const reservasHoje = reservas.filter(r => r.dataPasseio === hojeIso && r.status !== 'cancelada').length;
  const saldosPendentesHoje = reservas.filter(
    r => r.dataPasseio === hojeIso && !r.saldoQuitado && r.status !== 'cancelada'
  ).length;
  const emMovimentoCount = telemetriaColaboradores.filter(c => c.detalhesOperacao.emMovimento || c.velocidadeKmH > 0).length;

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard & Vendas', icon: LayoutDashboard },
    { id: 'reservas', label: 'Nova Reserva (PDV)', icon: Ticket },
    { 
      id: 'rota', 
      label: 'Rota & Embarque', 
      icon: Truck,
      badgeCount: saldosPendentesHoje > 0 ? saldosPendentesHoje : undefined 
    },
    { 
      id: 'rastreio', 
      label: 'Rastreio GPS / Celular', 
      icon: Radio,
      badgeCount: emMovimentoCount > 0 ? emMovimentoCount : undefined 
    },
    { id: 'frota', label: 'Frota & Guias', icon: Car },
    { id: 'frota_vendedores', label: 'Vendedores', icon: Users },
    { id: 'mares', label: 'Tábua de Marés', icon: Waves },
    { id: 'tarifario', label: 'Tarifário de Passeios', icon: Tag },
    { id: 'caixa', label: 'Caixa & Comissões', icon: Wallet },
    { id: 'empresa', label: 'Dados da Empresa', icon: Building2 }
  ];

  return (
    <nav aria-label="Navegação Principal" className="bg-white border-b border-slate-200 px-4 sm:px-6 shadow-xs sticky top-[57px] z-30 no-print overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
