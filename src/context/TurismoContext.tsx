import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import {
  EmpresaConfig,
  Passeio,
  MotoristaVeiculo,
  PromotorVendedor,
  Reserva,
  RegistroMare,
  TransacaoCaixa,
  FechamentoCaixaDia,
  StatusEmbarque,
  FormaPagamento,
  TelemetriaColaborador,
  PerfilUsuario,
  UsuarioLogado,
  RelatorioPdfConfig,
  Loja,
  UsuarioAuth,
  PerfilAcesso
} from '../types';
import {
  initialEmpresaConfig,
  initialPasseios,
  initialMotoristas,
  initialVendedores,
  initialTabuaMares,
  initialReservas,
  initialTelemetriaColaboradores
} from '../data/mockData';
import {
  initialLojas,
  initialUsuariosAuth,
  initialPasseiosLoja2,
  initialMotoristasLoja2,
  initialVendedoresLoja2,
  initialReservasLoja2,
  initialTransacoesLoja2
} from '../data/lojasAuthData';
import toast from 'react-hot-toast';

interface TurismoContextType {
  // Sincronização em Tempo Real Multidispositivo (Nuvem Firestore)
  syncStatus: 'online' | 'sincronizando' | 'offline' | 'erro';
  ultimoSync: string;
  forcarSincronizacao: () => Promise<void>;

  // Autenticação Multi-Loja & Master
  usuarioAutenticado: UsuarioAuth | null;
  lojas: Loja[];
  usuariosSistema: UsuarioAuth[];
  lojaAtivaId: string | null;
  lojaAtiva: Loja | null;
  fazerLogin: (usuarioOuEmail: string, senha: string, lojaIdOpcional?: string) => { sucesso: boolean; mensagem?: string; perfil?: PerfilAcesso };
  fazerLoginMaster: (email: string, senha: string) => Promise<{ sucesso: boolean; mensagem?: string }> | { sucesso: boolean; mensagem?: string };
  fazerLoginLoja: (usuarioOuEmail: string, senha: string) => Promise<{ sucesso: boolean; mensagem?: string }> | { sucesso: boolean; mensagem?: string };
  fazerLogout: () => void;
  
  // Ações do MASTER
  masterAcessarLoja: (lojaId: string) => void;
  masterVoltarAoPainel: () => void;
  masterCadastrarLoja: (dados: Omit<Loja, 'id' | 'criadoEm'>, credenciaisAcesso?: { email: string; senha: string; status?: 'ativo' | 'inativo' }) => void;
  masterAtualizarLoja: (lojaId: string, dados: Partial<Loja>, credenciaisAcesso?: { email?: string; senha?: string; status?: 'ativo' | 'inativo' }) => void;
  masterAlternarStatusLoja: (lojaId: string) => void;
  masterCadastrarUsuario: (usuario: Omit<UsuarioAuth, 'id' | 'ultimoAcesso'>) => void;
  masterAtualizarUsuario: (usuarioId: string, dados: Partial<UsuarioAuth>) => void;
  masterExcluirUsuario: (usuarioId: string) => void;
  todasAsReservasGlobal: Reserva[];
  todasAsTransacoesGlobal: TransacaoCaixa[];

  // Compatibilidade com Perfil/Agência Legados
  usuarioLogado: UsuarioLogado;
  alternarPerfilUsuario: (perfil: PerfilUsuario, novaAgencia?: string) => void;
  setAgenciaVinculada: (agencia: string) => void;

  // Config da Loja Ativa
  empresaConfig: EmpresaConfig;
  updateEmpresaConfig: (novaConfig: Partial<EmpresaConfig>) => void;
  agenciaAtiva: string;
  setAgenciaAtiva: (agencia: string) => void;
  
  // Navigation & Modals
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedVoucher: Reserva | null;
  voucherModalType: 'a4' | 'termico' | null;
  abrirVoucherModal: (reserva: Reserva, tipo: 'a4' | 'termico') => void;
  fecharVoucherModal: () => void;

  // Relatórios em PDF Padronizados
  relatorioAtivoModal: RelatorioPdfConfig | null;
  abrirRelatorioPdfModal: (config: RelatorioPdfConfig) => void;
  fecharRelatorioPdfModal: () => void;

  // Passeios Isolados por Loja
  passeios: Passeio[];
  adicionarPasseio: (passeio: Omit<Passeio, 'id'>) => void;
  atualizarPasseio: (id: string, dados: Partial<Passeio>) => void;
  excluirPasseio: (id: string) => void;

  // Motoristas & Frota Isolados por Loja
  motoristas: MotoristaVeiculo[];
  adicionarMotorista: (mot: Omit<MotoristaVeiculo, 'id'>) => void;
  atualizarMotorista: (id: string, dados: Partial<MotoristaVeiculo>) => void;
  excluirMotorista: (id: string) => void;

  // Vendedores & Promotores Isolados por Loja
  vendedores: PromotorVendedor[];
  adicionarVendedor: (ven: Omit<PromotorVendedor, 'id'>) => void;
  atualizarVendedor: (id: string, dados: Partial<PromotorVendedor>) => void;

  // Rastreio de Colaboradores Isolados por Loja
  telemetriaColaboradores: TelemetriaColaborador[];
  atualizarTelemetriaColaborador: (id: string, dados: Partial<TelemetriaColaborador>) => void;
  solicitarPingCelular: (idOuTelefone: string) => Promise<{ sucesso: boolean; mensagem: string }>;
  atualizarCoordenadasGPS: (id: string, lat: number, lng: number, nomeLocal?: string) => void;
  buscarColaboradorPorTelefone: (telefone: string) => TelemetriaColaborador | undefined;

  // Reservas Isoladas por Loja
  reservas: Reserva[];
  criarReserva: (dadosReserva: Omit<Reserva, 'id' | 'codigoVoucher' | 'dataEmissao'>) => Reserva;
  atualizarReserva: (id: string, dados: Partial<Reserva>) => void;
  quitarSaldoReserva: (reservaId: string, formaPagamento: FormaPagamento) => void;
  atualizarStatusEmbarque: (reservaId: string, status: StatusEmbarque, formaPagtoSaldo?: FormaPagamento) => void;
  cancelarReserva: (reservaId: string, motivo?: string) => void;

  // Tábua de Marés
  tabuaMares: RegistroMare[];
  salvarRegistroMare: (registro: RegistroMare) => void;
  getMareDoDia: (dataYmd: string) => RegistroMare | undefined;

  // Caixa & Financeiro Isolados por Loja
  transacoesCaixa: TransacaoCaixa[];
  fechamentosCaixa: FechamentoCaixaDia[];
  registrarTransacaoManual: (transacao: Omit<TransacaoCaixa, 'id' | 'dataHora'>) => void;
  pagarComissaoVendedor: (reservaId: string) => void;

  // Backup & Import
  exportarBackupCompleto: () => void;
  importarBackupCompleto: (jsonContent: string) => boolean;
  restaurarDadosPadrao: () => void;
}

const TurismoContext = createContext<TurismoContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH_SESSION: 'turismo_os_auth_session_v3',
  LOJAS: 'turismo_os_lojas_v3',
  USUARIOS_SISTEMA: 'turismo_os_usuarios_sistema_v3',
  LOJA_ATIVA_ID: 'turismo_os_loja_ativa_id_v3',
  PASSEIOS: 'turismo_os_passeios_v3',
  MOTORISTAS: 'turismo_os_motoristas_v3',
  VENDEDORES: 'turismo_os_vendedores_v3',
  RESERVAS: 'turismo_os_reservas_v3',
  MARES: 'turismo_os_mares_v3',
  TRANSACOES: 'turismo_os_transacoes_v3',
  FECHAMENTOS: 'turismo_os_fechamentos_v3',
  AGENCIA_ATIVA: 'turismo_os_agencia_ativa_v3',
  TELEMETRIA: 'turismo_os_telemetria_v3'
};

