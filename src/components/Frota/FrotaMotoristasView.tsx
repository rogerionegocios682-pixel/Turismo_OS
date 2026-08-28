import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Car, 
  UserCheck, 
  Phone, 
  Plus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  Users, 
  CheckCircle,
  Truck,
  Anchor,
  Clock,
  Wrench,
  Coffee,
  Radio
} from 'lucide-react';
import { MotoristaVeiculo } from '../../types';

export const FrotaMotoristasView: React.FC = () => {
  const { 
    motoristas, 
    adicionarMotorista, 
    atualizarMotorista, 
    excluirMotorista, 
    setActiveTab,
    abrirRelatorioPdfModal,
    empresaConfig
  } = useTurismo();

  const [modalAberto, setModalAberto] = useState(false);
  const [motoristaEditando, setMotoristaEditando] = useState<MotoristaVeiculo | null>(null);

  const [nomeMotorista, setNomeMotorista] = useState('');
  const [telefone, setTelefone] = useState('');
  const [veiculoModelo, setVeiculoModelo] = useState('');
  const [tipoVeiculo, setTipoVeiculo] = useState<MotoristaVeiculo['tipoVeiculo']>('buggy');
  const [placaOuRegistro, setPlacaOuRegistro] = useState('');
  const [capacidadePax, setCapacidadePax] = useState(4);
  const [status, setStatus] = useState<MotoristaVeiculo['status']>('disponivel');
  const [observacoes, setObservacoes] = useState('');

  const abrirModalNovo = () => {
    setMotoristaEditando(null);
    setNomeMotorista('');
    setTelefone('');
    setVeiculoModelo('');
    setTipoVeiculo('buggy');
    setPlacaOuRegistro('');
    setCapacidadePax(4);
    setStatus('disponivel');
    setObservacoes('');
    setModalAberto(true);
  };

  const abrirModalEditar = (m: MotoristaVeiculo) => {
    setMotoristaEditando(m);
    setNomeMotorista(m.nomeMotorista);
    setTelefone(m.telefone);
    setVeiculoModelo(m.veiculoModelo);
    setTipoVeiculo(m.tipoVeiculo);
    setPlacaOuRegistro(m.placaOuRegistro);
    setCapacidadePax(m.capacidadePax);
    setStatus(m.status);
    setObservacoes(m.observacoes || '');
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();

    if (motoristaEditando) {
      atualizarMotorista(motoristaEditando.id, {
        nomeMotorista,
        telefone,
        veiculoModelo,
        tipoVeiculo,
        placaOuRegistro,
        capacidadePax,
        status,
        observacoes
      });
      toast.success(`Dados do motorista ${nomeMotorista} atualizados com sucesso!`, {
        icon: '✅'
      });
    } else {
      adicionarMotorista({
        nomeMotorista,
        telefone,
        veiculoModelo,
        tipoVeiculo,
        placaOuRegistro,
        capacidadePax,
        status,
        observacoes
      });
      toast.success(`Motorista ${nomeMotorista} cadastrado na frota com sucesso!`, {
        icon: '🚗'
      });
    }

    setModalAberto(false);
  };

  const handleAlterarStatusRapido = (m: MotoristaVeiculo, novoStatus: MotoristaVeiculo['status']) => {
    if (m.status === novoStatus) return;
    
    atualizarMotorista(m.id, { status: novoStatus });
    
    const rotulos: Record<MotoristaVeiculo['status'], { label: string; icon: string }> = {
      disponivel: { label: 'Disponível', icon: '🟢' },
      em_rota: { label: 'Em Rota', icon: '🚙' },
      folga: { label: 'Folga / Descanso', icon: '☕' },
      manutencao: { label: 'Em Manutenção', icon: '🔧' }
    };

    const statusInfo = rotulos[novoStatus];
    toast.success(
      (t) => (
        <div>
          <span className="font-bold text-slate-900">{m.nomeMotorista}</span>
          <p className="text-[11px] text-slate-600">
            Status alterado para: <strong className="text-slate-800">{statusInfo.label}</strong>
          </p>
        </div>
      ),
      {
        icon: statusInfo.icon,
        duration: 3500
      }
    );
  };

  const getIconeVeiculo = (tipo: MotoristaVeiculo['tipoVeiculo']) => {
    switch (tipo) {
      case 'lancha':
      case 'catamara':
        return <Anchor className="w-5 h-5 text-cyan-600" />;
      case 'van':
      case 'microonibus':
        return <Truck className="w-5 h-5 text-blue-600" />;
      default:
        return <Car className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Car className="w-6 h-6 text-blue-600" />
            <span>Frota de Veículos & Guias Credenciados</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastro de bugueiros autorizados pela prefeitura de Ipojuca, vans executivas, lanchas e catamarãs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              abrirRelatorioPdfModal({
                tipo: 'frota',
                titulo: 'RELAÇÃO OFICIAL DA FROTA & CONDUTORES',
                subtitulo: `${motoristas.length} condutores e veículos credenciados`,
                periodoOuFiltro: 'Cadastro Geral de Frota',
                dados: {
                  motoristas
                }
              });
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            title="Gerar PDF com lista de condutores e veículos"
          >
            <span>🖨️ Imprimir / Gerar PDF</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Motorista / Veículo</span>
          </button>
        </div>
      </div>

      {/* Grid de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motoristas.map((m) => {
          const isDisponivel = m.status === 'disponivel';

          return (
            <div 
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {getIconeVeiculo(m.tipoVeiculo)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-tight">{m.nomeMotorista}</h3>
                      <span className="text-xs text-slate-500 font-semibold">{m.veiculoModelo}</span>
                    </div>
                  </div>

                  {/* Status Dropdown Rápido com Notificação Toast */}
                  <div className="relative">
                    <select
                      value={m.status}
                      onChange={(e) => handleAlterarStatusRapido(m, e.target.value as MotoristaVeiculo['status'])}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer transition-all appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        m.status === 'disponivel'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : m.status === 'em_rota'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : m.status === 'folga'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                      title="Clique para alterar o status do motorista rapidamente"
                    >
                      <option value="disponivel">🟢 Disponível</option>
                      <option value="em_rota">🚙 Em Rota</option>
                      <option value="folga">☕ Folga</option>
                      <option value="manutencao">🔧 Manutenção</option>
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] opacity-60">▼</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span>Placa / Alvará:</span>
                    <strong className="text-slate-900">{m.placaOuRegistro}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacidade:</span>
                    <strong className="text-slate-900">{m.capacidadePax} passageiros</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Telefone / WhatsApp:</span>
                    <strong className="text-slate-900">{m.telefone}</strong>
                  </div>
                </div>

                {m.observacoes && (
                  <p className="text-[11px] text-slate-500 italic mt-2.5">
                    "{m.observacoes}"
                  </p>
                )}
              </div>

              {/* Ações do Card */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/55${m.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setActiveTab('rastreio')}
                    className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    title="Ver localização e telemetria celular no radar"
                  >
                    <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
                    <span>Rastrear</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => abrirModalEditar(m)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Editar dados"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja excluir ${m.nomeMotorista}?`)) {
                        excluirMotorista(m.id);
                        toast.success(`${m.nomeMotorista} foi removido da frota.`, {
                          icon: '🗑️'
                        });
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Excluir da frota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span>{motoristaEditando ? 'Editar Motorista / Veículo' : 'Novo Motorista na Frota'}</span>
            </h3>

            <form onSubmit={handleSalvar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nomeMotorista}
                    onChange={(e) => setNomeMotorista(e.target.value)}
                    placeholder="Ex: Seu Zito Bugueiro"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Modelo do Veículo *</label>
                  <input
                    type="text"
                    required
                    value={veiculoModelo}
                    onChange={(e) => setVeiculoModelo(e.target.value)}
                    placeholder="Ex: Buggy Selvagem 1.6 ou Van Sprinter"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo de Veículo *</label>
                  <select
                    value={tipoVeiculo}
                    onChange={(e) => setTipoVeiculo(e.target.value as MotoristaVeiculo['tipoVeiculo'])}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="buggy">Buggy Credenciado (Porto/Ipojuca)</option>
                    <option value="van">Van Executiva (15-20 lugares)</option>
                    <option value="spin_executivo">Spin / Carro 7 Lugares</option>
                    <option value="microonibus">Micro-ônibus</option>
                    <option value="lancha">Lancha Rápida (Marítimo)</option>
                    <option value="catamara">Catamarã</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Placa / Alvará *</label>
                  <input
                    type="text"
                    required
                    value={placaOuRegistro}
                    onChange={(e) => setPlacaOuRegistro(e.target.value)}
                    placeholder="BUG-1234 (#042)"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Capacidade (PAX) *</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={capacidadePax}
                    onChange={(e) => setCapacidadePax(parseInt(e.target.value) || 4)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status Operacional</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MotoristaVeiculo['status'])}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="em_rota">Em Rota</option>
                    <option value="folga">Folga / Descanso</option>
                    <option value="manutencao">Manutenção</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Observações Internas</label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Especialista no Pontal de Maracaípe e fotos de drone"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
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
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Salvar Veículo / Motorista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
