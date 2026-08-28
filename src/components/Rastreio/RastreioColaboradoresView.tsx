import React, { useState, useMemo, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Radio, 
  Smartphone, 
  MapPin, 
  Car, 
  Users, 
  Phone, 
  MessageSquare, 
  Clock, 
  Search, 
  RefreshCw, 
  Copy, 
  AlertTriangle,
  Play,
  Pause,
  Compass,
  Crosshair,
  Wifi,
  WifiOff
} from 'lucide-react';
import { TelemetriaColaborador } from '../../types';
import { MapaLeaflet } from './MapaLeaflet';
import { obterEnderecoPorCoordenadas } from '../../utils/geocoding';

export type StatusConexaoCalculado = 'ativo' | 'desatualizado' | 'offline';

export const RastreioColaboradoresView: React.FC = () => {
  const { 
    telemetriaColaboradores, 
    atualizarTelemetriaColaborador, 
    solicitarPingCelular, 
    atualizarCoordenadasGPS,
    motoristas,
    vendedores,
    empresaConfig 
  } = useTurismo();

  // Tick para recalcular os timestamps em tempo real a cada 10 segundos
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Estados de busca e filtros
  const [buscaTelefoneOuNome, setBuscaTelefoneOuNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'desatualizado' | 'offline' | 'motoristas' | 'vendedores'>('todos');
  const [colaboradorSelecionadoId, setColaboradorSelecionadoId] = useState<string | null>(null);
  const [mapaModo, setMapaModo] = useState<'satelite' | 'vetorial'>('vetorial');

  // Estados de Modais
  const [modalManualAberto, setModalManualAberto] = useState(false);
  const [colaboradorParaManual, setColaboradorParaManual] = useState<TelemetriaColaborador | null>(null);
  const [novoPontoManual, setNovoPontoManual] = useState('');
  const [pingandoGeral, setPingandoGeral] = useState(false);
  const [capturandoGpsManual, setCapturandoGpsManual] = useState(false);

  // Estados de Rastreamento GPS Real do Dispositivo Atual
  const [rastreamentoAtivo, setRastreamentoAtivo] = useState(false);
  const [colaboradorDispositivoId, setColaboradorDispositivoId] = useState<string>(
    motoristas[0]?.id || telemetriaColaboradores[0]?.id || ''
  );
  const [permissaoNegada, setPermissaoNegada] = useState(false);
  const [erroGpsMensagem, setErroGpsMensagem] = useState<string | null>(null);
  const [dadosGpsAoVivo, setDadosGpsAoVivo] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    speed: number | null;
    timestamp: string;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Tentar capturar a posição real inicial do dispositivo via navigator.geolocation
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);
          const speedKmh = pos.coords.speed != null && !isNaN(pos.coords.speed) && pos.coords.speed >= 0
            ? Math.round(pos.coords.speed * 3.6)
            : null;

          const targetId = colaboradorDispositivoId || telemetriaColaboradores[0]?.id;
          if (targetId) {
            const agoraIso = new Date().toISOString();
            const enderecoInfo = await obterEnderecoPorCoordenadas(lat, lng);

            atualizarCoordenadasGPS(targetId, lat, lng, enderecoInfo.localizacaoNome);
            atualizarTelemetriaColaborador(targetId, {
              precisaoMetros: accuracy,
              velocidadeKmH: speedKmh,
              regiao: enderecoInfo.regiao,
              statusConexao: 'online_gps',
              ultimoPing: agoraIso
            });

            setDadosGpsAoVivo({
              lat,
              lng,
              accuracy,
              speed: speedKmh,
              timestamp: agoraIso
            });
          }
        },
        () => {
          // Permissão pendente de ação do usuário
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  /**
   * Lógica estrita de status de conexão baseada EXCLUSIVAMENTE no timestamp real da última atualização:
   * - Ativo: atualização recebida há menos de 2 minutos (< 120s) com coordenadas válidas.
   * - Desatualizado: última atualização entre 2 e 10 minutos (120s a 600s).
   * - Offline: mais de 10 minutos (> 600s) sem atualização OU sem nenhuma transmissão registrada.
   */
  const obterStatusConexaoReal = (colab: TelemetriaColaborador): {
    status: StatusConexaoCalculado;
    label: string;
    tempoFormatado: string;
    badgeClasses: string;
    dotClasses: string;
    corTexto: string;
  } => {
    if (!colab.ultimoPing || colab.latitude == null || colab.longitude == null) {
      return {
        status: 'offline',
        label: 'Offline',
        tempoFormatado: 'Sem transmissão recebida',
        badgeClasses: 'bg-slate-100 text-slate-700 border-slate-300',
        dotClasses: 'bg-slate-400',
        corTexto: 'text-slate-500'
      };
    }

    const dataPing = new Date(colab.ultimoPing);
    const timestampPing = dataPing.getTime();

    if (isNaN(timestampPing)) {
      return {
        status: 'offline',
        label: 'Offline',
        tempoFormatado: 'Data de transmissão inválida',
        badgeClasses: 'bg-red-50 text-red-700 border-red-200',
        dotClasses: 'bg-red-500',
        corTexto: 'text-red-600'
      };
    }

    const agora = Date.now();
    const diffSegundos = Math.max(0, Math.floor((agora - timestampPing) / 1000));

    if (diffSegundos < 120) {
      // Menos de 2 minutos -> ATIVO
      const tempoTexto = diffSegundos < 5 ? 'Agora mesmo' : `há ${diffSegundos}s`;
      return {
        status: 'ativo',
        label: 'Ativo',
        tempoFormatado: `Atualizado ${tempoTexto}`,
        badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dotClasses: 'bg-emerald-500 animate-pulse',
        corTexto: 'text-emerald-700'
      };
    } else if (diffSegundos < 600) {
      // Entre 2 e 10 minutos -> DESATUALIZADO
      const minutos = Math.floor(diffSegundos / 60);
      return {
        status: 'desatualizado',
        label: 'Desatualizado',
        tempoFormatado: `Última atualização há ${minutos} min`,
        badgeClasses: 'bg-amber-50 text-amber-800 border-amber-300',
        dotClasses: 'bg-amber-500',
        corTexto: 'text-amber-700'
      };
    } else {
      // Mais de 10 minutos -> OFFLINE
      const minutos = Math.floor(diffSegundos / 60);
      const tempoTexto = minutos >= 60 
        ? `há ${Math.floor(minutos / 60)}h ${minutos % 60}m` 
        : `há ${minutos} min`;

      return {
        status: 'offline',
        label: 'Offline',
        tempoFormatado: `Sem sinal (${tempoTexto})`,
        badgeClasses: 'bg-red-50 text-red-700 border-red-300',
        dotClasses: 'bg-red-500',
        corTexto: 'text-red-600'
      };
    }
  };

  // Filtragem de Colaboradores
  const colaboradoresFiltrados = useMemo(() => {
    const termo = buscaTelefoneOuNome.trim().toLowerCase();
    const digitosTermo = termo.replace(/\D/g, '');

    return telemetriaColaboradores.filter(c => {
      const statusInfo = obterStatusConexaoReal(c);

      // Filtro por status real
      if (filtroStatus === 'ativo' && statusInfo.status !== 'ativo') return false;
      if (filtroStatus === 'desatualizado' && statusInfo.status !== 'desatualizado') return false;
      if (filtroStatus === 'offline' && statusInfo.status !== 'offline') return false;
      if (filtroStatus === 'motoristas' && c.tipo !== 'motorista') return false;
      if (filtroStatus === 'vendedores' && c.tipo !== 'vendedor') return false;

      // Busca por telefone, nome, veículo ou local
      if (!termo) return true;

      const matchNome = c.nome.toLowerCase().includes(termo);
      const matchLocal = c.localizacaoNome.toLowerCase().includes(termo) || c.regiao.toLowerCase().includes(termo);
      const matchVeiculo = c.detalhesOperacao.veiculoOuPonto?.toLowerCase().includes(termo);
      const matchPlaca = c.detalhesOperacao.placaOuChave?.toLowerCase().includes(termo);
      
      const digitosColab = c.telefone.replace(/\D/g, '');
      const matchTelefone = digitosTermo ? digitosColab.includes(digitosTermo) : false;

      return matchNome || matchLocal || matchVeiculo || matchPlaca || matchTelefone;
    });
  }, [telemetriaColaboradores, buscaTelefoneOuNome, filtroStatus]);

  const colaboradorSelecionado = useMemo(() => {
    if (!colaboradorSelecionadoId) return colaboradoresFiltrados[0] || telemetriaColaboradores[0];
    return telemetriaColaboradores.find(c => c.id === colaboradorSelecionadoId) || colaboradoresFiltrados[0];
  }, [telemetriaColaboradores, colaboradorSelecionadoId, colaboradoresFiltrados]);

  // Estatísticas de Rastreamento Real
  const stats = useMemo(() => {
    const total = telemetriaColaboradores.length;
    let ativos = 0;
    let desatualizados = 0;
    let offlines = 0;

    telemetriaColaboradores.forEach(c => {
      const info = obterStatusConexaoReal(c);
      if (info.status === 'ativo') ativos++;
      else if (info.status === 'desatualizado') desatualizados++;
      else offlines++;
    });

    return { total, ativos, desatualizados, offlines };
  }, [telemetriaColaboradores]);

  // Iniciar Transmissão Contínua do GPS Real deste Dispositivo via API navigator.geolocation
  const handleIniciarRastreamentoDispositivo = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada por este navegador.');
      return;
    }

    setPermissaoNegada(false);
    setErroGpsMensagem(null);

    const targetColabId = colaboradorDispositivoId || telemetriaColaboradores[0]?.id;
    const colab = telemetriaColaboradores.find(c => c.id === targetColabId);
    const colabNome = colab ? colab.nome : 'Dispositivo';

    const loadToast = toast.loading('Solicitando coordenadas GPS reais em alta precisão...');

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        toast.dismiss(loadToast);
        setPermissaoNegada(false);
        setErroGpsMensagem(null);
        setRastreamentoAtivo(true);

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);
        const speedKmh = pos.coords.speed != null && !isNaN(pos.coords.speed) && pos.coords.speed >= 0
          ? Math.round(pos.coords.speed * 3.6)
          : null;

        const agoraIso = new Date().toISOString();

        setDadosGpsAoVivo({
          lat,
          lng,
          accuracy,
          speed: speedKmh,
          timestamp: agoraIso
        });

        // Obter endereço real baseado nas coordenadas GPS reais
        const enderecoInfo = await obterEnderecoPorCoordenadas(lat, lng);

        // Atualizar estado no contexto exclusivamente com base no timestamp e coordenadas reais
        atualizarCoordenadasGPS(
          targetColabId,
          lat,
          lng,
          enderecoInfo.localizacaoNome
        );

        atualizarTelemetriaColaborador(targetColabId, {
          precisaoMetros: accuracy,
          velocidadeKmH: speedKmh,
          regiao: enderecoInfo.regiao,
          statusConexao: 'online_gps',
          ultimoPing: agoraIso,
          detalhesOperacao: {
            ...colab?.detalhesOperacao,
            veiculoOuPonto: colab?.detalhesOperacao.veiculoOuPonto || 'Dispositivo Conectado',
            totalPassageirosOuVendasHoje: colab?.detalhesOperacao.totalPassageirosOuVendasHoje || 0,
            valorAcumuladoHoje: colab?.detalhesOperacao.valorAcumuladoHoje || 0,
            emMovimento: speedKmh != null && speedKmh > 5
          }
        });
      },
      (err) => {
        toast.dismiss(loadToast);
        setRastreamentoAtivo(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissaoNegada(true);
          setErroGpsMensagem('Permissão de localização negada.');
          toast.error('Para utilizar o rastreamento GPS, permita o acesso à sua localização neste dispositivo.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setErroGpsMensagem('Sinal GPS indisponível no momento.');
          toast.error('Sinal de satélite/GPS não localizado.');
        } else if (err.code === err.TIMEOUT) {
          setErroGpsMensagem('Tempo limite esgotado ao buscar sinal GPS.');
          toast.error('Tempo limite de GPS esgotado.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    );

    watchIdRef.current = watchId;
    toast.success(`Rastreamento GPS ativado para ${colabNome}!`, { icon: '🛰️' });
  };

  // Parar Transmissão GPS
  const handlePararRastreamento = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setRastreamentoAtivo(false);
    toast('Transmissão GPS do dispositivo pausada.', { icon: '⏸️' });
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Disparar Ping de solicitação
  const handlePingCelular = async (c: TelemetriaColaborador) => {
    const loadToast = toast.loading(`Enviando solicitação de sinal para ${c.telefone}...`);
    try {
      const res = await solicitarPingCelular(c.id);
      toast.dismiss(loadToast);
      if (res.sucesso) {
        toast.success(
          (t) => (
            <div>
              <span className="font-bold text-slate-900">{c.nome}</span>
              <p className="text-[11px] text-slate-600">{res.mensagem}</p>
            </div>
          ),
          { icon: '📡', duration: 4000 }
        );
      } else {
        toast.error(res.mensagem);
      }
    } catch {
      toast.dismiss(loadToast);
      toast.error('Falha ao conectar com o colaborador.');
    }
  };

  // Ping geral em todos os colaboradores
  const handlePingGeral = async () => {
    setPingandoGeral(true);
    const loadToast = toast.loading('Sincronizando sinal de toda a equipe...');
    
    for (const c of telemetriaColaboradores) {
      await solicitarPingCelular(c.id);
    }

    setPingandoGeral(false);
    toast.dismiss(loadToast);
    toast.success(`${telemetriaColaboradores.length} colaboradores consultados!`, {
      icon: '⚡'
    });
  };

  // Enviar link de check-in via WhatsApp
  const handleEnviarLinkWhatsapp = (c: TelemetriaColaborador) => {
    const numeroLimpo = c.telefone.replace(/\D/g, '');
    const linkCheckin = `${window.location.origin}/#rastreio?checkin=${c.id}&cel=${numeroLimpo}`;
    
    const mensagem = encodeURIComponent(
      `Olá *${c.nome}*! 👋\n\n` +
      `Aqui é da central de operações da *${empresaConfig.nomeFantasia}*.\n` +
      `Por favor, ative a transmissão de GPS do seu celular para acompanhar a rota clicando no link abaixo:\n\n` +
      `🔗 ${linkCheckin}\n\n` +
      `_Mantenha o navegador aberto para transmitir a localização real do veículo._`
    );

    window.open(`https://wa.me/55${numeroLimpo}?text=${mensagem}`, '_blank');
    toast.success(`Link de check-in GPS enviado para o WhatsApp de ${c.nome}!`, { icon: '📲' });
  };

  // Capturar coordenadas reais atuais do dispositivo para um colaborador específico
  const handleCapturarGpsDispositivoParaColaborador = () => {
    if (!navigator.geolocation || !colaboradorParaManual) {
      toast.error('Geolocalização não suportada ou colaborador não selecionado.');
      return;
    }

    setCapturandoGpsManual(true);
    const loadToast = toast.loading('Acessando sensor GPS do dispositivo...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        toast.dismiss(loadToast);
        setCapturandoGpsManual(false);

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);
        const speedKmh = pos.coords.speed != null && !isNaN(pos.coords.speed) && pos.coords.speed >= 0
          ? Math.round(pos.coords.speed * 3.6)
          : null;

        const enderecoInfo = await obterEnderecoPorCoordenadas(lat, lng);
        const agoraIso = new Date().toISOString();

        atualizarCoordenadasGPS(colaboradorParaManual.id, lat, lng, enderecoInfo.localizacaoNome);
        atualizarTelemetriaColaborador(colaboradorParaManual.id, {
          precisaoMetros: accuracy,
          velocidadeKmH: speedKmh,
          regiao: enderecoInfo.regiao,
          statusConexao: 'online_gps',
          ultimoPing: agoraIso
        });

        toast.success(`Localização real do dispositivo atribuída a ${colaboradorParaManual.nome}!`, { icon: '📍' });
        setModalManualAberto(false);
      },
      (err) => {
        toast.dismiss(loadToast);
        setCapturandoGpsManual(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Permissão de GPS negada. Permita o acesso à localização no navegador.');
        } else {
          toast.error('Não foi possível obter a posição GPS do dispositivo.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  const handleSalvarDescricaoManual = () => {
    if (!colaboradorParaManual || !novoPontoManual.trim()) return;

    atualizarTelemetriaColaborador(colaboradorParaManual.id, {
      localizacaoNome: novoPontoManual.trim(),
      ultimoPing: new Date().toISOString()
    });

    toast.success(`Descrição do local de ${colaboradorParaManual.nome} atualizada: ${novoPontoManual}`, { icon: '📝' });
    setModalManualAberto(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Monitoramento e Rastreio */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Rastreamento GPS em Tempo Real
                {stats.ativos > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    {stats.ativos} Dispositivo{stats.ativos > 1 ? 's' : ''} Ativo{stats.ativos > 1 ? 's' : ''}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500">
                Status de conexão calculado rigorosamente a partir do timestamp real da última atualização recebida pelo sensor GPS.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePingGeral}
            disabled={pingandoGeral}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Solicitar atualização de sinal de toda a frota"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pingandoGeral ? 'animate-spin' : ''}`} />
            <span>Consultar Frota</span>
          </button>
        </div>
      </div>

      {/* PAINEL DE CONTROLE: Rastreamento GPS Real via navigator.geolocation */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white p-5 rounded-2xl border border-blue-800/80 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${rastreamentoAtivo ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`}></span>
              <h3 className="text-sm font-black uppercase tracking-wider text-blue-200">
                Transmissão GPS do Smartphone / Dispositivo
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Ative a transmissão no seu smartphone para posicionar o veículo/colaborador no mapa com base exclusivamente nas coordenadas de latitude e longitude reais do seu sensor GPS.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select
              value={colaboradorDispositivoId}
              onChange={(e) => setColaboradorDispositivoId(e.target.value)}
              disabled={rastreamentoAtivo}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="Motoristas & Veículos">
                {motoristas.map(m => (
                  <option key={m.id} value={m.id}>
                    🚗 {m.nomeMotorista} ({m.veiculoModelo})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Promotores & Vendedores">
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>
                    👤 {v.nome}
                  </option>
                ))}
              </optgroup>
            </select>

            {rastreamentoAtivo ? (
              <button
                onClick={handlePararRastreamento}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>Pausar Transmissão GPS</span>
              </button>
            ) : (
              <button
                onClick={handleIniciarRastreamentoDispositivo}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4" />
                <span>Iniciar Rastreamento GPS</span>
              </button>
            )}
          </div>
        </div>

        {/* Alerta de Permissão Negada */}
        {permissaoNegada && (
          <div className="mt-4 bg-amber-500/20 border border-amber-500/50 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Para utilizar o rastreamento GPS, permita o acesso à sua localização neste dispositivo.</strong>
              <span>Clique no ícone de permissões/cadeado na barra de endereços do navegador e autorize o acesso à "Localização".</span>
            </div>
          </div>
        )}

        {/* Status ao Vivo do GPS do Aparelho */}
        {rastreamentoAtivo && dadosGpsAoVivo && (
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">COORDENADAS REAIS (GPS)</span>
              <span className="font-mono text-emerald-400 font-bold">
                {dadosGpsAoVivo.lat.toFixed(6)}, {dadosGpsAoVivo.lng.toFixed(6)}
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">PRECISÃO DO SENSOR</span>
              <span className="text-slate-200 font-bold">
                ±{dadosGpsAoVivo.accuracy} metros
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">VELOCIDADE REAL</span>
              <span className="text-cyan-300 font-bold">
                {dadosGpsAoVivo.speed != null ? `${dadosGpsAoVivo.speed} km/h` : 'Velocidade não disponível'}
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">ÚLTIMO TIMESTAMP</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-emerald-400" />
                {new Date(dadosGpsAoVivo.timestamp).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cards de Métricas Operacionais com Status Real */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Cadastrado</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-slate-900">{stats.total}</span>
            <span className="text-[10px] text-slate-500">dispositivos</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Ativo (&lt; 2 min)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-emerald-700">{stats.ativos}</span>
            <span className="text-[10px] text-emerald-600">em tempo real</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Desatualizado (2-10 min)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-amber-700">{stats.desatualizados}</span>
            <span className="text-[10px] text-amber-600">sinal recente</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-xs bg-red-50/20">
          <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Offline (&gt; 10 min)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-red-700">{stats.offlines}</span>
            <span className="text-[10px] text-red-600">sem transmissão</span>
          </div>
        </div>
      </div>

      {/* Grid Principal: Mapa Georreferenciado Real + Lista de Colaboradores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Mapa Interativo Leaflet */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-4 text-white relative overflow-hidden flex flex-col min-h-[520px]">
            {/* Top Bar do Mapa */}
            <div className="flex items-center justify-between mb-3 z-10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-slate-200">Mapa Georreferenciado Real</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {colaboradoresFiltrados.length} listados
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMapaModo(mapaModo === 'vetorial' ? 'satelite' : 'vetorial')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-700 transition-all cursor-pointer"
                >
                  {mapaModo === 'vetorial' ? '🗺️ Vetorial (OSM)' : '🛰️ Satélite'}
                </button>
              </div>
            </div>

            {/* Componente Leaflet com Coordenadas Reais */}
            <MapaLeaflet
              colaboradores={colaboradoresFiltrados}
              colaboradorSelecionado={colaboradorSelecionado}
              onSelecionarColaborador={(id) => setColaboradorSelecionadoId(id)}
              mapaModo={mapaModo}
            />

            {/* Painel Inferior de Detalhes do Colaborador Selecionado */}
            {colaboradorSelecionado && (
              <div className="mt-3 bg-slate-800/90 border border-slate-700 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                    colaboradorSelecionado.tipo === 'motorista' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    {colaboradorSelecionado.tipo === 'motorista' ? <Car className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{colaboradorSelecionado.nome}</span>
                      <span className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 text-[11px]">
                        📱 {colaboradorSelecionado.telefone}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{colaboradorSelecionado.localizacaoNome}</span>
                    </p>
                  </div>
                </div>

                {/* Métricas do Dispositivo */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Status Conexão</span>
                    {(() => {
                      const st = obterStatusConexaoReal(colaboradorSelecionado);
                      return (
                        <span className={`font-bold text-[11px] flex items-center gap-1 justify-end ${
                          st.status === 'ativo' ? 'text-emerald-400' : st.status === 'desatualizado' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dotClasses}`}></span>
                          {st.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Velocidade</span>
                    <span className="font-bold text-slate-200 text-[11px]">
                      {colaboradorSelecionado.velocidadeKmH != null ? `${colaboradorSelecionado.velocidadeKmH} km/h` : 'Não disponível'}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePingCelular(colaboradorSelecionado)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ping</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Lista Detalhada de Colaboradores */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              Colaboradores ({colaboradoresFiltrados.length})
            </h2>
            <span className="text-[11px] text-slate-500">Clique para centralizar no mapa</span>
          </div>

          {/* Filtros de Status Real */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filtroStatus === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({telemetriaColaboradores.length})
            </button>

            <button
              onClick={() => setFiltroStatus('ativo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filtroStatus === 'ativo' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Ativos ({stats.ativos})
            </button>

            <button
              onClick={() => setFiltroStatus('desatualizado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filtroStatus === 'desatualizado' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Desatualizados ({stats.desatualizados})
            </button>

            <button
              onClick={() => setFiltroStatus('offline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filtroStatus === 'offline' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              Offline ({stats.offlines})
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={buscaTelefoneOuNome}
              onChange={(e) => setBuscaTelefoneOuNome(e.target.value)}
              placeholder="Buscar por nome, celular, veículo ou local..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          {/* Lista de Cards de Colaboradores */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {colaboradoresFiltrados.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Nenhum colaborador encontrado com este filtro.</p>
                <button
                  onClick={() => { setBuscaTelefoneOuNome(''); setFiltroStatus('todos'); }}
                  className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              colaboradoresFiltrados.map((colab) => {
                const isSelected = colaboradorSelecionado?.id === colab.id;
                const isDriver = colab.tipo === 'motorista';
                const statusInfo = obterStatusConexaoReal(colab);

                return (
                  <div
                    key={colab.id}
                    onClick={() => setColaboradorSelecionadoId(colab.id)}
                    className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:border-blue-400 ${
                      isSelected 
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Topo do Card: Nome, Função e Status de Conexão */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                          isDriver ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isDriver ? <Car className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-bold text-slate-900">{colab.nome}</h3>
                            <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                              isDriver ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isDriver ? 'Motorista / Guia' : 'Promotor / Vendas'}
                            </span>
                          </div>

                          {/* Destaque do Celular / WhatsApp */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-blue-600" />
                              {colab.telefone}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(colab.telefone);
                                toast.success(`Telefone ${colab.telefone} copiado!`, { icon: '📋' });
                              }}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                              title="Copiar número de telefone"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Status de Conexão Baseado Estritamente no Timestamp */}
                      <div className="text-right shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClasses}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClasses}`}></span>
                          {statusInfo.label}
                        </span>
                        
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{statusInfo.tempoFormatado}</span>
                        </p>
                      </div>
                    </div>

                    {/* Localização Atual e Dados */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-800">{colab.localizacaoNome}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                        <span>
                          {isDriver ? 'Veículo: ' : 'Ponto: '}
                          <strong className="text-slate-700">{colab.detalhesOperacao.veiculoOuPonto}</strong>
                        </span>

                        <span className="font-mono font-bold text-blue-700">
                          {colab.velocidadeKmH != null ? `🚙 ${colab.velocidadeKmH} km/h` : 'Velocidade não disp.'}
                        </span>
                      </div>

                      {colab.latitude != null && colab.longitude != null ? (
                        <p className="text-[10px] font-mono text-emerald-700 font-bold">
                          🛰️ GPS Real: {colab.latitude.toFixed(6)}, {colab.longitude.toFixed(6)} {colab.precisaoMetros != null ? `(±${colab.precisaoMetros}m)` : ''}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400">
                          Aguardando primeiras coordenadas do smartphone
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação por Colaborador */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnviarLinkWhatsapp(colab);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Enviar link de check-in via WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        <a
                          href={`tel:${colab.telefone.replace(/\D/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-600" />
                          <span>Ligar</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setColaboradorParaManual(colab);
                            setNovoPontoManual(colab.localizacaoNome);
                            setModalManualAberto(true);
                          }}
                          className="text-slate-600 hover:text-blue-700 text-[11px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          Definir Ponto
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePingCelular(colab);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Ping</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Atualizar Ponto ou Capturar GPS Real do Dispositivo */}
      {modalManualAberto && colaboradorParaManual && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Localização de {colaboradorParaManual.nome}
                </h3>
              </div>
              <button
                onClick={() => setModalManualAberto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              {/* Opção 1: Captura Real via Sensor GPS */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-900 text-xs">Capturar GPS Real Deste Dispositivo</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Lê as coordenadas de latitude e longitude diretamente da API <code>navigator.geolocation</code> do aparelho atual e associa a este colaborador com timestamp em tempo real.
                </p>
                <button
                  type="button"
                  onClick={handleCapturarGpsDispositivoParaColaborador}
                  disabled={capturandoGpsManual}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${capturandoGpsManual ? 'animate-spin' : ''}`} />
                  <span>{capturandoGpsManual ? 'Lendo satélites GPS...' : 'Usar GPS Real do Aparelho'}</span>
                </button>
              </div>

              {/* Opção 2: Descrição Textual de Ponto de Apoio */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Ou informe a descrição do local/ponto:</label>
                <input
                  type="text"
                  value={novoPontoManual}
                  onChange={(e) => setNovoPontoManual(e.target.value)}
                  placeholder="Ex: Recepção Hotel Solar / Ponto Centro"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalManualAberto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarDescricaoManual}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-xs cursor-pointer"
                >
                  Salvar Descrição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