export const TurismoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // 1. ESTADO DE LOJAS CADASTRADAS (Multi-Tenant)
  const [lojas, setLojas] = useState<Loja[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.LOJAS);
    if (salvo) {
      try { return JSON.parse(salvo); } catch { /* ignore */ }
    }
    return initialLojas;
  });

  // 2. ESTADO DE USUÁRIOS DO SISTEMA
  const [usuariosSistema, setUsuariosSistema] = useState<UsuarioAuth[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.USUARIOS_SISTEMA);
    if (salvo) {
      try {
        const parsed: UsuarioAuth[] = JSON.parse(salvo);
        // Garante que as credenciais do Master estejam sempre atualizadas
        const existeMaster = parsed.find(u => u.perfil === 'master');
        if (existeMaster) {
          return parsed.map(u => {
            if (u.perfil === 'master') {
              return {
                ...u,
                email: 'rogerionegocios682@gmail.com',
                senha: '@eRro404'
              };
            }
            return u;
          });
        }
        return [...parsed, initialUsuariosAuth[0]];
      } catch { /* ignore */ }
    }
    return initialUsuariosAuth;
  });

  // 3. ESTADO DE SESSÃO / USUÁRIO AUTENTICADO
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<UsuarioAuth | null>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (salvo) {
      try { return JSON.parse(salvo); } catch { /* ignore */ }
    }
    return null; // Exige login inicial
  });

  // 4. LOJA ATIVA (Tenant ID)
  const [lojaAtivaId, setLojaAtivaId] = useState<string | null>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.LOJA_ATIVA_ID);
    if (salvo) return salvo;
    return 'LOJA_001';
  });

  // Objeto Loja correspondente
  const lojaAtiva = lojas.find(l => l.id === (lojaAtivaId || 'LOJA_001')) || lojas[0] || null;

  // 5. ESTADO GLOBAL DE PASSEIOS (Com store_id)
  const [todasAsPasseios, setTodasAsPasseios] = useState<Passeio[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.PASSEIOS);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return parsed.map((p: any) => ({ ...p, store_id: p.store_id || 'LOJA_001' }));
      } catch { /* ignore */ }
    }
    const baseL1 = initialPasseios.map(p => ({ ...p, store_id: 'LOJA_001' }));
    return [...baseL1, ...initialPasseiosLoja2];
  });

  // 6. ESTADO GLOBAL DE MOTORISTAS (Com store_id)
  const [todosOsMotoristas, setTodosOsMotoristas] = useState<MotoristaVeiculo[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.MOTORISTAS);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return parsed.map((m: any) => ({ ...m, store_id: m.store_id || 'LOJA_001' }));
      } catch { /* ignore */ }
    }
    const baseL1 = initialMotoristas.map(m => ({ ...m, store_id: 'LOJA_001' }));
    return [...baseL1, ...initialMotoristasLoja2];
  });

  // 7. ESTADO GLOBAL DE VENDEDORES (Com store_id)
  const [todosOsVendedores, setTodosOsVendedores] = useState<PromotorVendedor[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.VENDEDORES);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return parsed.map((v: any) => ({ ...v, store_id: v.store_id || 'LOJA_001' }));
      } catch { /* ignore */ }
    }
    const baseL1 = initialVendedores.map(v => ({ ...v, store_id: 'LOJA_001' }));
    return [...baseL1, ...initialVendedoresLoja2];
  });

  // 8. ESTADO GLOBAL DE RESERVAS (Com store_id)
  const [todasAsReservasGlobal, setTodasAsReservasGlobal] = useState<Reserva[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.RESERVAS);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return parsed.map((r: any) => ({ ...r, store_id: r.store_id || 'LOJA_001' }));
      } catch { /* ignore */ }
    }
    const baseL1 = initialReservas.map(r => ({ ...r, store_id: 'LOJA_001' }));
    return [...baseL1, ...initialReservasLoja2];
  });

  // 9. ESTADO GLOBAL DE TRANSAÇÕES CAIXA (Com store_id)
  const [todasAsTransacoesGlobal, setTodasAsTransacoesGlobal] = useState<TransacaoCaixa[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.TRANSACOES);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return parsed.map((t: any) => ({ ...t, store_id: t.store_id || 'LOJA_001' }));
      } catch { /* ignore */ }
    }
    const txBaseL1: TransacaoCaixa[] = [
      {
        id: 'TX-01',
        store_id: 'LOJA_001',
        dataHora: new Date(Date.now() - 3600000 * 5).toISOString(),
        tipo: 'entrada_sinal',
        reservaId: 'RSV-849201',
        codigoVoucher: 'RSV-849201',
        agencia: 'Matriz - Centro de Porto de Galinhas',
        valor: 300.00,
        formaPagamento: 'pix',
        descricao: 'Sinal recebido - Reserva RSV-849201 (Dr. Eduardo Meirelles)',
        operadorNome: 'Rogério Silva'
      },
      {
        id: 'TX-02',
        store_id: 'LOJA_001',
        dataHora: new Date(Date.now() - 3600000 * 8).toISOString(),
        tipo: 'entrada_sinal',
        reservaId: 'RSV-849202',
        codigoVoucher: 'RSV-849202',
        agencia: 'Matriz - Centro de Porto de Galinhas',
        valor: 200.00,
        formaPagamento: 'cartao_credito',
        descricao: 'Sinal recebido - Reserva RSV-849202 (Juliana Vasconcelos)',
        operadorNome: 'Rogério Silva'
      },
      {
        id: 'TX-03',
        store_id: 'LOJA_001',
        dataHora: new Date(Date.now() - 3600000 * 20).toISOString(),
        tipo: 'entrada_sinal',
        reservaId: 'RSV-849203',
        codigoVoucher: 'RSV-849203',
        agencia: 'Balcão - Vila de Porto (Rua Esperança)',
        valor: 100.00,
        formaPagamento: 'pix',
        descricao: 'Sinal recebido - Reserva RSV-849203 (Rodrigo Mendonça)',
        operadorNome: 'Rogério Silva'
      },
      {
        id: 'TX-04',
        store_id: 'LOJA_001',
        dataHora: new Date().toISOString(),
        tipo: 'entrada_saldo_embarque',
        reservaId: 'RSV-849203',
        codigoVoucher: 'RSV-849203',
        agencia: 'Balcão - Vila de Porto (Rua Esperança)',
        valor: 180.00,
        formaPagamento: 'pix',
        descricao: 'Saldo de embarque recebido - RSV-849203 (Rodrigo Mendonça)',
        operadorNome: 'Cláudio Santos (Motorista)'
      }
    ];
    return [...txBaseL1, ...initialTransacoesLoja2];
  });

  // 10. FECHAMENTOS CAIXA
  const [todosOsFechamentos, setTodosOsFechamentos] = useState<FechamentoCaixaDia[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.FECHAMENTOS);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return parsed.map((f: any) => ({ ...f, store_id: f.store_id || 'LOJA_001' }));
      } catch { /* ignore */ }
    }
    return [];
  });

  // 11. TELEMETRIA COLABORADORES
  const [todasAsTelemetrias, setTodasAsTelemetrias] = useState<TelemetriaColaborador[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.TELEMETRIA);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return parsed.map((t: any) => ({ ...t, store_id: t.store_id || 'LOJA_001' }));
      } catch { /* ignore */ }
    }
    return initialTelemetriaColaboradores.map(t => ({ ...t, store_id: 'LOJA_001' }));
  });

  // 12. TÁBUA DE MARÉS
  const [tabuaMares, setTabuaMares] = useState<RegistroMare[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.MARES);
    if (salvo) {
      try { return JSON.parse(salvo); } catch { /* ignore */ }
    }
    return initialTabuaMares;
  });

  // 13. ESTADO DA TAB ATIVA
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedVoucher, setSelectedVoucher] = useState<Reserva | null>(null);
  const [voucherModalType, setVoucherModalType] = useState<'a4' | 'termico' | null>(null);
  const [relatorioAtivoModal, setRelatorioAtivoModal] = useState<RelatorioPdfConfig | null>(null);

  // 14. AGÊNCIA ATIVA DA LOJA
  const [agenciaAtiva, setAgenciaAtivaState] = useState<string>(() => {
    const salvo = localStorage.getItem(STORAGE_KEYS.AGENCIA_ATIVA);
    return salvo || 'Todas as Agências';
  });

  const setAgenciaAtiva = (agencia: string) => {
    setAgenciaAtivaState(agencia);
    localStorage.setItem(STORAGE_KEYS.AGENCIA_ATIVA, agencia);
  };

  // 15. ESTADO DE SINCRONIZAÇÃO EM TEMPO REAL
  const [syncStatus, setSyncStatus] = useState<'online' | 'sincronizando' | 'offline' | 'erro'>('sincronizando');
  const [ultimoSync, setUltimoSync] = useState<string>('Conectando...');

  // -------------------------------------------------------------
  // SINCRONIZAÇÃO EM TEMPO REAL MULTIDISPOSITIVO COM FIREBASE FIRESTORE
  // -------------------------------------------------------------
  const salvarNoFirestore = async (dados: Partial<{
    lojas: Loja[];
    usuarios: UsuarioAuth[];
    passeios: Passeio[];
    motoristas: MotoristaVeiculo[];
    vendedores: PromotorVendedor[];
    reservas: Reserva[];
    transacoes: TransacaoCaixa[];
    fechamentos: FechamentoCaixaDia[];
    telemetria: TelemetriaColaborador[];
    tabuaMares: RegistroMare[];
  }>) => {
    try {
      setSyncStatus('sincronizando');
      const sanitized = sanitizeForFirestore(dados);
      const agoraIso = new Date().toISOString();
      const globalDocRef = doc(db, 'turismo_os', 'global_data');
      
      // Salva no documento principal do Firestore
      await setDoc(globalDocRef, {
        ...sanitized,
        updatedAt: agoraIso
      }, { merge: true });

      // Salva também de forma granular por coleção para redundância
      if (sanitized.lojas) {
        setDoc(doc(db, 'turismo_os', 'lojas'), { items: sanitized.lojas, updatedAt: agoraIso }, { merge: true }).catch(() => {});
      }
      if (sanitized.usuarios) {
        setDoc(doc(db, 'turismo_os', 'usuarios'), { items: sanitized.usuarios, updatedAt: agoraIso }, { merge: true }).catch(() => {});
      }
      if (sanitized.reservas) {
        setDoc(doc(db, 'turismo_os', 'reservas'), { items: sanitized.reservas, updatedAt: agoraIso }, { merge: true }).catch(() => {});
      }
      if (sanitized.transacoes) {
        setDoc(doc(db, 'turismo_os', 'transacoes'), { items: sanitized.transacoes, updatedAt: agoraIso }, { merge: true }).catch(() => {});
      }

      // Sincronização secundária com backend Node/Express
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized)
      }).catch(() => {});

      setSyncStatus('online');
      setUltimoSync(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      console.error('[FIRESTORE] Erro ao sincronizar com Firestore:', err);
      setSyncStatus('erro');
    }
  };

  // Listener em tempo real do Firestore - Observa todas as coleções (reservas, caixa, frota, passeios, etc)
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    try {
      const globalDocRef = doc(db, 'turismo_os', 'global_data');
      
      unsubscribeFirestore = onSnapshot(globalDocRef, (snapshot) => {
        if (!snapshot.exists()) {
          // Inicializa o Firestore com os dados locais sanitizados se for a primeira execução
          const initialPayload = sanitizeForFirestore({
            lojas,
            usuarios: usuariosSistema,
            passeios: todasAsPasseios,
            motoristas: todosOsMotoristas,
            vendedores: todosOsVendedores,
            reservas: todasAsReservasGlobal,
            transacoes: todasAsTransacoesGlobal,
            fechamentos: todosOsFechamentos,
            telemetria: todasAsTelemetrias,
            tabuaMares,
            updatedAt: new Date().toISOString()
          });
          setDoc(globalDocRef, initialPayload, { merge: true }).catch(console.error);
          setSyncStatus('online');
          setUltimoSync(new Date().toLocaleTimeString('pt-BR'));
          return;
        }

        const data = snapshot.data();
        if (!data) return;

        // Atualização em tempo real das coleções recebidas de outros aparelhos
        if (data.lojas && Array.isArray(data.lojas)) {
          setLojas(data.lojas);
          localStorage.setItem(STORAGE_KEYS.LOJAS, JSON.stringify(data.lojas));
        }
        if (data.usuarios && Array.isArray(data.usuarios)) {
          setUsuariosSistema(data.usuarios);
          localStorage.setItem(STORAGE_KEYS.USUARIOS_SISTEMA, JSON.stringify(data.usuarios));
        }
        if (data.passeios && Array.isArray(data.passeios)) {
          setTodasAsPasseios(data.passeios);
          localStorage.setItem(STORAGE_KEYS.PASSEIOS, JSON.stringify(data.passeios));
        }
        if (data.motoristas && Array.isArray(data.motoristas)) {
          setTodosOsMotoristas(data.motoristas);
          localStorage.setItem(STORAGE_KEYS.MOTORISTAS, JSON.stringify(data.motoristas));
        }
        if (data.vendedores && Array.isArray(data.vendedores)) {
          setTodosOsVendedores(data.vendedores);
          localStorage.setItem(STORAGE_KEYS.VENDEDORES, JSON.stringify(data.vendedores));
        }
        if (data.reservas && Array.isArray(data.reservas)) {
          setTodasAsReservasGlobal(data.reservas);
          localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(data.reservas));
        }
        if (data.transacoes && Array.isArray(data.transacoes)) {
          setTodasAsTransacoesGlobal(data.transacoes);
          localStorage.setItem(STORAGE_KEYS.TRANSACOES, JSON.stringify(data.transacoes));
        }
        if (data.fechamentos && Array.isArray(data.fechamentos)) {
          setTodosOsFechamentos(data.fechamentos);
          localStorage.setItem(STORAGE_KEYS.FECHAMENTOS, JSON.stringify(data.fechamentos));
        }
        if (data.telemetria && Array.isArray(data.telemetria)) {
          setTodasAsTelemetrias(data.telemetria);
          localStorage.setItem(STORAGE_KEYS.TELEMETRIA, JSON.stringify(data.telemetria));
        }
        if (data.tabuaMares && Array.isArray(data.tabuaMares)) {
          setTabuaMares(data.tabuaMares);
          localStorage.setItem(STORAGE_KEYS.MARES, JSON.stringify(data.tabuaMares));
        }

        setSyncStatus('online');
        setUltimoSync(new Date().toLocaleTimeString('pt-BR'));
      }, (error) => {
        console.warn('[FIREBASE ONSNAPSHOT] Listener error:', error);
        setSyncStatus('offline');
      });
    } catch (e) {
      console.warn('[FIREBASE] Listener init error:', e);
      setSyncStatus('erro');
    }

    return () => {
      unsubscribeFirestore();
    };
  }, []);

  // Forçar atualização manual em tempo real de todos os dados da nuvem
  const forcarSincronizacao = async () => {
    try {
      setSyncStatus('sincronizando');
      const globalDocRef = doc(db, 'turismo_os', 'global_data');
      const snap = await getDoc(globalDocRef);
      let data = snap.exists() ? snap.data() : null;

      if (!data) {
        try {
          const res = await fetch('/api/data');
          if (res.ok) {
            data = await res.json();
          }
        } catch { /* ignore */ }
      }

      if (data) {
        if (data.lojas && Array.isArray(data.lojas)) {
          setLojas(data.lojas);
          localStorage.setItem(STORAGE_KEYS.LOJAS, JSON.stringify(data.lojas));
        }
        if (data.usuarios && Array.isArray(data.usuarios)) {
          setUsuariosSistema(data.usuarios);
          localStorage.setItem(STORAGE_KEYS.USUARIOS_SISTEMA, JSON.stringify(data.usuarios));
        }
        if (data.passeios && Array.isArray(data.passeios)) {
          setTodasAsPasseios(data.passeios);
          localStorage.setItem(STORAGE_KEYS.PASSEIOS, JSON.stringify(data.passeios));
        }
        if (data.motoristas && Array.isArray(data.motoristas)) {
          setTodosOsMotoristas(data.motoristas);
          localStorage.setItem(STORAGE_KEYS.MOTORISTAS, JSON.stringify(data.motoristas));
        }
        if (data.vendedores && Array.isArray(data.vendedores)) {
          setTodosOsVendedores(data.vendedores);
          localStorage.setItem(STORAGE_KEYS.VENDEDORES, JSON.stringify(data.vendedores));
        }
        if (data.reservas && Array.isArray(data.reservas)) {
          setTodasAsReservasGlobal(data.reservas);
          localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(data.reservas));
        }
        if (data.transacoes && Array.isArray(data.transacoes)) {
          setTodasAsTransacoesGlobal(data.transacoes);
          localStorage.setItem(STORAGE_KEYS.TRANSACOES, JSON.stringify(data.transacoes));
        }
        if (data.fechamentos && Array.isArray(data.fechamentos)) {
          setTodosOsFechamentos(data.fechamentos);
          localStorage.setItem(STORAGE_KEYS.FECHAMENTOS, JSON.stringify(data.fechamentos));
        }
        if (data.telemetria && Array.isArray(data.telemetria)) {
          setTodasAsTelemetrias(data.telemetria);
          localStorage.setItem(STORAGE_KEYS.TELEMETRIA, JSON.stringify(data.telemetria));
        }
        if (data.tabuaMares && Array.isArray(data.tabuaMares)) {
          setTabuaMares(data.tabuaMares);
          localStorage.setItem(STORAGE_KEYS.MARES, JSON.stringify(data.tabuaMares));
        }
        setSyncStatus('online');
        setUltimoSync(new Date().toLocaleTimeString('pt-BR'));
        toast.success('Dados sincronizados com a nuvem em tempo real!', { icon: '🔄' });
      } else {
        setSyncStatus('online');
      }
    } catch (err) {
      console.error('Erro ao forçar sincronização:', err);
      setSyncStatus('erro');
      toast.error('Erro ao sincronizar dados com o servidor.');
    }
  };

  // PERSISTÊNCIA LOCALSTORAGE
  useEffect(() => {
    if (usuarioAutenticado) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(usuarioAutenticado));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  }, [usuarioAutenticado]);

  useEffect(() => {
    if (lojaAtivaId) {
      localStorage.setItem(STORAGE_KEYS.LOJA_ATIVA_ID, lojaAtivaId);
    }
  }, [lojaAtivaId]);

  // -------------------------------------------------------------
  // REGRA DE ISOLAMENTO RIGOROSO:
  // Filtra os dados da Loja Ativa Atual (lojaAtivaId)
  // -------------------------------------------------------------
  const currentStoreId = lojaAtivaId || 'LOJA_001';

  const passeios = todasAsPasseios.filter(p => (p.store_id || 'LOJA_001') === currentStoreId);
  const motoristas = todosOsMotoristas.filter(m => (m.store_id || 'LOJA_001') === currentStoreId);
  const vendedores = todosOsVendedores.filter(v => (v.store_id || 'LOJA_001') === currentStoreId);
  const reservas = todasAsReservasGlobal.filter(r => (r.store_id || 'LOJA_001') === currentStoreId);
  const transacoesCaixa = todasAsTransacoesGlobal.filter(t => (t.store_id || 'LOJA_001') === currentStoreId);
  const fechamentosCaixa = todosOsFechamentos.filter(f => (f.store_id || 'LOJA_001') === currentStoreId);
  const telemetriaColaboradores = todasAsTelemetrias.filter(t => (t.store_id || 'LOJA_001') === currentStoreId);
  const empresaConfig: EmpresaConfig = lojaAtiva?.empresaConfig || initialEmpresaConfig;

  // -------------------------------------------------------------
  // AUTENTICAÇÃO E LOGIN MULTI-LOJA & MASTER SEPARADOS (TEMPO REAL)
  // -------------------------------------------------------------

  // Login Exclusivo para o MASTER (Centralizado)
  const fazerLoginMaster = async (emailOuLogin: string, senha: string): Promise<{ sucesso: boolean; mensagem?: string }> => {
    const termo = emailOuLogin.trim().toLowerCase();
    const senhaLimpa = senha.trim();
    
    // Credencial Master Oficial Primária
    const isMasterOficial = (
      (termo === 'rogerionegocios682@gmail.com' || termo === 'master') &&
      senhaLimpa === '@eRro404'
    );

    if (isMasterOficial) {
      const masterObj: UsuarioAuth = {
        id: 'USR-MASTER-01',
        nome: 'Administrador Master',
        email: 'rogerionegocios682@gmail.com',
        usuarioLogin: 'master',
        senha: '@eRro404',
        perfil: 'master',
        store_id: 'ALL',
        nomeLoja: 'PAINEL MASTER (Todas as Lojas)',
        status: 'ativo',
        ultimoAcesso: new Date().toISOString()
      };

      setUsuariosSistema(prev => {
        const filtrados = prev.filter(u => u.perfil !== 'master');
        return [masterObj, ...filtrados];
      });

      setUsuarioAutenticado(masterObj);
      setLojaAtivaId(null);
      setActiveTab('painel_master');
      return { sucesso: true };
    }

    // Procura na lista de usuários cadastrados (caso haja outro master cadastrado)
    let masterEncontrado = usuariosSistema.find(u => 
      u.perfil === 'master' && (u.email.toLowerCase() === termo || u.usuarioLogin.toLowerCase() === termo)
    );

    // Se não encontrado localmente, busca dados atualizados da nuvem (outros dispositivos)
    if (!masterEncontrado) {
      try {
        const snap = await getDoc(doc(db, 'turismo_os', 'global_data'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.usuarios && Array.isArray(data.usuarios)) {
            setUsuariosSistema(data.usuarios);
            masterEncontrado = data.usuarios.find((u: UsuarioAuth) => 
              u.perfil === 'master' && (u.email.toLowerCase() === termo || u.usuarioLogin.toLowerCase() === termo)
            );
          }
        }
      } catch { /* ignore */ }
    }

    if (!masterEncontrado || masterEncontrado.senha !== senhaLimpa) {
      return { sucesso: false, mensagem: 'Acesso não autorizado. Verifique e-mail e senha.' };
    }

    if (masterEncontrado.status === 'inativo') {
      return { sucesso: false, mensagem: 'Acesso não autorizado.' };
    }

    setUsuarioAutenticado(masterEncontrado);
    setLojaAtivaId(null);
    setActiveTab('painel_master');
    return { sucesso: true };
  };

  // Login Exclusivo para Usuários das Lojas (Área do Cliente)
  const fazerLoginLoja = async (usuarioOuEmail: string, senha: string): Promise<{ sucesso: boolean; mensagem?: string }> => {
    const termo = usuarioOuEmail.trim().toLowerCase();
    const senhaLimpa = senha.trim();
    
    // Procura usuário de loja (não-master)
    let usuarioEncontrado = usuariosSistema.find(u => 
      u.perfil !== 'master' && (u.usuarioLogin.toLowerCase() === termo || u.email.toLowerCase() === termo)
    );

    let listaLojasAtual = lojas;

    // Se não encontrou o usuário de loja na memória, tenta buscar imediatamente da nuvem (outros aparelhos)
    if (!usuarioEncontrado) {
      try {
        const snap = await getDoc(doc(db, 'turismo_os', 'global_data'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.usuarios && Array.isArray(data.usuarios)) {
            setUsuariosSistema(data.usuarios);
            localStorage.setItem(STORAGE_KEYS.USUARIOS_SISTEMA, JSON.stringify(data.usuarios));
            usuarioEncontrado = data.usuarios.find((u: UsuarioAuth) => 
              u.perfil !== 'master' && (u.usuarioLogin.toLowerCase() === termo || u.email.toLowerCase() === termo)
            );
          }
          if (data.lojas && Array.isArray(data.lojas)) {
            setLojas(data.lojas);
            localStorage.setItem(STORAGE_KEYS.LOJAS, JSON.stringify(data.lojas));
            listaLojasAtual = data.lojas;
          }
        }
      } catch { /* ignore */ }
    }

    if (!usuarioEncontrado || usuarioEncontrado.senha !== senhaLimpa) {
      return { sucesso: false, mensagem: 'E-mail ou senha incorretos.' };
    }

    if (usuarioEncontrado.status === 'inativo') {
      return { sucesso: false, mensagem: 'Seu acesso está temporariamente desativado. Entre em contato com o administrador.' };
    }

    // Verifica se a loja vinculada existe e está ativa
    const lojaDoUsuario = listaLojasAtual.find(l => l.id === usuarioEncontrado!.store_id);
    if (!lojaDoUsuario) {
      return { sucesso: false, mensagem: 'Loja vinculada não encontrada no sistema.' };
    }
    if (lojaDoUsuario.status === 'inativa') {
      return { sucesso: false, mensagem: 'Seu acesso está temporariamente desativado. Entre em contato com o administrador.' };
    }

    // Autentica e isola estritamente na loja do usuário
    setUsuarioAutenticado(usuarioEncontrado);
    setLojaAtivaId(usuarioEncontrado.store_id);
    setActiveTab('dashboard');
    return { sucesso: true };
  };

  const fazerLogin = (usuarioOuEmail: string, senha: string, lojaIdOpcional?: string): { sucesso: boolean; mensagem?: string; perfil?: PerfilAcesso } => {
    const termo = usuarioOuEmail.trim().toLowerCase();
    const usuarioEncontrado = usuariosSistema.find(u => 
      (u.usuarioLogin.toLowerCase() === termo || u.email.toLowerCase() === termo)
    );

    if (!usuarioEncontrado) {
      return { sucesso: false, mensagem: 'Usuário não encontrado no sistema.' };
    }

    if (usuarioEncontrado.senha !== senha.trim()) {
      return { sucesso: false, mensagem: 'Senha incorreta.' };
    }

    if (usuarioEncontrado.status === 'inativo') {
      return { sucesso: false, mensagem: 'Seu acesso está temporariamente desativado. Entre em contato com o administrador.' };
    }

    if (usuarioEncontrado.perfil === 'master') {
      setUsuarioAutenticado(usuarioEncontrado);
      if (lojaIdOpcional) {
        setLojaAtivaId(lojaIdOpcional);
        setActiveTab('dashboard');
      } else {
        setLojaAtivaId(null);
        setActiveTab('painel_master');
      }
      return { sucesso: true, perfil: 'master' };
    }

    const lojaDoUsuario = lojas.find(l => l.id === usuarioEncontrado.store_id);
    if (!lojaDoUsuario || lojaDoUsuario.status === 'inativa') {
      return { sucesso: false, mensagem: 'Seu acesso está temporariamente desativado. Entre em contato com o administrador.' };
    }

    setUsuarioAutenticado(usuarioEncontrado);
    setLojaAtivaId(usuarioEncontrado.store_id);
    setActiveTab('dashboard');
    return { sucesso: true, perfil: usuarioEncontrado.perfil };
  };

  const fazerLogout = () => {
    setUsuarioAutenticado(null);
    setLojaAtivaId(null);
    setActiveTab('dashboard');
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  };

  // -------------------------------------------------------------
  // AÇÕES EXCLUSIVAS DO MASTER COM VERIFICAÇÃO DE SEGURANÇA
  // -------------------------------------------------------------
  const masterAcessarLoja = (lojaId: string) => {
    if (usuarioAutenticado?.perfil !== 'master') {
      toast.error('Acesso não autorizado.');
      return;
    }
    setLojaAtivaId(lojaId);
    setActiveTab('dashboard');
  };

  const masterVoltarAoPainel = () => {
    if (usuarioAutenticado?.perfil !== 'master') {
      toast.error('Acesso não autorizado.');
      return;
    }
    setLojaAtivaId(null);
    setActiveTab('painel_master');
  };

  const masterCadastrarLoja = (
    dados: Omit<Loja, 'id' | 'criadoEm'>,
    credenciaisAcesso?: { email: string; senha: string; status?: 'ativo' | 'inativo' }
  ) => {
    if (usuarioAutenticado?.perfil !== 'master') {
      toast.error('Acesso não autorizado.');
      return;
    }
    const id = `LOJA_${Date.now().toString().slice(-4)}`;
    const novaLoja: Loja = {
      ...dados,
      id,
      criadoEm: new Date().toISOString()
    };
    const novasLojas = [...lojas, novaLoja];
    setLojas(novasLojas);

    let novosUsuarios = usuariosSistema;
    if (credenciaisAcesso && credenciaisAcesso.email) {
      const emailFinal = credenciaisAcesso.email.trim();
      const loginFinal = emailFinal.includes('@') ? emailFinal.split('@')[0] : emailFinal;
      const idUser = `USR-${Date.now().toString().slice(-4)}`;
      const novoUsuario: UsuarioAuth = {
        id: idUser,
        nome: dados.nome,
        email: emailFinal,
        usuarioLogin: loginFinal.toLowerCase(),
        senha: credenciaisAcesso.senha?.trim() || '123',
        perfil: 'admin_loja',
        store_id: id,
        nomeLoja: dados.nome,
        status: credenciaisAcesso.status || (dados.status === 'ativa' ? 'ativo' : 'inativo'),
        ultimoAcesso: new Date().toISOString()
      };
      novosUsuarios = [...usuariosSistema, novoUsuario];
      setUsuariosSistema(novosUsuarios);
    }
    salvarNoFirestore({ lojas: novasLojas, usuarios: novosUsuarios });
  };

  const masterAtualizarLoja = (
    lojaId: string, 
    dados: Partial<Loja>,
    credenciaisAcesso?: { email?: string; senha?: string; status?: 'ativo' | 'inativo' }
  ) => {
    if (usuarioAutenticado?.perfil !== 'master') {
      toast.error('Acesso não autorizado.');
      return;
    }
    const novasLojas = lojas.map(l => l.id === lojaId ? { ...l, ...dados } : l);
    setLojas(novasLojas);

    let novosUsuarios = usuariosSistema;
    if (credenciaisAcesso) {
      const usuarioExistente = usuariosSistema.find(u => u.store_id === lojaId);
      if (usuarioExistente) {
        novosUsuarios = usuariosSistema.map(u => {
          if (u.id === usuarioExistente.id) {
            const emailFinal = credenciaisAcesso.email?.trim() || u.email;
            const loginFinal = emailFinal.includes('@') ? emailFinal.split('@')[0] : emailFinal;
            return {
              ...u,
              nome: dados.nome || u.nome,
              email: emailFinal,
              usuarioLogin: loginFinal.toLowerCase(),
              ...(credenciaisAcesso.senha?.trim() ? { senha: credenciaisAcesso.senha.trim() } : {}),
              status: credenciaisAcesso.status || (dados.status ? (dados.status === 'ativa' ? 'ativo' : 'inativo') : u.status)
            };
          }
          return u;
        });
      } else if (credenciaisAcesso.email) {
        const emailFinal = credenciaisAcesso.email.trim();
        const loginFinal = emailFinal.includes('@') ? emailFinal.split('@')[0] : emailFinal;
        const novoUsuario: UsuarioAuth = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          nome: dados.nome || 'Administrador da Loja',
          email: emailFinal,
          usuarioLogin: loginFinal.toLowerCase(),
          senha: credenciaisAcesso.senha?.trim() || '123',
          perfil: 'admin_loja',
          store_id: lojaId,
          nomeLoja: dados.nome,
          status: credenciaisAcesso.status || (dados.status === 'ativa' ? 'ativo' : 'inativo'),
          ultimoAcesso: new Date().toISOString()
        };
        novosUsuarios = [...usuariosSistema, novoUsuario];
      }
      setUsuariosSistema(novosUsuarios);
    } else if (dados.status) {
      const statusUser = dados.status === 'ativa' ? 'ativo' : 'inativo';
      novosUsuarios = usuariosSistema.map(u => u.store_id === lojaId ? { ...u, status: statusUser } : u);
      setUsuariosSistema(novosUsuarios);
    }
    salvarNoFirestore({ lojas: novasLojas, usuarios: novosUsuarios });
  };

  const masterAlternarStatusLoja = (lojaId: string) => {
    if (usuarioAutenticado?.perfil !== 'master') {
      toast.error('Acesso não autorizado.');
      return;
    }
    let novoStatusLoja: 'ativa' | 'inativa' = 'ativa';
    const novasLojas = lojas.map(l => {
      if (l.id === lojaId) {
        novoStatusLoja = l.status === 'ativa' ? 'inativa' : 'ativa';
        return { ...l, status: novoStatusLoja };
      }
      return l;
    });
    setLojas(novasLojas);

    const novoStatusUser = novoStatusLoja === 'ativa' ? 'ativo' : 'inativo';
    const novosUsuarios = usuariosSistema.map(u => u.store_id === lojaId ? { ...u, status: novoStatusUser } : u);
    setUsuariosSistema(novosUsuarios);
    salvarNoFirestore({ lojas: novasLojas, usuarios: novosUsuarios });
  };

  const masterCadastrarUsuario = (usuario: Omit<UsuarioAuth, 'id' | 'ultimoAcesso'>) => {
    if (usuarioAutenticado?.perfil !== 'master') {
      toast.error('Acesso não autorizado.');
      return;
    }
    const id = `USR-${Date.now().toString().slice(-4)}`;
    const novoUsuario: UsuarioAuth = {
      ...usuario,
      id,
      ultimoAcesso: new Date().toISOString()
    };
    const novos = [...usuariosSistema, novoUsuario];
    setUsuariosSistema(novos);
    salvarNoFirestore({ usuarios: novos });
  };

  const masterAtualizarUsuario = (usuarioId: string, dados: Partial<UsuarioAuth>) => {
    if (usuarioAutenticado?.perfil !== 'master') {
      toast.error('Acesso não autorizado.');
      return;
    }
    const novos = usuariosSistema.map(u => u.id === usuarioId ? { ...u, ...dados } : u);
    setUsuariosSistema(novos);
    salvarNoFirestore({ usuarios: novos });
  };

  const masterExcluirUsuario = (usuarioId: string) => {
    if (usuarioAutenticado?.perfil !== 'master') {
      toast.error('Acesso não autorizado.');
      return;
    }
    const novos = usuariosSistema.filter(u => u.id !== usuarioId);
    setUsuariosSistema(novos);
    salvarNoFirestore({ usuarios: novos });
  };

  // -------------------------------------------------------------
  // SINCRONIZAÇÃO DE USUÁRIO LEGADO (Para componentes antigos)
  // -------------------------------------------------------------
  const usuarioLogado: UsuarioLogado = {
    id: usuarioAutenticado?.id || 'USR-01',
    nome: usuarioAutenticado?.nome || 'Operador da Loja',
    email: usuarioAutenticado?.email || 'operador@turismoos.com',
    perfil: usuarioAutenticado?.perfil === 'master' ? 'administrador' : 'operador_agencia',
    agenciaVinculada: empresaConfig.agencias[0] || 'Matriz'
  };

  const alternarPerfilUsuario = (perfil: PerfilUsuario, novaAgencia?: string) => {
    // Compatibilidade mantida
  };

  const setAgenciaVinculada = (agencia: string) => {
    // Compatibilidade mantida
  };

  // -------------------------------------------------------------
  // MUTAÇÕES DE CONFIG DA EMPRESA
  // -------------------------------------------------------------
  const updateEmpresaConfig = (novaConfig: Partial<EmpresaConfig>) => {
    const novasLojas = lojas.map(l => {
      if (l.id === currentStoreId) {
        return {
          ...l,
          empresaConfig: {
            ...l.empresaConfig,
            ...novaConfig
          }
        };
      }
      return l;
    });
    setLojas(novasLojas);
    salvarNoFirestore({ lojas: novasLojas });
  };

  // -------------------------------------------------------------
  // MUTAÇÕES DE PASSEIOS (Isolados na Loja Ativa)
  // -------------------------------------------------------------
  const adicionarPasseio = (p: Omit<Passeio, 'id'>) => {
    const novoPasseio: Passeio = {
      ...p,
      id: `PAS-${Date.now().toString().slice(-4)}`,
      store_id: currentStoreId
    };
    const novas = [...todasAsPasseios, novoPasseio];
    setTodasAsPasseios(novas);
    salvarNoFirestore({ passeios: novas });
  };

  const atualizarPasseio = (id: string, dados: Partial<Passeio>) => {
    const novas = todasAsPasseios.map(p => {
      if (p.id === id && (p.store_id || 'LOJA_001') === currentStoreId) {
        return { ...p, ...dados };
      }
      return p;
    });
    setTodasAsPasseios(novas);
    salvarNoFirestore({ passeios: novas });
  };

  const excluirPasseio = (id: string) => {
    const novas = todasAsPasseios.filter(p => !(p.id === id && (p.store_id || 'LOJA_001') === currentStoreId));
    setTodasAsPasseios(novas);
    salvarNoFirestore({ passeios: novas });
  };

  // -------------------------------------------------------------
  // MUTAÇÕES DE MOTORISTAS (Isolados na Loja Ativa)
  // -------------------------------------------------------------
  const adicionarMotorista = (mot: Omit<MotoristaVeiculo, 'id'>) => {
    const novo: MotoristaVeiculo = {
      ...mot,
      id: `MOT-${Date.now().toString().slice(-4)}`,
      store_id: currentStoreId
    };
    const novas = [...todosOsMotoristas, novo];
    setTodosOsMotoristas(novas);
    salvarNoFirestore({ motoristas: novas });
  };

  const atualizarMotorista = (id: string, dados: Partial<MotoristaVeiculo>) => {
    const novas = todosOsMotoristas.map(m => {
      if (m.id === id && (m.store_id || 'LOJA_001') === currentStoreId) {
        return { ...m, ...dados };
      }
      return m;
    });
    setTodosOsMotoristas(novas);
    salvarNoFirestore({ motoristas: novas });
  };

  const excluirMotorista = (id: string) => {
    const novas = todosOsMotoristas.filter(m => !(m.id === id && (m.store_id || 'LOJA_001') === currentStoreId));
    setTodosOsMotoristas(novas);
    salvarNoFirestore({ motoristas: novas });
  };

  // -------------------------------------------------------------
  // MUTAÇÕES DE VENDEDORES (Isolados na Loja Ativa)
  // -------------------------------------------------------------
  const adicionarVendedor = (ven: Omit<PromotorVendedor, 'id'>) => {
    const novo: PromotorVendedor = {
      ...ven,
      id: `VEN-${Date.now().toString().slice(-4)}`,
      store_id: currentStoreId
    };
    const novas = [...todosOsVendedores, novo];
    setTodosOsVendedores(novas);
    salvarNoFirestore({ vendedores: novas });
  };

  const atualizarVendedor = (id: string, dados: Partial<PromotorVendedor>) => {
    const novas = todosOsVendedores.map(v => {
      if (v.id === id && (v.store_id || 'LOJA_001') === currentStoreId) {
        return { ...v, ...dados };
      }
      return v;
    });
    setTodosOsVendedores(novas);
    salvarNoFirestore({ vendedores: novas });
  };

  // -------------------------------------------------------------
  // TELEMETRIA E RASTREAMENTO (Isolados na Loja Ativa)
  // -------------------------------------------------------------
  const atualizarTelemetriaColaborador = (id: string, dados: Partial<TelemetriaColaborador>) => {
    const novas = todasAsTelemetrias.map(item => {
      if (item.id === id && (item.store_id || 'LOJA_001') === currentStoreId) {
        return {
          ...item,
          ...dados,
          ultimoPing: new Date().toISOString()
        };
      }
      return item;
    });
    setTodasAsTelemetrias(novas);
    salvarNoFirestore({ telemetria: novas });
  };

  const atualizarCoordenadasGPS = (id: string, lat: number, lng: number, nomeLocal?: string) => {
    const novas = todasAsTelemetrias.map(item => {
      if (item.id === id && (item.store_id || 'LOJA_001') === currentStoreId) {
        const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const novoLocal = nomeLocal || item.localizacaoNome;
        const historico = item.historicoPontos ? [...item.historicoPontos] : [];
        historico.push({
          hora: horaAtual,
          local: novoLocal,
          lat,
          lng
        });

        return {
          ...item,
          latitude: lat,
          longitude: lng,
          localizacaoNome: novoLocal,
          ultimoPing: new Date().toISOString(),
          historicoPontos: historico.slice(-8)
        };
      }
      return item;
    });
    setTodasAsTelemetrias(novas);
    salvarNoFirestore({ telemetria: novas });
  };

  const buscarColaboradorPorTelefone = (telefone: string): TelemetriaColaborador | undefined => {
    const digitos = telefone.replace(/\D/g, '');
    if (!digitos) return undefined;
    return telemetriaColaboradores.find(colab => {
      const colabDigitos = colab.telefone.replace(/\D/g, '');
      return colabDigitos.includes(digitos) || digitos.includes(colabDigitos);
    });
  };

  const solicitarPingCelular = async (idOuTelefone: string): Promise<{ sucesso: boolean; mensagem: string }> => {
    const digitos = idOuTelefone.replace(/\D/g, '');
    const colab = telemetriaColaboradores.find(c => 
      c.id === idOuTelefone || 
      (digitos.length >= 4 && c.telefone.replace(/\D/g, '').includes(digitos))
    );

    if (!colab) {
      return { sucesso: false, mensagem: 'Colaborador não localizado nesta loja.' };
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    const agoraIso = new Date().toISOString();

    const novas = todasAsTelemetrias.map(c => {
      if (c.id === colab.id) {
        return {
          ...c,
          ultimoPing: agoraIso,
          statusConexao: (c.latitude != null && c.longitude != null ? 'online_gps' : 'sem_sinal') as any
        };
      }
      return c;
    });
    setTodasAsTelemetrias(novas);
    salvarNoFirestore({ telemetria: novas });

    if (colab.latitude != null && colab.longitude != null) {
      return {
        sucesso: true,
        mensagem: `Sinal GPS confirmado para ${colab.nome} (${colab.localizacaoNome}).`
      };
    } else {
      return {
        sucesso: true,
        mensagem: `Sinal enviado para ${colab.nome} (${colab.telefone}). Aguardando transmissão GPS.`
      };
    }
  };

  // -------------------------------------------------------------
  // RESERVAS & VOUCHERS (Isolados na Loja Ativa)
  // -------------------------------------------------------------
  const criarReserva = (dadosReserva: Omit<Reserva, 'id' | 'codigoVoucher' | 'dataEmissao'>): Reserva => {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const codigoVoucher = `RSV-${randomCode}`;
    const id = codigoVoucher;
    const dataEmissao = new Date().toISOString();

    const novaReserva: Reserva = {
      ...dadosReserva,
      id,
      store_id: currentStoreId,
      codigoVoucher,
      dataEmissao
    };

    const novasReservas = [novaReserva, ...todasAsReservasGlobal];
    setTodasAsReservasGlobal(novasReservas);

    // Registrar entrada do Sinal no Caixa da Loja Ativa
    if (novaReserva.valorSinalPago > 0) {
      const transacaoSinal: TransacaoCaixa = {
        id: `TX-${Date.now()}`,
        store_id: currentStoreId,
        dataHora: new Date().toISOString(),
        tipo: 'entrada_sinal',
        reservaId: novaReserva.id,
        codigoVoucher: novaReserva.codigoVoucher,
        agencia: novaReserva.agenciaEmissora,
        valor: novaReserva.valorSinalPago,
        formaPagamento: novaReserva.formaPagamentoSinal,
        descricao: `Sinal recebido (${novaReserva.formaPagamentoSinal.toUpperCase()}) - ${novaReserva.clienteNome}`,
        operadorNome: novaReserva.vendedorNome || 'Atendente'
      };
      const novasTransacoes = [transacaoSinal, ...todasAsTransacoesGlobal];
      setTodasAsTransacoesGlobal(novasTransacoes);
      salvarNoFirestore({ reservas: novasReservas, transacoes: novasTransacoes });
    } else {
      salvarNoFirestore({ reservas: novasReservas });
    }

    return novaReserva;
  };

  const atualizarReserva = (id: string, dados: Partial<Reserva>) => {
    const novas = todasAsReservasGlobal.map(r => {
      if (r.id === id && (r.store_id || 'LOJA_001') === currentStoreId) {
        return { ...r, ...dados };
      }
      return r;
    });
    setTodasAsReservasGlobal(novas);
    salvarNoFirestore({ reservas: novas });
  };

  const quitarSaldoReserva = (reservaId: string, formaPagamento: FormaPagamento) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;

    const saldoAnterior = reserva.valorSaldoRestante;

    const reservaAtualizada: Reserva = {
      ...reserva,
      saldoQuitado: true,
      valorSaldoRestante: 0,
      formaPagamentoSaldo: formaPagamento,
      dataQuitacaoSaldo: new Date().toISOString(),
      statusEmbarque: 'embarcado_saldo_pago',
      status: 'embarcado'
    };

    const novasReservas = todasAsReservasGlobal.map(r => r.id === reservaId && (r.store_id || 'LOJA_001') === currentStoreId ? reservaAtualizada : r);
    setTodasAsReservasGlobal(novasReservas);

    if (saldoAnterior > 0) {
      const transacaoSaldo: TransacaoCaixa = {
        id: `TX-${Date.now()}`,
        store_id: currentStoreId,
        dataHora: new Date().toISOString(),
        tipo: 'entrada_saldo_embarque',
        reservaId: reserva.id,
        codigoVoucher: reserva.codigoVoucher,
        agencia: reserva.agenciaEmissora,
        valor: saldoAnterior,
        formaPagamento: formaPagamento,
        descricao: `Saldo de embarque recebido (${formaPagamento.toUpperCase()}) - ${reserva.clienteNome}`,
        operadorNome: reserva.motoristaNome || 'Motorista / Operador'
      };
      const novasTransacoes = [transacaoSaldo, ...todasAsTransacoesGlobal];
      setTodasAsTransacoesGlobal(novasTransacoes);
      salvarNoFirestore({ reservas: novasReservas, transacoes: novasTransacoes });
    } else {
      salvarNoFirestore({ reservas: novasReservas });
    }
  };

  const atualizarStatusEmbarque = (reservaId: string, status: StatusEmbarque, formaPagtoSaldo?: FormaPagamento) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;

    if (status === 'embarcado_saldo_pago' && !reserva.saldoQuitado) {
      quitarSaldoReserva(reservaId, formaPagtoSaldo || 'pix');
      return;
    }

    const novas = todasAsReservasGlobal.map(r => {
      if (r.id === reservaId && (r.store_id || 'LOJA_001') === currentStoreId) {
        return {
          ...r,
          statusEmbarque: status,
          horaEmbarqueEfetivo: (status.startsWith('embarcado') ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : r.horaEmbarqueEfetivo),
          status: status === 'no_show' ? 'no_show' : (status === 'cancelado_tempo' ? 'cancelada' : 'embarcado')
        };
      }
      return r;
    });
    setTodasAsReservasGlobal(novas);
    salvarNoFirestore({ reservas: novas });
  };

  const cancelarReserva = (reservaId: string, motivo?: string) => {
    const novas = todasAsReservasGlobal.map(r => {
      if (r.id === reservaId && (r.store_id || 'LOJA_001') === currentStoreId) {
        return {
          ...r,
          status: 'cancelada',
          statusEmbarque: 'cancelado_tempo',
          observacoesInternas: `${r.observacoesInternas ? r.observacoesInternas + ' | ' : ''}Cancelada: ${motivo || 'Solicitação do cliente'}`
        };
      }
      return r;
    });
    setTodasAsReservasGlobal(novas);
    salvarNoFirestore({ reservas: novas });
  };

  // -------------------------------------------------------------
  // CAIXA E COMISSÕES (Isolados na Loja Ativa)
  // -------------------------------------------------------------
  const registrarTransacaoManual = (transacao: Omit<TransacaoCaixa, 'id' | 'dataHora'>) => {
    const nova: TransacaoCaixa = {
      ...transacao,
      id: `TX-${Date.now()}`,
      store_id: currentStoreId,
      dataHora: new Date().toISOString()
    };
    const novas = [nova, ...todasAsTransacoesGlobal];
    setTodasAsTransacoesGlobal(novas);
    salvarNoFirestore({ transacoes: novas });
  };

  const pagarComissaoVendedor = (reservaId: string) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva || reserva.comissaoPaga || reserva.comissaoValor <= 0) return;

    const novasReservas = todasAsReservasGlobal.map(r => r.id === reservaId && (r.store_id || 'LOJA_001') === currentStoreId ? { ...r, comissaoPaga: true } : r);
    setTodasAsReservasGlobal(novasReservas);

    const transacaoComissao: TransacaoCaixa = {
      id: `TX-${Date.now()}`,
      store_id: currentStoreId,
      dataHora: new Date().toISOString(),
      tipo: 'saida_comissao',
      reservaId: reserva.id,
      codigoVoucher: reserva.codigoVoucher,
      agencia: reserva.agenciaEmissora,
      valor: reserva.comissaoValor,
      formaPagamento: 'pix',
      descricao: `Comissão paga a ${reserva.vendedorNome || 'Promotor'} - Voucher #${reserva.codigoVoucher}`,
      operadorNome: 'Gestor Financeiro'
    };
    const novasTransacoes = [transacaoComissao, ...todasAsTransacoesGlobal];
    setTodasAsTransacoesGlobal(novasTransacoes);
    salvarNoFirestore({ reservas: novasReservas, transacoes: novasTransacoes });
  };

  // -------------------------------------------------------------
  // TÁBUA DE MARÉS
  // -------------------------------------------------------------
  const salvarRegistroMare = (registro: RegistroMare) => {
    let novoArray: RegistroMare[] = [];
    const idx = tabuaMares.findIndex(m => m.data === registro.data);
    if (idx >= 0) {
      novoArray = [...tabuaMares];
      novoArray[idx] = registro;
    } else {
      novoArray = [...tabuaMares, registro].sort((a, b) => a.data.localeCompare(b.data));
    }
    setTabuaMares(novoArray);
    salvarNoFirestore({ tabuaMares: novoArray });
  };

  const getMareDoDia = (dataYmd: string): RegistroMare | undefined => {
    return tabuaMares.find(m => m.data === dataYmd);
  };

  // -------------------------------------------------------------
  // MODAIS DE VOUCHER E RELATÓRIO
  // -------------------------------------------------------------
  const abrirVoucherModal = (reserva: Reserva, tipo: 'a4' | 'termico') => {
    setSelectedVoucher(reserva);
    setVoucherModalType(tipo);
  };

  const fecharVoucherModal = () => {
    setSelectedVoucher(null);
    setVoucherModalType(null);
  };

  const abrirRelatorioPdfModal = (config: RelatorioPdfConfig) => {
    setRelatorioAtivoModal(config);
  };

  const fecharRelatorioPdfModal = () => {
    setRelatorioAtivoModal(null);
  };

  // -------------------------------------------------------------
  // BACKUP & RESTAURAÇÃO
  // -------------------------------------------------------------
  const exportarBackupCompleto = () => {
    const backupData = {
      versao: '3.0',
      dataExportacao: new Date().toISOString(),
      lojas,
      usuariosSistema,
      passeios: todasAsPasseios,
      motoristas: todosOsMotoristas,
      vendedores: todosOsVendedores,
      telemetriaColaboradores: todasAsTelemetrias,
      tabuaMares,
      reservas: todasAsReservasGlobal,
      transacoesCaixa: todasAsTransacoesGlobal,
      fechamentosCaixa: todosOsFechamentos
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_turismo_os_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importarBackupCompleto = (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      const payloadToSave: any = {};
      if (data.lojas) { setLojas(data.lojas); payloadToSave.lojas = data.lojas; }
      if (data.usuariosSistema) { setUsuariosSistema(data.usuariosSistema); payloadToSave.usuarios = data.usuariosSistema; }
      if (data.passeios) { setTodasAsPasseios(data.passeios); payloadToSave.passeios = data.passeios; }
      if (data.motoristas) { setTodosOsMotoristas(data.motoristas); payloadToSave.motoristas = data.motoristas; }
      if (data.vendedores) { setTodosOsVendedores(data.vendedores); payloadToSave.vendedores = data.vendedores; }
      if (data.telemetriaColaboradores) { setTodasAsTelemetrias(data.telemetriaColaboradores); payloadToSave.telemetria = data.telemetriaColaboradores; }
      if (data.tabuaMares) { setTabuaMares(data.tabuaMares); payloadToSave.tabuaMares = data.tabuaMares; }
      if (data.reservas) { setTodasAsReservasGlobal(data.reservas); payloadToSave.reservas = data.reservas; }
      if (data.transacoesCaixa) { setTodasAsTransacoesGlobal(data.transacoesCaixa); payloadToSave.transacoes = data.transacoesCaixa; }
      if (data.fechamentosCaixa) { setTodosOsFechamentos(data.fechamentosCaixa); payloadToSave.fechamentos = data.fechamentosCaixa; }
      salvarNoFirestore(payloadToSave);
      return true;
    } catch (e) {
      console.error('Erro ao importar backup:', e);
      return false;
    }
  };

  const restaurarDadosPadrao = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração iniciais? As alterações locais serão substituídas.')) {
      const resetLojas = initialLojas;
      const resetUsers = initialUsuariosAuth;
      const resetPasseios = [...initialPasseios.map(p => ({ ...p, store_id: 'LOJA_001' })), ...initialPasseiosLoja2];
      const resetMotoristas = [...initialMotoristas.map(m => ({ ...m, store_id: 'LOJA_001' })), ...initialMotoristasLoja2];
      const resetVendedores = [...initialVendedores.map(v => ({ ...v, store_id: 'LOJA_001' })), ...initialVendedoresLoja2];
      const resetTelemetria = initialTelemetriaColaboradores.map(t => ({ ...t, store_id: 'LOJA_001' }));
      const resetMares = initialTabuaMares;
      const resetReservas = [...initialReservas.map(r => ({ ...r, store_id: 'LOJA_001' })), ...initialReservasLoja2];

      setLojas(resetLojas);
      setUsuariosSistema(resetUsers);
      setTodasAsPasseios(resetPasseios);
      setTodosOsMotoristas(resetMotoristas);
      setTodosOsVendedores(resetVendedores);
      setTodasAsTelemetrias(resetTelemetria);
      setTabuaMares(resetMares);
      setTodasAsReservasGlobal(resetReservas);
      setTodasAsTransacoesGlobal(initialTransacoesLoja2);
      setTodosOsFechamentos([]);

      salvarNoFirestore({
        lojas: resetLojas,
        usuarios: resetUsers,
        passeios: resetPasseios,
        motoristas: resetMotoristas,
        vendedores: resetVendedores,
        telemetria: resetTelemetria,
        tabuaMares: resetMares,
        reservas: resetReservas,
        transacoes: initialTransacoesLoja2,
        fechamentos: []
      });

      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <TurismoContext.Provider
      value={{
        syncStatus,
        ultimoSync,
        forcarSincronizacao,
        usuarioAutenticado,
        lojas,
        usuariosSistema,
        lojaAtivaId,
        lojaAtiva,
        fazerLogin,
        fazerLoginMaster,
        fazerLoginLoja,
        fazerLogout,
        masterAcessarLoja,
        masterVoltarAoPainel,
        masterCadastrarLoja,
        masterAtualizarLoja,
        masterAlternarStatusLoja,
        masterCadastrarUsuario,
        masterAtualizarUsuario,
        masterExcluirUsuario,
        todasAsReservasGlobal,
        todasAsTransacoesGlobal,
        usuarioLogado,
        alternarPerfilUsuario,
        setAgenciaVinculada,
        empresaConfig,
        updateEmpresaConfig,
        agenciaAtiva,
        setAgenciaAtiva,
        activeTab,
        setActiveTab,
        selectedVoucher,
        voucherModalType,
        abrirVoucherModal,
        fecharVoucherModal,
        relatorioAtivoModal,
        abrirRelatorioPdfModal,
        fecharRelatorioPdfModal,
        passeios,
        adicionarPasseio,
        atualizarPasseio,
        excluirPasseio,
        motoristas,
        adicionarMotorista,
        atualizarMotorista,
        excluirMotorista,
        vendedores,
        adicionarVendedor,
        atualizarVendedor,
        telemetriaColaboradores,
        atualizarTelemetriaColaborador,
        solicitarPingCelular,
        atualizarCoordenadasGPS,
        buscarColaboradorPorTelefone,
        reservas,
        criarReserva,
        atualizarReserva,
        quitarSaldoReserva,
        atualizarStatusEmbarque,
        cancelarReserva,
        tabuaMares,
        salvarRegistroMare,
        getMareDoDia,
        transacoesCaixa,
        fechamentosCaixa,
        registrarTransacaoManual,
        pagarComissaoVendedor,
        exportarBackupCompleto,
        importarBackupCompleto,
        restaurarDadosPadrao
      }}
    >
      {children}
    </TurismoContext.Provider>
  );
};

export const useTurismo = () => {
  const context = useContext(TurismoContext);
  if (!context) {
    throw new Error('useTurismo deve ser usado dentro de um TurismoProvider');
  }
  return context;
};
