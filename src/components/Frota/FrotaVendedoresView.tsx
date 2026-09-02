import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import {
  User,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  Trophy,
  Filter,
  BarChart3,
  Phone
} from 'lucide-react';

interface Vendedor {
  id: string;
  nomeVendedor: string;
  telefone: string;
  email: string;
  percentualComissao: number;
  status: 'ativo' | 'inativo';
  empresaId: string;
  dataCadastro: string;
  saldoComissoes?: number;
  totalVendas?: number;
  totalSinais?: number;
}

interface VendaRegistro {
  id: string;
  vendedorId: string;
  dataVenda: string;
  tipoServico: string;
  valorVenda: number;
  comissaoRecebida: number;
  observacoes?: string;
}

export const FrotaVendedoresView: React.FC = () => {
  const { empresaConfig } = useTurismo();

  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendas, setVendas] = useState<VendaRegistro[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [filtroVendedor, setFiltroVendedor] = useState<string>('todos');

  // Form states
  const [nomeVendedor, setNomeVendedor] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [percentualComissao, setPercentualComissao] = useState(5);
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  // Calcular vendedores filtrados
  const vendedoresFiltrados = useMemo(() => {
    return vendedores.filter(v => {
      if (filtroStatus !== 'todos' && v.status !== filtroStatus) return false;
      if (filtroVendedor !== 'todos' && v.id !== filtroVendedor) return false;
      return true;
    });
  }, [vendedores, filtroStatus, filtroVendedor]);

  // Calcular ranking dos 5 maiores vendedores
  const rankingVendedores = useMemo(() => {
    const vendedoresComDados = vendedores.map(v => {
      const vendedorVendas = vendas.filter(vd => vd.vendedorId === v.id);
      const totalComissoes = vendedorVendas.reduce((sum, vd) => sum + vd.comissaoRecebida, 0);
      const totalVendas = vendedorVendas.length;

      return {
        ...v,
        saldoComissoes: totalComissoes,
        totalVendas: totalVendas,
        totalSinais: totalVendas // Por hora, considerando como sinais
      };
    });

    return vendedoresComDados
      .sort((a, b) => (b.saldoComissoes || 0) - (a.saldoComissoes || 0))
      .slice(0, 5);
  }, [vendedores, vendas]);

  // Modal handlers
  const abrirModalNovo = () => {
    setVendedorEditando(null);
    setNomeVendedor('');
    setTelefone('');
    setEmail('');
    setPercentualComissao(5);
    setStatus('ativo');
    setModalAberto(true);
  };

  const abrirModalEditar = (v: Vendedor) => {
    setVendedorEditando(v);
    setNomeVendedor(v.nomeVendedor);
    setTelefone(v.telefone);
    setEmail(v.email);
    setPercentualComissao(v.percentualComissao);
    setStatus(v.status);
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeVendedor || !telefone || !email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (vendedorEditando) {
      setVendedores(vendedores.map(v =>
        v.id === vendedorEditando.id
          ? {
              ...v,
              nomeVendedor,
              telefone,
              email,
              percentualComissao,
              status
            }
          : v
      ));
      toast.success(`Vendedor ${nomeVendedor} atualizado com sucesso!`, {
        icon: '✅'
      });
    } else {
      const novoVendedor: Vendedor = {
        id: Date.now().toString(),
        nomeVendedor,
        telefone,
        email,
        percentualComissao,
        status,
        empresaId: empresaConfig?.id || 'padrao',
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        saldoComissoes: 0,
        totalVendas: 0,
        totalSinais: 0
      };
      setVendedores([...vendedores, novoVendedor]);
      toast.success(`Vendedor ${nomeVendedor} cadastrado com sucesso!`, {
        icon: '👤'
      });
    }

    setModalAberto(false);
  };

  const handleExcluir = (v: Vendedor) => {
    if (window.confirm(`Deseja excluir o vendedor ${v.nomeVendedor}?`)) {
      setVendedores(vendedores.filter(vend => vend.id !== v.id));
      toast.success(`${v.nomeVendedor} foi removido.`, {
        icon: '🗑️'
      });
    }
  };

  const registrarVenda = (vendedorId: string, valor: number, tipo: string) => {
    const vendedor = vendedores.find(v => v.id === vendedorId);
    if (!vendedor) return;

    const comissao = (valor * vendedor.percentualComissao) / 100;
    const novaVenda: VendaRegistro = {
      id: Date.now().toString(),
      vendedorId,
      dataVenda: new Date().toLocaleDateString('pt-BR'),
      tipoServico: tipo,
      valorVenda: valor,
      comissaoRecebida: comissao
    };

    setVendas([...vendas, novaVenda]);
    toast.success(`Venda registrada! Comissão: R$ ${comissao.toFixed(2)}`, {
      icon: '💰'
    });
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
            Cadastre vendedores, acompanhe comissões e sinais no PDV
          </p>
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
            <option key={v.id} value={v.id}>{v.nomeVendedor}</option>
          ))}
        </select>

        <div className="ml-auto text-xs text-slate-500 font-semibold">
          {vendedoresFiltrados.length} vendedor(es)
        </div>
      </div>

      {/* Ranking - Top 5 Vendedores */}
      {rankingVendedores.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-black text-amber-900">Top 5 Maiores Vendedores</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {rankingVendedores.map((v, idx) => (
              <div
                key={v.id}
                className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-full ${
                    idx === 0 ? 'bg-amber-500 text-white' :
                    idx === 1 ? 'bg-slate-400 text-white' :
                    idx === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}º
                  </span>
                  <TrendingUp className={`w-4 h-4 ${
                    idx === 0 ? 'text-amber-600' :
                    idx === 1 ? 'text-slate-500' :
                    'text-amber-700'
                  }`} />
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">{v.nomeVendedor}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Comissões: <strong className="text-green-600">R$ {(v.saldoComissoes || 0).toFixed(2)}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Sinais: <strong className="text-blue-600">{v.totalSinais || 0}</strong>
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
            const vendedorVendas = vendas.filter(vd => vd.vendedorId === v.id);
            const totalComissoes = vendedorVendas.reduce((sum, vd) => sum + vd.comissaoRecebida, 0);
            const ranking = rankingVendedores.findIndex(rv => rv.id === v.id);

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
                      <h3 className="font-extrabold text-base text-slate-900">{v.nomeVendedor}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        v.status === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {v.status === 'ativo' ? '✓ Ativo' : '✗ Inativo'}
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
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <strong className="text-slate-900 truncate">{v.email}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Telefone:</span>
                    <strong className="text-slate-900">{v.telefone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Comissão:</span>
                    <strong className="text-slate-900">{v.percentualComissao}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cadastro:</span>
                    <strong className="text-slate-900">{v.dataCadastro}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                    <p className="text-xs text-blue-600 font-semibold">Sinais</p>
                    <p className="text-lg font-black text-blue-700">{vendedorVendas.length}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-center">
                    <p className="text-xs text-green-600 font-semibold">Comissões</p>
                    <p className="text-lg font-black text-green-700">R$ {totalComissoes.toFixed(0)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <a
                    href={`https://wa.me/55${v.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirModalEditar(v)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Editar vendedor"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <span>{vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}</span>
            </h3>

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nomeVendedor}
                  onChange={(e) => setNomeVendedor(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">% Comissão *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      required
                      value={percentualComissao}
                      onChange={(e) => setPercentualComissao(parseFloat(e.target.value) || 5)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-center"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
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
