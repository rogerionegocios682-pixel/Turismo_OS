import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Ticket, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Car, 
  Sparkles, 
  Waves, 
  QrCode, 
  Printer, 
  Share2, 
  Info,
  Check,
  Percent,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { hoteisPortoDeGalinhas } from '../../data/mockData';
import { formatarMoeda } from '../../utils/formatters';
import { FormaPagamento, OpcionalPasseio } from '../../types';
import { gerarPixCopiaECola } from '../../utils/pix';

export const NovaReservaView: React.FC = () => {
  const { 
    passeios, 
    motoristas, 
    vendedores, 
    empresaConfig, 
    agenciaAtiva, 
    criarReserva, 
    getMareDoDia, 
    abrirVoucherModal,
    setActiveTab 
  } = useTurismo();

  const hojeIso = new Date().toISOString().split('T')[0];

  // Form States
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteCpf, setClienteCpf] = useState('');
  const [clienteHotel, setClienteHotel] = useState('');
  const [clienteQuarto, setClienteQuarto] = useState('');
  
  const [dataPasseio, setDataPasseio] = useState(hojeIso);
  const [horarioEmbarque, setHorarioEmbarque] = useState('08:00');
  const [passeioId, setPasseioId] = useState(passeios[0]?.id || '');
  
  const [paxAdultos, setPaxAdultos] = useState(2);
  const [paxCriancas, setPaxCriancas] = useState(0);
  const [paxBebes, setPaxBebes] = useState(0);
  
  const [opcionaisSelecionados, setOpcionaisSelecionados] = useState<{ [opId: string]: number }>({});
  
  const [percentualSinal, setPercentualSinal] = useState<number>(empresaConfig.percentualSinalPadrao || 30);
  const [sinalManual, setSinalManual] = useState<number>(0);
  const [formaPagtoSinal, setFormaPagtoSinal] = useState<FormaPagamento>('pix');
  
  const [motoristaId, setMotoristaId] = useState('');
  const [vendedorId, setVendedorId] = useState(vendedores[0]?.id || '');
  const [observacoesVoucher, setObservacoesVoucher] = useState('');

  // Sugestões de hotéis filtradas
  const [filtroHoteis, setFiltroHoteis] = useState<string[]>([]);
  const [mostrarSugestoesHotel, setMostrarSugestoesHotel] = useState(false);

  // Passeio Selecionado
  const passeioAtual = passeios.find(p => p.id === passeioId) || passeios[0];
  
  // Tábua de Marés do dia selecionado
  const mareDoDia = getMareDoDia(dataPasseio);

  // Sugestão de hotéis ao digitar
  const handleHotelChange = (val: string) => {
    setClienteHotel(val);
    if (val.trim().length > 1) {
      const match = hoteisPortoDeGalinhas
        .filter(h => h.nome.toLowerCase().includes(val.toLowerCase()) || h.regiao.toLowerCase().includes(val.toLowerCase()))
        .map(h => `${h.nome} (${h.regiao})`);
      setFiltroHoteis(match);
      setMostrarSugestoesHotel(match.length > 0);
    } else {
      setMostrarSugestoesHotel(false);
    }
  };

  // Cálculo de Valores
  const totalPax = Math.max(1, paxAdultos + paxCriancas + paxBebes);
  
  let valorBasePasseio = 0;
  if (passeioAtual) {
    if (passeioAtual.tipoCobranca === 'veiculo_privativo') {
      valorBasePasseio = passeioAtual.precoPadrao;
    } else {
      // Por pessoa (adultos integral, crianças 50%)
      valorBasePasseio = (passeioAtual.precoPadrao * paxAdultos) + ((passeioAtual.precoPadrao * 0.5) * paxCriancas);
    }
  }

  // Opcionais
  let valorTotalOpcionais = 0;
  const listaOpcionaisFormatada: { nome: string; quantidade: number; valorTotal: number }[] = [];
  
  if (passeioAtual && passeioAtual.opcionais) {
    passeioAtual.opcionais.forEach(op => {
      const qtd = opcionaisSelecionados[op.id] || 0;
      if (qtd > 0) {
        const totalOp = op.preco * qtd;
        valorTotalOpcionais += totalOp;
        listaOpcionaisFormatada.push({
          nome: op.nome,
          quantidade: qtd,
          valorTotal: totalOp
        });
      }
    });
  }

  const valorTotalGeral = valorBasePasseio + valorTotalOpcionais;

  // Atualizar cálculo do sinal sugerido quando muda valor total ou percentual
  useEffect(() => {
    const calc = Math.round((valorTotalGeral * (percentualSinal / 100)) * 100) / 100;
    setSinalManual(calc);
  }, [valorTotalGeral, percentualSinal]);

  const valorSaldoRestante = Math.max(0, valorTotalGeral - sinalManual);

  // Vendedor & Comissão
  const vendedorAtual = vendedores.find(v => v.id === vendedorId);
  const comissaoValor = vendedorAtual ? (valorTotalGeral * (vendedorAtual.comissaoPadraoPct / 100)) : 0;

  // Motorista selecionado
  const motoristaAtual = motoristas.find(m => m.id === motoristaId);

  // Gerar PIX Copia e Cola instantâneo para o Sinal
  const pixCopiaECola = gerarPixCopiaECola(
    empresaConfig.chavePix,
    empresaConfig.nomeTitularPix || empresaConfig.nomeFantasia,
    'PORTO DE GALINHAS',
    sinalManual,
    'SINAL'
  );

  const handleSubmeterReserva = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteNome.trim()) {
      toast.error('Por favor, informe o nome do passageiro titular.');
      return;
    }

    if (!clienteHotel.trim()) {
      toast.error('Por favor, informe o hotel ou pousada de embarque.');
      return;
    }

    const novaReserva = criarReserva({
      agenciaEmissora: agenciaAtiva !== "Todas as Agências" ? agenciaAtiva : empresaConfig.agencias[0],
      dataPasseio,
      horarioEmbarquePrevisto: horarioEmbarque,
      clienteNome,
      clienteTelefone,
      clienteCpfPassaporte: clienteCpf,
      clienteHotel,
      clienteQuarto,
      passeioId: passeioAtual.id,
      passeioNome: passeioAtual.nome,
      paxAdultos,
      paxCriancas,
      paxBebes,
      totalPax,
      opcionaisSelecionados: listaOpcionaisFormatada,
      valorUnitarioOuBase: passeioAtual.precoPadrao,
      valorOpcionais: valorTotalOpcionais,
      valorDesconto: 0,
      valorTotal: valorTotalGeral,
      valorSinalPago: sinalManual,
      formaPagamentoSinal: formaPagtoSinal,
      valorSaldoRestante,
      saldoQuitado: valorSaldoRestante === 0,
      motoristaVeiculoId: motoristaAtual?.id,
      motoristaNome: motoristaAtual?.nomeMotorista,
      motoristaTelefone: motoristaAtual?.telefone,
      veiculoInfo: motoristaAtual ? `${motoristaAtual.veiculoModelo} (${motoristaAtual.placaOuRegistro})` : undefined,
      statusEmbarque: valorSaldoRestante === 0 ? 'embarcado_saldo_pago' : 'aguardando',
      vendedorId: vendedorAtual?.id,
      vendedorNome: vendedorAtual?.nome,
      comissaoValor,
      comissaoPaga: false,
      observacoesVoucher,
      status: 'confirmada'
    });

    // Toast de sucesso ao criar nova reserva
    toast.success(
      (t) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900">Reserva #{novaReserva.codigoVoucher} criada com sucesso!</span>
          <span className="text-[11px] text-slate-600">
            {novaReserva.clienteNome} • {novaReserva.passeioNome}
          </span>
        </div>
      ),
      {
        duration: 4500,
        icon: '🎉'
      }
    );

    // Celebração de venda
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch { /* ignore */ }

    // Abre imediatamente o modal com o Voucher A4 gerado
    abrirVoucherModal(novaReserva, 'a4');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Título & Cabeçalho do PDV */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Ticket className="w-6 h-6 text-blue-600" />
            <span>Emissão Rápida de Reserva (Balcão & WhatsApp)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Controle automatizado de sinal, saldo para motorista e emissão de vouchers com 2 vias.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs text-blue-900 font-semibold flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Agência: <strong>{agenciaAtiva}</strong></span>
        </div>
      </div>

      <form onSubmit={handleSubmeterReserva} className="space-y-6">
        
        {/* Bloco 1: Dados do Passageiro & Hospedagem */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>1. Dados do Passageiro & Ponto de Embarque</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nome Completo do Passageiro Titular *
              </label>
              <input
                type="text"
                required
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: Dra. Mariana Albuquerque"
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                WhatsApp / Celular *
              </label>
              <input
                type="text"
                required
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                placeholder="(81) 99999-9999"
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
            <div className="sm:col-span-2 relative">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Hotel / Pousada / Local de Embarque *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={clienteHotel}
                  onChange={(e) => handleHotelChange(e.target.value)}
                  onFocus={() => {
                    if (clienteHotel.trim().length > 0) setMostrarSugestoesHotel(true);
                  }}
                  placeholder="Ex: Nannai Resort, Summerville, Solar Porto..."
                  className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Lista suspensa de hotéis */}
              {mostrarSugestoesHotel && filtroHoteis.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {filtroHoteis.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setClienteHotel(h);
                        setMostrarSugestoesHotel(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{h}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Quarto / Apto (Opcional)
              </label>
              <input
                type="text"
                value={clienteQuarto}
                onChange={(e) => setClienteQuarto(e.target.value)}
                placeholder="Ex: Bloco B / 204"
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Passeio, Data, Horário e Verificação de Maré */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>2. Passeio, Data e Verificação Inteligente da Maré</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Selecione o Passeio / Roteiro *
              </label>
              <select
                value={passeioId}
                onChange={(e) => setPasseioId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {passeios.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.tipoCobranca === 'veiculo_privativo' ? `Privativo ${formatarMoeda(p.precoPadrao)}` : `${formatarMoeda(p.precoPadrao)}/pessoa`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Data do Passeio *
              </label>
              <input
                type="date"
                required
                value={dataPasseio}
                onChange={(e) => setDataPasseio(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dica e Alerta da Maré para o Passeio */}
          {passeioAtual?.dependeMare && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-start gap-3">
              <Waves className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div className="text-xs text-cyan-950">
                <span className="font-bold block">
                  🌊 Verificação de Maré em Porto de Galinhas / Maragogi:
                </span>
                {mareDoDia ? (
                  <p className="mt-0.5">
                    Maré Baixa prevista para <strong>{dataPasseio.split('-').reverse().join('/')}</strong>: 
                    <span className="font-extrabold text-cyan-800"> {mareDoDia.alturaBaixa}m às {mareDoDia.horarioBaixa}</span>.
                    Janela ideal para piscinas: <strong>{mareDoDia.janelaIdealPiscinas}</strong> ({mareDoDia.coeficiente}).
                  </p>
                ) : (
                  <p className="mt-0.5 text-slate-600">
                    Consulte a tabela de marés na aba correspondente para alinhar a melhor saída com o cliente.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Passageiros & Horário */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Adultos
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={paxAdultos}
                onChange={(e) => setPaxAdultos(parseInt(e.target.value) || 1)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Crianças (6-10 anos)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={paxCriancas}
                onChange={(e) => setPaxCriancas(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Bebês (0-5 cortesia)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={paxBebes}
                onChange={(e) => setPaxBebes(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Horário Embarque
              </label>
              <input
                type="time"
                value={horarioEmbarque}
                onChange={(e) => setHorarioEmbarque(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm text-center font-bold"
              />
            </div>
          </div>

          {/* Opcionais do Passeio (se houver) */}
          {passeioAtual?.opcionais && passeioAtual.opcionais.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Opcionais / Adicionais Disponíveis:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {passeioAtual.opcionais.map(op => {
                  const qtd = opcionaisSelecionados[op.id] || 0;
                  return (
                    <div key={op.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{op.nome}</p>
                        <span className="text-slate-500 font-medium">+{formatarMoeda(op.preco)} {op.unidade === 'por_pessoa' ? '/ pax' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setOpcionaisSelecionados(prev => ({ ...prev, [op.id]: Math.max(0, (prev[op.id] || 0) - 1) }))}
                          className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-slate-900">{qtd}</span>
                        <button
                          type="button"
                          onClick={() => setOpcionaisSelecionados(prev => ({ ...prev, [op.id]: (prev[op.id] || 0) + 1 }))}
                          className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bloco 3: Engenharia Financeira de Sinal e Saldo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>3. Valores, Sinal de Entrada & Saldo no Embarque</span>
          </h3>

          {/* Atalhos de Percentual de Sinal */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600">Sinal Recomendado:</span>
            {[20, 30, 50, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => setPercentualSinal(pct)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  percentualSinal === pct
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pct === 100 ? '100% (Integral)' : `${pct}%`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Valor Total */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="block text-[10px] font-black text-slate-500 uppercase">VALOR TOTAL DO PASSEIO</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {formatarMoeda(valorTotalGeral)}
              </span>
              <span className="text-[10px] text-slate-500">{totalPax} passageiros</span>
            </div>

            {/* Sinal a Pagar Agora */}
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl">
              <span className="block text-[10px] font-black text-emerald-800 uppercase">SINAL DE ENTRADA (R$)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={valorTotalGeral}
                value={sinalManual}
                onChange={(e) => setSinalManual(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-emerald-400 rounded-lg p-1.5 text-lg font-black text-emerald-800 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                {valorTotalGeral > 0 ? `${Math.round((sinalManual / valorTotalGeral) * 100)}% do total` : '0%'}
              </span>
            </div>

            {/* Saldo Restante para Cobrar no Embarque */}
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl">
              <span className="block text-[10px] font-black text-amber-800 uppercase">SALDO A COBRAR NO EMBARQUE</span>
              <span className="text-2xl font-black text-amber-950 mt-1 block">
                {formatarMoeda(valorSaldoRestante)}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                Receber direto com o motorista
              </span>
            </div>

          </div>

          {/* Método de Pagamento do Sinal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Forma de Pagamento do Sinal *
              </label>
              <select
                value={formaPagtoSinal}
                onChange={(e) => setFormaPagtoSinal(e.target.value as FormaPagamento)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="pix">PIX (Chave da Empresa / QR Code)</option>
                <option value="cartao_credito">Cartão de Crédito (Balcão ou Link)</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro em Espécie (Caixa da Loja)</option>
                <option value="faturado_agencia">Faturado para Hotel / Agência Parceira</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Vendedor / Promotor (Comissão)
              </label>
              <select
                value={vendedorId}
                onChange={(e) => setVendedorId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.nome} ({v.comissaoPadraoPct}% comissão - {formatarMoeda(valorTotalGeral * (v.comissaoPadraoPct / 100))})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bloco 4: Escala de Motorista & Observações */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Car className="w-4 h-4 text-blue-600" />
            <span>4. Escala do Motorista & Observações do Voucher</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Escalar Motorista / Veículo (Opcional - pode escalar depois)
              </label>
              <select
                value={motoristaId}
                onChange={(e) => setMotoristaId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Deixar para a Central de Logística escalar</option>
                {motoristas.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nomeMotorista} • {m.veiculoModelo} ({m.placaOuRegistro})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Observações Especiais para o Voucher
              </label>
              <input
                type="text"
                value={observacoesVoucher}
                onChange={(e) => setObservacoesVoucher(e.target.value)}
                placeholder="Ex: Parada no Bar da Praia, levar toalhas e sapatilha..."
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botão de Finalização */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 text-base active:scale-98 cursor-pointer"
        >
          <Printer className="w-5 h-5" />
          <span>Confirmar Reserva e Gerar Voucher A4 (2 Vias)</span>
        </button>

      </form>

    </div>
  );
};
