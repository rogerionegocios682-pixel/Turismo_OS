import React, { useState } from 'react';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Compass, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  KeyRound,
  Building2,
  ChevronLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginView: React.FC = () => {
  const { fazerLoginLoja, fazerLoginMaster } = useTurismo();

  // Tipo de login: 'loja' (padrão para operadores) ou 'master' (administrativo)
  const [modoLogin, setModoLogin] = useState<'loja' | 'master'>('loja');

  // Campos do Login de Loja
  const [lojaUsuario, setLojaUsuario] = useState('');
  const [lojaSenha, setLojaSenha] = useState('');
  const [mostrarSenhaLoja, setMostrarSenhaLoja] = useState(false);

  // Campos do Login Master
  const [masterEmail, setMasterEmail] = useState('');
  const [masterSenha, setMasterSenha] = useState('');
  const [mostrarSenhaMaster, setMostrarSenhaMaster] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Submissão do Login de Loja
  const handleLoginLoja = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg(null);

    const usuarioLimpo = lojaUsuario.trim();
    const senhaLimpa = lojaSenha.trim();

    if (!usuarioLimpo) {
      setErroMsg('Por favor, informe seu usuário ou e-mail da loja.');
      return;
    }

    if (!senhaLimpa) {
      setErroMsg('Por favor, informe a senha de acesso.');
      return;
    }

    setCarregando(true);
    try {
      const res = await Promise.resolve(fazerLoginLoja(usuarioLimpo, senhaLimpa));
      setCarregando(false);

      if (!res.sucesso) {
        setErroMsg(res.mensagem || 'Usuário ou senha incorretos.');
        toast.error(res.mensagem || 'Acesso negado.');
      } else {
        toast.success('Login realizado com sucesso! Acessando a loja.', { icon: '🔓' });
      }
    } catch (err: any) {
      setCarregando(false);
      setErroMsg(err?.message || 'Erro ao conectar ao servidor central.');
    }
  };

  // Submissão do Login Master
  const handleLoginMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg(null);

    const emailLimpo = masterEmail.trim();
    const senhaLimpa = masterSenha.trim();

    if (!emailLimpo) {
      setErroMsg('Por favor, informe o e-mail do Master.');
      return;
    }

    if (!senhaLimpa) {
      setErroMsg('Por favor, informe a senha do Master.');
      return;
    }

    setCarregando(true);
    try {
      const res = await Promise.resolve(fazerLoginMaster(emailLimpo, senhaLimpa));
      setCarregando(false);

      if (!res.sucesso) {
        setErroMsg(res.mensagem || 'Acesso não autorizado.');
        toast.error(res.mensagem || 'Acesso não autorizado.');
      } else {
        toast.success('Acesso Master autorizado! Carregando Painel Central.', { icon: '👑' });
      }
    } catch (err: any) {
      setCarregando(false);
      setErroMsg(err?.message || 'Erro ao conectar ao servidor central.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 selection:bg-blue-600 selection:text-white relative">
      {/* Background Decorativo Suave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logomarca & Cabeçalho do Sistema */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-600/30 border border-white/10 mb-2">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            TurismoOS <span className="text-blue-400 font-medium">Gestão Integrada</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Plataforma de Gestão Operacional e Financeira de Passeios & Receptivos
          </p>
        </div>

        {/* Card de Autenticação */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-5">
          
          {modoLogin === 'loja' ? (
            /* ========================================================
               1. LOGIN DE LOJA (VISÃO PADRÃO PARA OPERADORES)
               ======================================================== */
            <>
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Acesso da Loja
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informe o usuário e senha da sua unidade para acessar o sistema
                </p>
              </div>

              {/* Mensagem de Erro */}
              {erroMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{erroMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginLoja} className="space-y-4">
                {/* Campo Usuário / E-mail da Loja */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Usuário ou E-mail
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={lojaUsuario}
                      onChange={(e) => setLojaUsuario(e.target.value)}
                      placeholder="Identificação do operador ou loja"
                      autoComplete="username"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={mostrarSenhaLoja ? 'text' : 'password'}
                      value={lojaSenha}
                      onChange={(e) => setLojaSenha(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenhaLoja(!mostrarSenhaLoja)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={mostrarSenhaLoja ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {mostrarSenhaLoja ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botão Entrar na Loja */}
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {carregando ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Autenticando...</span>
                    </span>
                  ) : (
                    <>
                      <span>Entrar no Sistema</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ========================================================
               2. LOGIN MASTER SEPARADO (ACESSO ADMINISTRATIVO)
               ======================================================== */
            <>
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-base">👑</span>
                    Acesso Master
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setModoLogin('loja');
                      setErroMsg(null);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Voltar à Loja</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Autenticação restrita ao administrador central da plataforma
                </p>
              </div>

              {/* Mensagem de Erro Master */}
              {erroMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{erroMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginMaster} className="space-y-4">
                {/* Campo E-mail do MASTER */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    E-mail do Master
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={masterEmail}
                      onChange={(e) => setMasterEmail(e.target.value)}
                      placeholder="rogerionegocios682@gmail.com"
                      autoComplete="username"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* Campo Senha do MASTER */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Senha do Master
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={mostrarSenhaMaster ? 'text' : 'password'}
                      value={masterSenha}
                      onChange={(e) => setMasterSenha(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-2xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenhaMaster(!mostrarSenhaMaster)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={mostrarSenhaMaster ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {mostrarSenhaMaster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botão Entrar no Painel Master */}
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-slate-900/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 border border-amber-500/20"
                >
                  {carregando ? (
                    <span className="flex items-center gap-2 text-white">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Autenticando Master...</span>
                    </span>
                  ) : (
                    <>
                      <span>Entrar no Painel Master</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>

        {/* Rodapé e Alternador Discreto de Modo */}
        <div className="flex flex-col items-center gap-3">
          {modoLogin === 'loja' ? (
            <button
              type="button"
              onClick={() => {
                setModoLogin('master');
                setErroMsg(null);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Acesso Administrativo Central</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setModoLogin('loja');
                setErroMsg(null);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Voltar ao Acesso da Loja</span>
            </button>
          )}

          <div className="text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Isolamento Total de Dados &bull; Multi-Tenant Seguro</span>
          </div>
        </div>

      </div>
    </div>
  );
};
