import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { formatarMoeda } from '../../utils/formatters';
import {
  User,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  Trophy,
  Filter,
  Phone,
  Store,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Calendar,
  KeyRound
} from 'lucide-react';
import { PromotorVendedor } from '../../types';

export const FrotaVendedoresView: React.FC = () => {
  const {
    vendedores,
    usuariosSistema,
    reservas,
    lojaAtiva,
    cadastrarVendedorComAcesso,
    atualizarVendedorComAcesso,
    excluirVendedorComAcesso
  } = useTurismo();

  const [modalAberto, setModalAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<PromotorVendedor | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [filtroVendedor, setFiltroVendedor] = useState<string>('todos');

  // Form states
  const [nome, setNome] = useState('');
  const [cpfDocumento, setCpfDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [comissaoPct, setComissaoPct] = useState(5);
  const [statusAtivo, setStatusAtivo] = useState(true);

  // Estatísticas de reservas por vendedor (loja ativa)
  const statsPorVendedor = useMemo(() => {
    const mapa: Record<string, { qtd: number; total: number; ultima?: string }> = {};
    reservas.forEach(r => {
      if (!r.vendedorId || r.status === 'cancelada') return;
      if (!mapa[r.vendedorId]) mapa[r.vendedorId] = { qtd: 0, total: 0 };
      mapa[r.vendedorId].qtd += 1;
      mapa[r.vendedorId].total += r.valorTotal || 0;
      const dt = r.dataEmissao;
      if (dt && (!mapa[r.vendedorId].ultima || dt > mapa[r.vendedorId].ultima!)) {
        mapa[r.vendedorId].ultima = dt;
      }
    });
    return mapa;
  }, [reservas]);

  const vendedoresFiltrados = useMemo(() => {
    return vendedores.filter(v => {
      const st = v.ativo ? 'ativo' : 'inativo';
      if (filtroStatus !== 'todos' && st !== filtroStatus) return false;
      if (filtroVendedor !== 'todos' && v.id !== filtroVendedor) return false;
      return true;
    });
  }, [vendedores, filtroStatus, filtroVendedor]);

  const rankingVendedores = useMemo(() => {
    return vendedores
      .map(v => ({ vendedor: v, stats: statsPorVendedor[v.id] || { qtd: 0, total: 0 } }))
      .sort((a, b) => b.stats.total - a.stats.total)
      .slice(0, 5);
  }, [vendedores, statsPorVendedor]);

  const formatarDataHora = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const usuarioDoVendedor = (vendedorId: string) =>
    usuariosSistema.find(u => u.perfil === 'vendedor' && u.vendedorId === vendedorId);

  const limparForm = () => {
    setNome('');
    setCpfDocumento('');
    setTelefone('');
    setEmail('');
    setSenha('');
    setMostrarSenha(false);
    setComissaoPct(5);
    setStatusAtivo(true);
  };

  const abrirModalNovo = () => {
    setVendedorEditando(null);
    limparForm();
    setModalAberto(true);
  };

  const abrirModalEditar = (v: PromotorVendedor) => {
    setVendedorEditando(v);
    const usr = usuarioDoVendedor(v.id);
    setNome(v.nome);
    setCpfDocumento(v.cpfDocumento || '');
    setTelefone(v.telefone || '');
    setEmail(v.email || usr?.email || '');
    setSenha('');
    setMostrarSenha(false);
    setComissaoPct(v.comissaoPadraoPct);
    setStatusAtivo(v.ativo);
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      toast.error('Preencha nome, telefone e e-mail/usuário.');
      return;
    }

    if (vendedorEditando) {
      const res = atualizarVendedorComAcesso(vendedorEditando.id, {
        nome, cpfDocumento, telefone, email, senha, comissaoPct, ativo: statusAtivo
      });
      if (!res.sucesso) {
        toast.error(res.mensagem || 'Não foi possível atualizar o vendedor.');
        return;
      }
      toast.success(`Vendedor ${nome} atualizado com sucesso!`, { icon: '✅' });
    } else {
      if (!senha.trim()) {
        toast.error('Defina uma senha de acesso para o vendedor.');
        return;
      }
      const res = cadastrarVendedorComAcesso({
        nome, cpfDocumento, telefone, email, senha, comissaoPct, ativo: statusAtivo
      });
      if (!res.sucesso) {
        toast.error(res.mensagem || 'Não foi possível cadastrar o vendedor.');
        return;
      }
      toast.success(`Vendedor ${nome} cadastrado com acesso ao PDV!`, { icon: '👤' });
    }

    setModalAberto(false);
  };

  const handleExcluir = (v: PromotorVendedor) => {
    if (window.confirm(`Deseja excluir o vendedor ${v.nome} e o seu acesso ao sistema?`)) {
      excluirVendedorComAcesso(v.id);
      toast.success(`${v.nome} e o acesso vinculado foram removidos.`, { icon: '🗑️' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Users className="w-6 h-6 text-purple-600" />
            <span>Gerenciamento de Vendedores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre vendedores com acesso individual ao PDV e acompanhe as reservas de cada um.
          </p>
          {lojaAtiva && (
            <p className="text-[11px] text-purple-700 font-semibold mt-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              Loja vinculada: {lojaAtiva.nome} ({lojaAtiva.id})
            </p>
          )}
        </div>

        <button
          onClick={abrirModalNovo}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Vendedor</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-500" />

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as any)}
          className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 cursor-pointer hover:border-slate-400"
        >
          <option value="todos">Todos os Status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>

        <select
          value={filtroVendedor}
          onChange={(e) => setFiltroVendedor(e.target.value)}
          className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 cursor-pointer hover:border-slate-400"
        >
          <option value="todos">Todos os Vendedores</option>
          {vendedores.map(v => (
            <option key={v.id} value={v.id}>{v.nome}</option>
          ))}
        </select>

        <div className="ml-auto text-xs text-slate-500 font-semibold">
          {vendedoresFiltrados.length} vendedor(es)
        </div>
      </div>

      {/* Ranking - Top 5 Vendedores por valor reservado */}
      {rankingVendedores.some(r => r.stats.total > 0) && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-black text-amber-900">Top 5 Vendedores (Valor Reservado)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {rankingVendedores.map((rv, idx) => (
              <div key={rv.vendedor.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-full ${
                    idx === 0 ? 'bg-amber-500 text-white' :
                    idx === 1 ? 'bg-slate-400 text-white' :
                    idx === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}º
                  </span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">{rv.vendedor.nome}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Reservado: <strong className="text-green-600">{formatarMoeda(rv.stats.total)}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Reservas: <strong className="text-blue-600">{rv.stats.qtd}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Vendedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendedoresFiltrados.length > 0 ? (
          vendedoresFiltrados.map((v) => {
            const stats = statsPorVendedor[v.id] || { qtd: 0, total: 0, ultima: undefined };
            const usr = usuarioDoVendedor(v.id);
            const ranking = rankingVendedores.findIndex(rv => rv.vendedor.id === v.id && rv.stats.total > 0);

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{v.nome}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        v.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {v.ativo ? '✓ Ativo' : '✗ Inativo'}
                      </span>
                    </div>
                  </div>
                  {ranking !== -1 && (
                    <span className="text-xs font-black bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                      #{ranking + 1}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between gap-2">
                    <span>Acesso:</span>
                    {usr ? (
                      <strong className="text-slate-900 truncate flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        @{usr.usuarioLogin}
                      </strong>
                    ) : (
                      <strong className="text-amber-700">Sem login</strong>
                    )}
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>E-mail:</span>
                    <strong className="text-slate-900 truncate">{v.email || usr?.email || '—'}</strong>
                  </div>
                  {v.cpfDocumento && (
                    <div className="flex justify-between">
                      <span>CPF/Doc:</span>
                      <strong className="text-slate-900">{v.cpfDocumento}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Telefone:</span>
                    <strong className="text-slate-900">{v.telefone || '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Comissão:</span>
                    <strong className="text-slate-900">{v.comissaoPadraoPct}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Loja:</span>
                    <strong className="text-slate-900">{v.store_id || lojaAtiva?.id}</strong>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Última:</span>
                    <strong className="text-slate-900">{formatarDataHora(stats.ultima)}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                    <p className="text-xs text-blue-600 font-semibold">Reservas</p>
                    <p className="text-lg font-black text-blue-700">{stats.qtd}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-center">
                    <p className="text-xs text-green-600 font-semibold">Reservado</p>
                    <p className="text-lg font-black text-green-700">{formatarMoeda(stats.total)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {v.telefone ? (
                    <a
                      href={`https://wa.me/55${v.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : <span />}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirModalEditar(v)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Editar vendedor e acesso"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExcluir(v)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Excluir vendedor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 font-semibold">Nenhum vendedor cadastrado</p>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <span>{vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}</span>
            </h3>
            {lojaAtiva && (
              <p className="text-[11px] text-slate-500 mb-4 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-purple-500" />
                Vinculado à loja: <strong className="text-slate-700">{lojaAtiva.nome}</strong>
              </p>
            )}

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">CPF / Documento</label>
                  <input
                    type="text"
                    value={cpfDocumento}
                    onChange={(e) => setCpfDocumento(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefone WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(81) 99999-9999"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-3">
                  <KeyRound className="w-3.5 h-3.5" />
                  Dados de Acesso ao PDV
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">E-mail ou Usuário de Acesso *</label>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com ou usuario"
                      autoComplete="off"
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Senha {vendedorEditando ? '(deixe em branco para manter)' : '*'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder={vendedorEditando ? '••••••••' : 'Defina uma senha'}
                        autoComplete="new-password"
                        className="w-full border border-slate-300 rounded-xl pl-9 pr-9 py-2.5 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">% Comissão *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      required
                      value={comissaoPct}
                      onChange={(e) => setComissaoPct(parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-center"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status *</label>
                  <select
                    value={statusAtivo ? 'ativo' : 'inativo'}
                    onChange={(e) => setStatusAtivo(e.target.value === 'ativo')}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {vendedorEditando ? 'Atualizar' : 'Cadastrar'} Vendedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
