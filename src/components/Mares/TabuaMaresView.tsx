import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Waves, 
  Calendar, 
  Clock, 
  ArrowDown, 
  ArrowUp, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Compass
} from 'lucide-react';
import { formatarDataPtBr } from '../../utils/formatters';
import { RegistroMare } from '../../types';

export const TabuaMaresView: React.FC = () => {
  const { tabuaMares, salvarRegistroMare, setActiveTab } = useTurismo();

  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);
  const [dataNova, setDataNova] = useState('');
  const [horarioBaixa, setHorarioBaixa] = useState('08:30');
  const [alturaBaixa, setAlturaBaixa] = useState(0.2);
  const [horarioAlta, setHorarioAlta] = useState('14:45');
  const [alturaAlta, setAlturaAlta] = useState(2.1);
  const [coeficiente, setCoeficiente] = useState('Maré Viva / Lua Nova');
  const [janelaIdeal, setJanelaIdeal] = useState('07:00 às 10:30');

  const handleSalvarMare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataNova) return;

    let recomendacao: 'perfeita' | 'boa' | 'regular' | 'inapropriada' = 'boa';
    if (alturaBaixa <= 0.3) recomendacao = 'perfeita';
    else if (alturaBaixa <= 0.6) recomendacao = 'boa';
    else if (alturaBaixa <= 0.8) recomendacao = 'regular';
    else recomendacao = 'inapropriada';

    const novoRegistro: RegistroMare = {
      data: dataNova,
      horarioBaixa,
      alturaBaixa,
      horarioAlta,
      alturaAlta,
      coeficiente,
      recomendacaoPiscinas: recomendacao,
      janelaIdealPiscinas: janelaIdeal
    };

    salvarRegistroMare(novoRegistro);
    setMostrarFormNovo(false);
    setDataNova('');
    toast.success(`Previsão de maré para ${novoRegistro.data.split('-').reverse().join('/')} salva com sucesso!`, {
      icon: '🌊'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Waves className="w-6 h-6 text-cyan-600" />
            <span>Tábua de Marés Inteligente (Porto de Galinhas & Maragogi)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento operacional para piscinas naturais, catamarãs em Maragogi e bancos de areia em Carneiros.
          </p>
        </div>

        <button
          onClick={() => setMostrarFormNovo(!mostrarFormNovo)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{mostrarFormNovo ? 'Fechar Cadastro' : 'Cadastrar Maré'}</span>
        </button>
      </div>

      {/* Formulário de Cadastro de Maré (se aberto) */}
      {mostrarFormNovo && (
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Adicionar Previsão da Marinha do Brasil / DHN</span>
          </h3>

          <form onSubmit={handleSalvarMare} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data *</label>
                <input
                  type="date"
                  required
                  value={dataNova}
                  onChange={(e) => setDataNova(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Horário Maré Baixa *</label>
                <input
                  type="time"
                  required
                  value={horarioBaixa}
                  onChange={(e) => setHorarioBaixa(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Altura Maré Baixa (m) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="3.0"
                  required
                  value={alturaBaixa}
                  onChange={(e) => setAlturaBaixa(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Horário Maré Alta</label>
                <input
                  type="time"
                  value={horarioAlta}
                  onChange={(e) => setHorarioAlta(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo / Coeficiente</label>
                <input
                  type="text"
                  value={coeficiente}
                  onChange={(e) => setCoeficiente(e.target.value)}
                  placeholder="Ex: Maré de Lua Cheia"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Janela Ideal Piscinas</label>
                <input
                  type="text"
                  value={janelaIdeal}
                  onChange={(e) => setJanelaIdeal(e.target.value)}
                  placeholder="Ex: 07:30 às 11:00"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer"
            >
              Salvar Dados da Maré
            </button>
          </form>
        </div>
      )}

      {/* Regra de Ouro da Maré em Porto de Galinhas */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-3 bg-cyan-600 text-white rounded-xl shadow-xs shrink-0">
          <Compass className="w-6 h-6" />
        </div>
        <div className="text-xs text-cyan-950 space-y-1">
          <h3 className="font-extrabold text-sm text-cyan-900">Guia de Especialista: Regras de Maré no Litoral Sul & Maragogi</h3>
          <p>
            • <strong>Maré 0.0m a 0.3m:</strong> Perfeita! Visibilidade cristalina, piscinas rasas e Galés de Maragogi operando na capacidade máxima.
          </p>
          <p>
            • <strong>Maré 0.4m a 0.6m:</strong> Muito boa. Ideal para jangadas e buggys, águas mornas e calmas.
          </p>
          <p>
            • <strong>Maré acima de 0.8m:</strong> As piscinas naturais começam a cobrir. Recomenda-se direcionar turistas para passeios de Carneiros, Ilha de Santo Aleixo ou City Tour Olinda/Recife.
          </p>
        </div>
      </div>

      {/* Grid de Cards de Marés Cadastradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tabuaMares.map((m) => {
          const isPerfeita = m.recomendacaoPiscinas === 'perfeita';
          const isBoa = m.recomendacaoPiscinas === 'boa';
          const isRegular = m.recomendacaoPiscinas === 'regular';

          return (
            <div 
              key={m.data}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden ${
                isPerfeita ? 'border-emerald-300 ring-1 ring-emerald-300' : 'border-slate-200'
              }`}
            >
              {isPerfeita && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Maré Top</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Data</span>
                  <h3 className="text-base font-black text-slate-900">{formatarDataPtBr(m.data)}</h3>
                </div>

                <div className="text-right pr-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isPerfeita ? 'bg-emerald-100 text-emerald-800' : (isBoa ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')
                  }`}>
                    {isPerfeita ? 'Excelente' : (isBoa ? 'Boa Maré' : 'Maré Alta/Regular')}
                  </span>
                </div>
              </div>

              {/* Medições */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                
                <div className="bg-cyan-50/70 border border-cyan-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-cyan-800 text-[10px] font-black uppercase">
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Maré Baixa (Mínima)</span>
                  </div>
                  <p className="text-2xl font-black text-cyan-950 mt-1">{m.alturaBaixa.toFixed(1)}m</p>
                  <span className="text-xs font-bold text-cyan-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> às {m.horarioBaixa}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-slate-600 text-[10px] font-black uppercase">
                    <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Maré Alta (Máxima)</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-1">{m.alturaAlta.toFixed(1)}m</p>
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> às {m.horarioAlta}
                  </span>
                </div>

              </div>

              {/* Janela Ideal & Coeficiente */}
              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Janela de Visitação:</span>
                  <span className="font-bold text-slate-900">{m.janelaIdealPiscinas}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Coeficiente Lunar:</span>
                  <span className="font-semibold text-slate-700">{m.coeficiente || 'Maré Regular'}</span>
                </div>
              </div>

              {/* CTA Rápido */}
              <button
                onClick={() => setActiveTab('reservas')}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Agendar Passeio Nesta Maré</span>
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};
