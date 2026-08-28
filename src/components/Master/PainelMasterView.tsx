import React, { useState } from 'react';
import { useTurismo } from '../../context/TurismoContext';
import { Loja, UsuarioAuth } from '../../types';
import { 
  Store, 
  Plus, 
  ExternalLink, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  Power, 
  Edit3, 
  Search, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  KeyRound,
  Trash2,
  TrendingUp,
  DollarSign,
  Ticket,
  User,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PainelMasterView: React.FC = () => {
  const { 
    lojas, 
    usuariosSistema, 
    masterAcessarLoja, 
    masterCadastrarLoja, 
    masterAtualizarLoja, 
    masterAlternarStatusLoja,
    masterCadastrarUsuario,
    masterAtualizarUsuario,
    masterExcluirUsuario,
    fazerLogout,
    todasAsReservasGlobal,
    todasAsTransacoesGlobal
  } = useTurismo();

  const [abaAtiva, setAbaAtiva] = useState<'lojas' | 'usuarios' | 'relatorio_global'>('lojas');
  const [buscaTermo, setBuscaTermo] = useState('');

  // Modais de Criação / Edição de Loja
  const [modalNovaLojaAberto, setModalNovaLojaAberto] = useState(false);
  const [modalEditarLojaAberto, setModalEditarLojaAberto] = useState<Loja | null>(null);

  // Modais de Criação / Edição de Usuário
  const [modalNovoUsuarioAberto, setModalNovoUsuarioAberto] = useState(false);

  // Estados de formulário de Nova Loja
  const [nomeLoja, setNomeLoja] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpjLoja, setCnpjLoja] = useState('');
  const [cidadeLoja, setCidadeLoja] = useState('');
  const [telefoneLoja, setTelefoneLoja] = useState('');
  const [emailLoja, setEmailLoja] = useState('');
  const [emailAcessoNovaLoja, setEmailAcessoNovaLoja] = useState('');
  const [senhaNovaLoja, setSenhaNovaLoja] = useState('');
  const [confirmarSenhaNovaLoja, setConfirmarSenhaNovaLoja] = useState('');
  const [statusAcessoNovaLoja, setStatusAcessoNovaLoja] = useState<'ativo' | 'inativo'>('ativo');
  const [mostrarSenhaNovaLoja, setMostrarSenhaNovaLoja] = useState(false);

  // Estados de formulário de Edição de Loja & Acesso
  const [edicaoEmailAcesso, setEdicaoEmailAcesso] = useState('');
  const [edicaoSenhaAcesso, setEdicaoSenhaAcesso] = useState('');
  const [edicaoConfirmarSenha, setEdicaoConfirmarSenha] = useState('');
  const [edicaoStatusAcesso, setEdicaoStatusAcesso] = useState<'ativo' | 'inativo'>('ativo');
  const [mostrarSenhaEdicao, setMostrarSenhaEdicao] = useState(false);

  // Estados de formulário de Novo Usuário
  const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
  const [novoUsuarioEmail, setNovoUsuarioEmail] = useState('');
  const [novoUsuarioLogin, setNovoUsuarioLogin] = useState('');
  const [novoUsuarioSenha, setNovoUsuarioSenha] = useState('123');
  const [novoUsuarioLojaId, setNovoUsuarioLojaId] = useState('LOJA_001');
  const [novoUsuarioPerfil, setNovoUsuarioPerfil] = useState<'admin_loja' | 'operador_loja'>('admin_loja');

  // Filtragem de Lojas
  const lojasFiltradas = lojas.filter(loja => 
    loja.nome.toLowerCase().includes(buscaTermo.toLowerCase()) ||
    loja.cnpj.includes(buscaTermo) ||
    loja.cidade.toLowerCase().includes(buscaTermo.toLowerCase())
  );

  // Abrir Modal de Edição de Loja
  const abrirModalEdicaoLoja = (loja: Loja) => {
    const usuarioVinculado = usuariosSistema.find(u => u.store_id === loja.id && u.perfil !== 'master');
    setModalEditarLojaAberto(loja);
    setEdicaoEmailAcesso(usuarioVinculado?.email || loja.email || '');
    setEdicaoSenhaAcesso('');
    setEdicaoConfirmarSenha('');
    setEdicaoStatusAcesso(loja.status === 'ativa' ? 'ativo' : 'inativo');
    setMostrarSenhaEdicao(false);
  };

  // Handlers de Loja
  const handleSalvarNovaLoja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeLoja.trim()) {
      toast.error('Informe o nome da loja.');
      return;
    }

    if (senhaNovaLoja.trim() || confirmarSenhaNovaLoja.trim()) {
      if (senhaNovaLoja.trim() !== confirmarSenhaNovaLoja.trim()) {
        toast.error('A senha e a confirmação de senha não conferem.');
        return;
      }
    }

    const emailAcessoFinal = emailAcessoNovaLoja.trim() || emailLoja.trim() || 'loja@turismoos.com';
    const statusLoja: 'ativa' | 'inativa' = statusAcessoNovaLoja === 'ativo' ? 'ativa' : 'inativa';

    masterCadastrarLoja({
      nome: nomeLoja.trim(),
      razaoSocial: razaoSocial.trim() || nomeLoja.trim(),
      cnpj: cnpjLoja.trim() || '00.000.000/0001-00',
      cidade: cidadeLoja.trim() || 'Porto de Galinhas / PE',
      telefone: telefoneLoja.trim() || '(81) 90000-0000',
      email: emailLoja.trim() || emailAcessoFinal,
      status: statusLoja,
      empresaConfig: {
        nomeFantasia: nomeLoja.trim(),
        razaoSocial: razaoSocial.trim() || nomeLoja.trim(),
        cnpj: cnpjLoja.trim() || '00.000.000/0001-00',
        cadastur: '16.000000.10.0001-0',
        telefoneWhatsapp: telefoneLoja.trim() || '(81) 90000-0000',
        emailContato: emailLoja.trim() || emailAcessoFinal,
        enderecoCompleto: `Centro - ${cidadeLoja.trim() || 'PE'}`,
        cidadeBase: cidadeLoja.trim() || 'PE',
        chavePixTipo: 'cnpj',
        chavePix: cnpjLoja.trim() || '00.000.000/0001-00',
        nomeTitularPix: nomeLoja.trim(),
        logoBase64: '',
        percentualSinalPadrao: 30,
        politicaCancelamento: 'Cancelamento gratuito até 24h antes do passeio.',
        termosVoucher: 'Apresente o voucher no momento do embarque.',
        agencias: ['Matriz Central']
      }
    }, {
      email: emailAcessoFinal,
      senha: senhaNovaLoja.trim() || '123',
      status: statusAcessoNovaLoja
    });

    toast.success(`Loja "${nomeLoja}" cadastrada com acesso ativado!`);
    setNomeLoja('');
    setRazaoSocial('');
    setCnpjLoja('');
    setCidadeLoja('');
    setTelefoneLoja('');
    setEmailLoja('');
    setEmailAcessoNovaLoja('');
    setSenhaNovaLoja('');
    setConfirmarSenhaNovaLoja('');
    setStatusAcessoNovaLoja('ativo');
    setModalNovaLojaAberto(false);
  };

  const handleSalvarEdicaoLoja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarLojaAberto) return;

    if (edicaoSenhaAcesso.trim() || edicaoConfirmarSenha.trim()) {
      if (edicaoSenhaAcesso.trim() !== edicaoConfirmarSenha.trim()) {
        toast.error('A senha e a confirmação de senha não coincidem.');
        return;
      }
    }

    const novoStatusLoja: 'ativa' | 'inativa' = edicaoStatusAcesso === 'ativo' ? 'ativa' : 'inativa';

    masterAtualizarLoja(
      modalEditarLojaAberto.id,
      {
        nome: modalEditarLojaAberto.nome,
        razaoSocial: modalEditarLojaAberto.razaoSocial,
        cnpj: modalEditarLojaAberto.cnpj,
        cidade: modalEditarLojaAberto.cidade,
        telefone: modalEditarLojaAberto.telefone,
        email: modalEditarLojaAberto.email,
        status: novoStatusLoja
      },
      {
        email: edicaoEmailAcesso.trim() || modalEditarLojaAberto.email,
        senha: edicaoSenhaAcesso.trim() ? edicaoSenhaAcesso.trim() : undefined,
        status: edicaoStatusAcesso
      }
    );

    toast.success('Loja e credenciais de acesso salvas com sucesso!');
    setModalEditarLojaAberto(null);
  };

  // Handlers de Usuário
  const handleSalvarNovoUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuarioNome.trim() || !novoUsuarioLogin.trim()) {
      toast.error('Preencha os campos obrigatórios do usuário.');
      return;
    }

    const lojaAssociada = lojas.find(l => l.id === novoUsuarioLojaId);

    masterCadastrarUsuario({
      nome: novoUsuarioNome.trim(),
      email: novoUsuarioEmail.trim() || `${novoUsuarioLogin.trim()}@turismoos.com`,
      usuarioLogin: novoUsuarioLogin.trim().toLowerCase(),
      senha: novoUsuarioSenha.trim() || '123',
      perfil: novoUsuarioPerfil,
      store_id: novoUsuarioLojaId,
      nomeLoja: lojaAssociada?.nome || 'Loja Vinculada',
      status: 'ativo'
    });

    toast.success(`Usuário "${novoUsuarioLogin}" criado para ${lojaAssociada?.nome}!`);
    setNovoUsuarioNome('');
    setNovoUsuarioEmail('');
    setNovoUsuarioLogin('');
    setNovoUsuarioSenha('123');
    setModalNovoUsuarioAberto(false);
  };

  // Métricas Consolidadas do Master
  const totalLojas = lojas.length;
  const lojasAtivas = lojas.filter(l => l.status === 'ativa').length;
  const totalReservasGlobal = todasAsReservasGlobal.length;
  const totalFaturamentoGlobal = todasAsReservasGlobal.reduce((acc, r) => acc + (r.valorTotal || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header Superior Exclusivo do Painel MASTER */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg text-white tracking-tight">
                  PAINEL MASTER <span className="text-amber-400 text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Super Admin</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Gestão Centralizada de Todas as Lojas e Usuários da Rede
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fazerLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair do Master</span>
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Navegação Interna do Master */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-2">
          <button
            onClick={() => setAbaAtiva('lojas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              abaAtiva === 'lojas'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Todas as Lojas ({totalLojas})</span>
          </button>

          <button
            onClick={() => setAbaAtiva('usuarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              abaAtiva === 'usuarios'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gerenciamento de Usuários ({usuariosSistema.length})</span>
          </button>

          <button
            onClick={() => setAbaAtiva('relatorio_global')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              abaAtiva === 'relatorio_global'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Relatório Global Consolidado</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* Banner de Resumo Master */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Lojas Cadastradas</span>
              <h3 className="text-2xl font-black text-white mt-1">{totalLojas}</h3>
              <span className="text-[11px] text-emerald-400 font-semibold">{lojasAtivas} ativas no momento</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400">
              <Store className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total de Usuários</span>
              <h3 className="text-2xl font-black text-white mt-1">{usuariosSistema.length}</h3>
              <span className="text-[11px] text-blue-400 font-semibold">Credenciais ativas</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Reservas na Rede</span>
              <h3 className="text-2xl font-black text-white mt-1">{totalReservasGlobal}</h3>
              <span className="text-[11px] text-cyan-400 font-semibold">Total histórico</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-600/10 border border-cyan-600/20 flex items-center justify-center text-cyan-400">
              <Ticket className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Faturamento da Rede</span>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">
                R$ {totalFaturamentoGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">Soma de todas as lojas</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ABA 1: TODAS AS LOJAS */}
        {abaAtiva === 'lojas' && (
          <div className="space-y-4">
            
            {/* Barra de Ações & Busca */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={buscaTermo}
                  onChange={(e) => setBuscaTermo(e.target.value)}
                  placeholder="Buscar loja por nome, CNPJ ou cidade..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setModalNovaLojaAberto(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Nova Loja</span>
              </button>
            </div>

            {/* Grid / Lista de Lojas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lojasFiltradas.map((loja) => {
                const reservasLoja = todasAsReservasGlobal.filter(r => (r.store_id || 'LOJA_001') === loja.id);
                const faturamentoLoja = reservasLoja.reduce((acc, r) => acc + (r.valorTotal || 0), 0);
                const usuariosLoja = usuariosSistema.filter(u => u.store_id === loja.id);

                return (
                  <div
                    key={loja.id}
                    className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between ${
                      loja.status === 'ativa' 
                        ? 'border-slate-800 hover:border-slate-700' 
                        : 'border-red-900/40 bg-slate-900/60 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Header do Card da Loja */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            loja.status === 'ativa' 
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-red-600/20 text-red-400 border border-red-500/30'
                          }`}>
                            <Store className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-base text-white">{loja.nome}</h3>
                              <span className="text-[10px] text-slate-400 font-mono">({loja.id})</span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{loja.cidade}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => masterAlternarStatusLoja(loja.id)}
                            title={loja.status === 'ativa' ? 'Clique para desativar' : 'Clique para ativar'}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all border ${
                              loja.status === 'ativa'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{loja.status === 'ativa' ? 'ATIVA' : 'INATIVA'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Dados da Loja */}
                      <div className="bg-slate-950/60 rounded-xl p-3 text-xs space-y-1.5 border border-slate-800/80">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">CNPJ:</span>
                          <span className="font-mono font-medium">{loja.cnpj}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">Telefone:</span>
                          <span>{loja.telefone}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">Reservas / Vendas:</span>
                          <span className="font-bold text-white">{reservasLoja.length} reservas (R$ {faturamentoLoja.toLocaleString('pt-BR')})</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">Usuários Vinculados:</span>
                          <span className="text-blue-400 font-semibold">{usuariosLoja.length} operador(es)</span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação do Card */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirModalEdicaoLoja(loja)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      </div>

                      {/* BOTÃO PRINCIPAL: ACESSAR LOJA */}
                      <button
                        onClick={() => masterAcessarLoja(loja.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
                      >
                        <span>ACESSAR LOJA</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ABA 2: GERENCIAMENTO DE USUÁRIOS */}
        {abaAtiva === 'usuarios' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Usuários & Acessos por Loja</h3>
                <p className="text-xs text-slate-400">Cada usuário acessa exclusivamente sua loja vinculada</p>
              </div>

              <button
                onClick={() => setModalNovoUsuarioAberto(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Usuário</span>
              </button>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Nome / Login</th>
                      <th className="p-3.5">E-mail</th>
                      <th className="p-3.5">Loja Vinculada (store_id)</th>
                      <th className="p-3.5">Perfil</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usuariosSistema.map((user) => {
                      const isMaster = user.perfil === 'master';
                      return (
                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white flex items-center gap-2">
                              {isMaster ? <span>👑</span> : <User className="w-3.5 h-3.5 text-blue-400" />}
                              <span>{user.nome}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">@{user.usuarioLogin}</span>
                          </td>
                          <td className="p-3.5 text-slate-300">{user.email}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isMaster ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {user.store_id === 'ALL' ? 'Todas as Lojas (Master)' : `${user.nomeLoja || user.store_id}`}
                            </span>
                          </td>
                          <td className="p-3.5 capitalize text-slate-300 font-medium">{user.perfil.replace('_', ' ')}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.status === 'ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {user.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            {!isMaster && (
                              <button
                                onClick={() => masterExcluirUsuario(user.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Usuário"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ABA 3: RELATÓRIO GLOBAL CONSOLIDADO */}
        {abaAtiva === 'relatorio_global' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Desempenho Consolidado por Loja
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lojas.map(loja => {
                  const reservasDaLoja = todasAsReservasGlobal.filter(r => (r.store_id || 'LOJA_001') === loja.id);
                  const totalFat = reservasDaLoja.reduce((acc, r) => acc + (r.valorTotal || 0), 0);
                  const paxTotal = reservasDaLoja.reduce((acc, r) => acc + (r.totalPax || 0), 0);

                  return (
                    <div key={loja.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <strong className="text-white font-bold text-sm">{loja.nome}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          loja.status === 'ativa' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {loja.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{loja.cidade}</p>
                      
                      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Reservas</span>
                          <span className="font-bold text-white">{reservasDaLoja.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Passageiros</span>
                          <span className="font-bold text-white">{paxTotal} PAX</span>
                        </div>
                        <div className="col-span-2 pt-1">
                          <span className="text-slate-500 block text-[10px]">Faturamento Bruto</span>
                          <span className="font-black text-emerald-400 text-sm">
                            R$ {totalFat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => masterAcessarLoja(loja.id)}
                        className="w-full mt-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Entrar no Painel desta Loja</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: CADASTRAR NOVA LOJA */}
      {modalNovaLojaAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-400" />
                Cadastrar Nova Loja
              </h3>
              <button
                onClick={() => setModalNovaLojaAberto(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarNovaLoja} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nome Fantasia da Loja *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Porto Exclusive Receptivo - Filial 02"
                  value={nomeLoja}
                  onChange={(e) => setNomeLoja(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cnpjLoja}
                    onChange={(e) => setCnpjLoja(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Cidade / Base *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maragogi - AL"
                    value={cidadeLoja}
                    onChange={(e) => setCidadeLoja(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(81) 99999-9999"
                    value={telefoneLoja}
                    onChange={(e) => setTelefoneLoja(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">E-mail de Contato</label>
                  <input
                    type="email"
                    placeholder="reservas@loja.com"
                    value={emailLoja}
                    onChange={(e) => setEmailLoja(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* SEÇÃO: ACESSO À ÁREA DO CLIENTE */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    Acesso à Área do Cliente
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                    <div className="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setStatusAcessoNovaLoja('ativo')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          statusAcessoNovaLoja === 'ativo'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        ● Ativo
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusAcessoNovaLoja('inativo')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          statusAcessoNovaLoja === 'inativo'
                            ? 'bg-red-600 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        ○ Inativo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">E-mail de Acesso (Login do Cliente)</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder={emailLoja ? emailLoja : "loja@turismoos.com"}
                      value={emailAcessoNovaLoja}
                      onChange={(e) => setEmailAcessoNovaLoja(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Senha de Acesso</label>
                      <button
                        type="button"
                        onClick={() => setMostrarSenhaNovaLoja(!mostrarSenhaNovaLoja)}
                        className="text-[10px] text-slate-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                      >
                        {mostrarSenhaNovaLoja ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{mostrarSenhaNovaLoja ? 'Ocultar' : 'Ver'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={mostrarSenhaNovaLoja ? 'text' : 'password'}
                        placeholder="•••••••• (padrão: 123)"
                        value={senhaNovaLoja}
                        onChange={(e) => setSenhaNovaLoja(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={mostrarSenhaNovaLoja ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmarSenhaNovaLoja}
                        onChange={(e) => setConfirmarSenhaNovaLoja(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovaLojaAberto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  Salvar Loja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR LOJA */}
      {modalEditarLojaAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                Editar Loja ({modalEditarLojaAberto.id})
              </h3>
              <button
                onClick={() => setModalEditarLojaAberto(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicaoLoja} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nome da Loja</label>
                <input
                  type="text"
                  required
                  value={modalEditarLojaAberto.nome}
                  onChange={(e) => setModalEditarLojaAberto({ ...modalEditarLojaAberto, nome: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">CNPJ</label>
                  <input
                    type="text"
                    value={modalEditarLojaAberto.cnpj}
                    onChange={(e) => setModalEditarLojaAberto({ ...modalEditarLojaAberto, cnpj: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Cidade / Base</label>
                  <input
                    type="text"
                    value={modalEditarLojaAberto.cidade}
                    onChange={(e) => setModalEditarLojaAberto({ ...modalEditarLojaAberto, cidade: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Telefone</label>
                  <input
                    type="text"
                    value={modalEditarLojaAberto.telefone}
                    onChange={(e) => setModalEditarLojaAberto({ ...modalEditarLojaAberto, telefone: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">E-mail</label>
                  <input
                    type="email"
                    value={modalEditarLojaAberto.email}
                    onChange={(e) => setModalEditarLojaAberto({ ...modalEditarLojaAberto, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* SEÇÃO: ACESSO À ÁREA DO CLIENTE */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    Acesso à Área do Cliente
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                    <div className="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEdicaoStatusAcesso('ativo')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          edicaoStatusAcesso === 'ativo'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        ● Ativo
                      </button>
                      <button
                        type="button"
                        onClick={() => setEdicaoStatusAcesso('inativo')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          edicaoStatusAcesso === 'inativo'
                            ? 'bg-red-600 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        ○ Inativo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">E-mail de Acesso (Login do Cliente) *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="passeios@gmail.com"
                      value={edicaoEmailAcesso}
                      onChange={(e) => setEdicaoEmailAcesso(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Nova Senha</label>
                      <button
                        type="button"
                        onClick={() => setMostrarSenhaEdicao(!mostrarSenhaEdicao)}
                        className="text-[10px] text-slate-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                      >
                        {mostrarSenhaEdicao ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{mostrarSenhaEdicao ? 'Ocultar' : 'Ver'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={mostrarSenhaEdicao ? 'text' : 'password'}
                        placeholder="•••••••• (vazio = manter)"
                        value={edicaoSenhaAcesso}
                        onChange={(e) => setEdicaoSenhaAcesso(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={mostrarSenhaEdicao ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={edicaoConfirmarSenha}
                        onChange={(e) => setEdicaoConfirmarSenha(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalEditarLojaAberto(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR NOVO USUÁRIO */}
      {modalNovoUsuarioAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Criar Usuário para Loja
              </h3>
              <button
                onClick={() => setModalNovoUsuarioAberto(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarNovoUsuario} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={novoUsuarioNome}
                  onChange={(e) => setNovoUsuarioNome(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Loja Vinculada (Isolamento de Dados) *</label>
                <select
                  value={novoUsuarioLojaId}
                  onChange={(e) => setNovoUsuarioLojaId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {lojas.map(loja => (
                    <option key={loja.id} value={loja.id}>
                      {loja.nome} ({loja.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Login de Acesso *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: joao"
                    value={novoUsuarioLogin}
                    onChange={(e) => setNovoUsuarioLogin(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Senha Inicial *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={novoUsuarioSenha}
                    onChange={(e) => setNovoUsuarioSenha(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">E-mail</label>
                <input
                  type="email"
                  placeholder="joao@loja.com"
                  value={novoUsuarioEmail}
                  onChange={(e) => setNovoUsuarioEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoUsuarioAberto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
