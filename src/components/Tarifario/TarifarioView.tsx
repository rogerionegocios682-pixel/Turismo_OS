import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Waves, 
  Check, 
  Sparkles,
  MapPin,
  Car,
  Anchor
} from 'lucide-react';
import { formatarMoeda } from '../../utils/formatters';
import { Passeio, CategoriaPasseio } from '../../types';

export const TarifarioView: React.FC = () => {
  const { 
    passeios, 
    adicionarPasseio, 
    atualizarPasseio, 
    excluirPasseio,
    abrirRelatorioPdfModal,
    empresaConfig
  } = useTurismo();

  const [modalAberto, setModalAberto] = useState(false);
  const [passeioEditando, setPasseioEditando] = useState<Passeio | null>(null);

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPasseio>('buggy');
  const [precoPadrao, setPrecoPadrao] = useState(150.00);
  const [tipoCobranca, setTipoCobranca] = useState<'por_pessoa' | 'veiculo_privativo'>('por_pessoa');
  const [duracaoHoras, setDuracaoHoras] = useState(6);
  const [destinoPrincipal, setDestinoPrincipal] = useState('Porto de Galinhas');
  const [dependeMare, setDependeMare] = useState(false);
  const [horarioRecomendado, setHorarioRecomendado] = useState('08:30 às 14:30');
  const [descricaoCurta, setDescricaoCurta] = useState('');
  const [inclusoTexto, setInclusoTexto] = useState('Transporte climatizado, Guia de turismo Mtur');

  const abrirModalNovo = () => {
    setPasseioEditando(null);
    setNome('');
    setCategoria('buggy');
    setPrecoPadrao(150.00);
    setTipoCobranca('por_pessoa');
    setDuracaoHoras(6);
    setDestinoPrincipal('Porto de Galinhas');
    setDependeMare(false);
    setHorarioRecomendado('08:30 às 14:30');
    setDescricaoCurta('');
    setInclusoTexto('Transporte climatizado, Guia credenciado');
    setModalAberto(true);
  };

  const abrirModalEditar = (p: Passeio) => {
    setPasseioEditando(p);
    setNome(p.nome);
    setCategoria(p.categoria);
    setPrecoPadrao(p.precoPadrao);
    setTipoCobranca(p.tipoCobranca);
    setDuracaoHoras(p.duracaoHoras);
    setDestinoPrincipal(p.destinoPrincipal);
    setDependeMare(p.dependeMare);
    setHorarioRecomendado(p.horarioRecomendado || '');
    setDescricaoCurta(p.descricaoCurta);
    setInclusoTexto(p.incluso.join(', '));
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();

    const inclusoArray = inclusoTexto.split(',').map(item => item.trim()).filter(Boolean);

    if (passeioEditando) {
      atualizarPasseio(passeioEditando.id, {
        nome,
        categoria,
        precoPadrao,
        tipoCobranca,
        duracaoHoras,
        destinoPrincipal,
        dependeMare,
        horarioRecomendado,
        descricaoCurta,
        incluso: inclusoArray,
        ativo: true
      });
      toast.success(`Passeio "${nome}" atualizado com sucesso!`, { icon: '🏷️' });
    } else {
      adicionarPasseio({
        nome,
        categoria,
        precoPadrao,
        tipoCobranca,
        duracaoHoras,
        destinoPrincipal,
        dependeMare,
        horarioRecomendado,
        descricaoCurta,
        incluso: inclusoArray,
        ativo: true
      });
      toast.success(`Passeio "${nome}" adicionado ao tarifário!`, { icon: '✨' });
    }

    setModalAberto(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Tag className="w-6 h-6 text-blue-600" />
            <span>Tarifário & Roteiros de Passeios</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de preços por pessoa ou fretamento privativo, durações e opcionais adicionais.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              abrirRelatorioPdfModal({
                tipo: 'tarifario',
                titulo: 'TABELA OFICIAL DE TARIFAS & PASSEIOS',
                subtitulo: `${passeios.length} roteiros disponíveis para venda`,
                periodoOuFiltro: 'Tarifário Geral de Passeios',
                dados: {
                  passeios
                }
              });
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            title="Gerar PDF da tabela de preços e roteiros"
          >
            <span>🖨️ Imprimir / Gerar PDF</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Passeio</span>
          </button>
        </div>
      </div>

      {/* Grid de Passeios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {passeios.map((p) => {
          return (
            <div 
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                    {p.categoria.replace('_', ' ')}
                  </span>

                  {p.dependeMare && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                      <Waves className="w-3 h-3" />
                      <span>Depende de Maré</span>
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mt-2 leading-snug">{p.nome}</h3>
                
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {p.descricaoCurta}
                </p>

                {/* Preço & Tipo */}
                <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      {p.tipoCobranca === 'veiculo_privativo' ? 'Valor Fechado (Privativo)' : 'Valor Unitário (Por Pessoa)'}
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {formatarMoeda(p.precoPadrao)}
                    </span>
                  </div>

                  <div className="text-right text-xs text-slate-600 font-semibold">
                    <span className="flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {p.duracaoHoras}h duração
                    </span>
                  </div>
                </div>

                {/* Inclusos */}
                {p.incluso && p.incluso.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">O que está incluso:</span>
                    {p.incluso.slice(0, 3).map((item, idx) => (
                      <p key={idx} className="text-xs text-slate-700 flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">
                  Destino: {p.destinoPrincipal}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => abrirModalEditar(p)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Editar passeio"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja excluir o passeio "${p.nome}"?`)) {
                        excluirPasseio(p.id);
                        toast.success(`Passeio "${p.nome}" excluído do tarifário.`, { icon: '🗑️' });
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Excluir passeio"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              <span>{passeioEditando ? 'Editar Passeio' : 'Cadastrar Novo Passeio no Tarifário'}</span>
            </h3>

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome do Passeio / Roteiro *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Passeio de Buggy Ponta a Ponta"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Categoria *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaPasseio)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="buggy">Passeio de Buggy</option>
                    <option value="catamara">Catamarã / Piscinas</option>
                    <option value="lancha_privativa">Lancha Rápida VIP</option>
                    <option value="transfer_aeroporto">Transfer Aeroporto</option>
                    <option value="4x4_offroad">4x4 / Trilha Aventura</option>
                    <option value="mergulho">Mergulho com Cilindro</option>
                    <option value="city_tour">City Tour Cultural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo de Cobrança *</label>
                  <select
                    value={tipoCobranca}
                    onChange={(e) => setTipoCobranca(e.target.value as 'por_pessoa' | 'veiculo_privativo')}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="por_pessoa">Por Pessoa (Individual)</option>
                    <option value="veiculo_privativo">Veículo Privativo (Fretamento)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Preço Base (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={precoPadrao}
                    onChange={(e) => setPrecoPadrao(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Duração (Horas)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={duracaoHoras}
                    onChange={(e) => setDuracaoHoras(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Destino Principal</label>
                  <input
                    type="text"
                    value={destinoPrincipal}
                    onChange={(e) => setDestinoPrincipal(e.target.value)}
                    placeholder="Ex: Maragogi AL"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="chk-depende-mare"
                  checked={dependeMare}
                  onChange={(e) => setDependeMare(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="chk-depende-mare" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Este passeio depende dos horários da Tábua de Marés (Ex: Piscinas e Bancos de Areia)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Descrição Curta</label>
                <textarea
                  rows={2}
                  value={descricaoCurta}
                  onChange={(e) => setDescricaoCurta(e.target.value)}
                  placeholder="Ex: Roteiro completo passando pelas praias de Muro Alto, Cupe e Pontal de Maracaípe."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">O que está incluso (Separar por vírgulas)</label>
                <input
                  type="text"
                  value={inclusoTexto}
                  onChange={(e) => setInclusoTexto(e.target.value)}
                  placeholder="Ex: Transporte climatizado, Guia de turismo, Ingresso do catamarã"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs"
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
                  Salvar Passeio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
