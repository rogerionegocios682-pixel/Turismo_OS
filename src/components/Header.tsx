import React, { useState } from 'react';
import { useTurismo } from '../context/TurismoContext';
import { 
  Compass, 
  Store, 
  Plus, 
  Waves, 
  User, 
  ChevronDown, 
  LogOut,
  ShieldCheck,
  Building2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    empresaConfig, 
    agenciaAtiva, 
    setAgenciaAtiva, 
    setActiveTab, 
    getMareDoDia,
    usuarioAutenticado,
    lojaAtiva,
    lojas,
    masterAcessarLoja,
    masterVoltarAoPainel,
    fazerLogout,
    syncStatus,
    ultimoSync,
    forcarSincronizacao
  } = useTurismo();

  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await forcarSincronizacao();
    setIsManualSyncing(false);
  };

  const hojeIso = new Date().toISOString().split('T')[0];
  const mareHoje = getMareDoDia(hojeIso);

  const isMaster = usuarioAutenticado?.perfil === 'master';
  const nomeLojaExibicao = empresaConfig.nomeFantasia || lojaAtiva?.nome || 'Porto Exclusive Receptivo';

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Zona 1: Identidade da Empresa / Agência Logada */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              
              {/* Logomarca Oficial da Agência */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 overflow-hidden border border-white/10">
                {empresaConfig.logoBase64 ? (
                  <img 
                    src={empresaConfig.logoBase64} 
                    alt="Logomarca da Agência" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Compass className="w-6 h-6 text-white" />
                )}
              </div>

              {/* Informações da Loja */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
                    {nomeLojaExibicao}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {lojaAtiva?.id || 'TurismoOS'}
                  </span>
                </div>
                
                {/* Linha de Dados: CNPJ, Telefone e Cidade/UF */}
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5">
                  <span className="font-medium text-slate-300">
                    <strong>CNPJ:</strong> {empresaConfig.cnpj || lojaAtiva?.cnpj || '34.567.890/0001-12'}
                  </span>
                  <span className="text-slate-600 hidden sm:inline">&bull;</span>
                  <span className="font-medium text-slate-300">
                    <strong>TEL:</strong> {empresaConfig.telefoneWhatsapp || lojaAtiva?.telefone || '(81) 99876-5432'}
                  </span>
                  {(empresaConfig.cidadeBase || lojaAtiva?.cidade) && (
                    <>
                      <span className="text-slate-600 hidden md:inline">&bull;</span>
                      <span className="text-slate-400 hidden md:inline truncate max-w-xs">
                        {empresaConfig.cidadeBase || lojaAtiva?.cidade}
                      </span>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Mobile quick CTA */}
            <button
              onClick={() => setActiveTab('reservas')}
              className="lg:hidden flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Reservar</span>
            </button>
          </div>

          {/* Zona 2: Seletor de Agência / Widget de Maré / Perfil / Sync */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            
            {/* Status de Sincronização em Tempo Real (Multi-Dispositivos) */}
            <div 
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs" 
              title={`Sincronização em Nuvem (Multi-Dispositivos). Último sync: ${ultimoSync}`}
            >
              <span className="relative flex h-2 w-2">
                {syncStatus === 'online' && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                )}
                {syncStatus === 'sincronizando' && (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 animate-pulse"></span>
                )}
                {(syncStatus === 'offline' || syncStatus === 'erro') && (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                )}
              </span>
              <span className="hidden sm:inline text-slate-400 text-[11px] font-medium">
                {syncStatus === 'online' && 'Tempo Real'}
                {syncStatus === 'sincronizando' && 'Sincronizando...'}
                {syncStatus === 'offline' && 'Offline'}
                {syncStatus === 'erro' && 'Reconectando...'}
              </span>
              <button
                onClick={handleManualSync}
                disabled={isManualSyncing || syncStatus === 'sincronizando'}
                className="text-slate-400 hover:text-white transition-colors ml-0.5 p-0.5 rounded cursor-pointer disabled:opacity-50"
                title="Forçar sincronização com a nuvem agora"
              >
                <RefreshCw className={`w-3 h-3 ${isManualSyncing || syncStatus === 'sincronizando' ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>

            {/* Widget Rápido de Maré */}
            {mareHoje && (
              <button
                onClick={() => setActiveTab('mares')}
                className="hidden xl:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                title="Clique para ver a tábua de marés completa"
              >
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Maré:</span>
                <span className="font-bold text-cyan-300">{mareHoje.alturaBaixa.toFixed(1)}m ({mareHoje.horarioBaixa})</span>
              </button>
            )}

            {/* Seletor de Agências / Pontos de Atendimento da Loja Ativa */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Store className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <label htmlFor="select-agencia" className="text-slate-400 hidden sm:inline">Ponto / Agência:</label>
              <select
                id="select-agencia"
                value={agenciaAtiva}
                onChange={(e) => setAgenciaAtiva(e.target.value)}
                className="bg-slate-950 text-white font-semibold text-xs rounded border border-slate-700 px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[200px]"
              >
                <option value="Todas as Agências">Todas as Unidades (Geral)</option>
                {empresaConfig.agencias && empresaConfig.agencias.map((ag) => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>

            {/* Menu Dropdown de Usuário Logado & Sessão */}
            <div className="relative">
              <button
                onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isMaster 
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20' 
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
                title="Informações do Usuário e Sessão"
              >
                {isMaster ? (
                  <span className="flex items-center gap-1">
                    <span>👑</span>
                    <span>Master</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span className="max-w-[100px] truncate">{usuarioAutenticado?.nome.split(' ')[0] || 'Usuário'}</span>
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {menuPerfilAberto && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setMenuPerfilAberto(false)}
                >
                  <div className="pb-2.5 mb-2.5 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Usuário Autenticado</span>
                    <strong className="text-white block font-bold text-sm mt-0.5">{usuarioAutenticado?.nome || 'Operador'}</strong>
                    <span className="text-[11px] text-blue-400 block font-mono">@{usuarioAutenticado?.usuarioLogin} &bull; {usuarioAutenticado?.email}</span>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isMaster ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {isMaster ? '👑 ACESSO MASTER' : `🏬 ${lojaAtiva?.nome || 'Loja Vinculada'}`}
                      </span>
                    </div>
                  </div>

                  {/* Se for MASTER: Opções de Painel Master e Troca Rápida de Loja */}
                  {isMaster && (
                    <div className="space-y-1 pb-2 mb-2 border-b border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Acesso Master Central</span>
                      
                      <button
                        onClick={() => {
                          masterVoltarAoPainel();
                          setMenuPerfilAberto(false);
                        }}
                        className="w-full text-left p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold flex items-center justify-between border border-amber-500/20 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>👑</span>
                          <span>Abrir Painel Master</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Alternar rapidamente entre lojas cadastradas */}
                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Alternar para Outra Loja:</span>
                        <select
                          value={lojaAtiva?.id || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              masterAcessarLoja(e.target.value);
                              setMenuPerfilAberto(false);
                            }
                          }}
                          className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {lojas.map(l => (
                            <option key={l.id} value={l.id}>{l.nome} ({l.status.toUpperCase()})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Botão de Logout */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setMenuPerfilAberto(false);
                        fazerLogout();
                      }}
                      className="w-full p-2 rounded-xl text-red-400 hover:text-white hover:bg-red-600/20 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Desconectar / Sair do Sistema</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Ação Primária Desktop */}
            <button
              onClick={() => setActiveTab('reservas')}
              className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Reserva (PDV)</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
