import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TelemetriaColaborador } from '../../types';

// Ícones customizados do Leaflet para motoristas e promotores baseados no status real de conexão
const criarIconeLeaflet = (
  tipo: 'motorista' | 'vendedor', 
  statusConexao: 'ativo' | 'desatualizado' | 'offline', 
  isSelected: boolean, 
  veiculoNome?: string
) => {
  const isLancha = veiculoNome?.toLowerCase().includes('lancha') || veiculoNome?.toLowerCase().includes('catamarã');
  
  // Cores do marcador de acordo com o status real de transmissão
  const corBg = statusConexao === 'ativo' 
    ? (tipo === 'motorista' ? '#2563eb' : '#059669') 
    : statusConexao === 'desatualizado'
    ? '#d97706'
    : '#64748b';

  const dotCor = statusConexao === 'ativo' 
    ? '#10b981' 
    : statusConexao === 'desatualizado' 
    ? '#f59e0b' 
    : '#ef4444';

  const iconeEmoji = isLancha ? '⛵' : tipo === 'motorista' ? '🚗' : '👤';
  const pulseClass = statusConexao === 'ativo' ? 'animate-pulse' : '';
  const selectedBorder = isSelected ? 'border-white ring-4 ring-blue-500 scale-125 z-50' : 'border-white';

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
      ${statusConexao === 'ativo' ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${corBg}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="background-color: ${corBg}; width: 34px; height: 34px; border-radius: 9999px; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); transition: transform 0.2s;" class="${selectedBorder} ${pulseClass}">
        ${iconeEmoji}
      </div>
      <div style="position: absolute; bottom: -2px; right: -2px; width: 11px; height: 11px; border-radius: 9999px; border: 2px solid white; background-color: ${dotCor};"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

interface MapaLeafletProps {
  colaboradores: TelemetriaColaborador[];
  colaboradorSelecionado: TelemetriaColaborador | null;
  onSelecionarColaborador: (id: string) => void;
  mapaModo: 'vetorial' | 'satelite';
}

export const MapaLeaflet: React.FC<MapaLeafletProps> = ({
  colaboradores,
  colaboradorSelecionado,
  onSelecionarColaborador,
  mapaModo
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // Filtrar colaboradores que possuem exclusivamente coordenadas GPS reais válidas
  const colaboradoresComGps = colaboradores.filter(
    c => c.latitude != null && 
         c.longitude != null && 
         typeof c.latitude === 'number' && 
         typeof c.longitude === 'number' &&
         !isNaN(c.latitude) && 
         !isNaN(c.longitude) &&
         isFinite(c.latitude) &&
         isFinite(c.longitude)
  );

  // Filtrar motoristas ativos com base no timestamp real (< 2 min) e coordenadas GPS reais
  const motoristasAtivosComGps = colaboradoresComGps.filter(c => {
    if (c.tipo !== 'motorista' || !c.ultimoPing) return false;
    const diffMs = Date.now() - new Date(c.ultimoPing).getTime();
    return !isNaN(diffMs) && diffMs >= 0 && diffMs < 120000; // menor que 2 minutos (120 segundos)
  });

  // Outros colaboradores ativos (promotores/vendedores)
  const outrosAtivosComGps = colaboradoresComGps.filter(c => {
    if (c.tipo === 'motorista' || !c.ultimoPing) return false;
    const diffMs = Date.now() - new Date(c.ultimoPing).getTime();
    return !isNaN(diffMs) && diffMs >= 0 && diffMs < 120000;
  });

  // Inicializar o Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Já inicializado

    let centroInicial: [number, number] | null = null;

    // Prioridade 1: Motoristas ativos com coordenadas GPS reais
    if (motoristasAtivosComGps.length > 0) {
      centroInicial = [motoristasAtivosComGps[0].latitude!, motoristasAtivosComGps[0].longitude!];
    } else if (colaboradorSelecionado?.latitude != null && colaboradorSelecionado?.longitude != null) {
      // Prioridade 2: Colaborador selecionado
      centroInicial = [colaboradorSelecionado.latitude, colaboradorSelecionado.longitude];
    } else if (colaboradoresComGps.length > 0) {
      // Prioridade 3: Primeiro colaborador com coordenadas reais
      centroInicial = [colaboradoresComGps[0].latitude!, colaboradoresComGps[0].longitude!];
    }

    // Inicializa o mapa
    const map = L.map(mapContainerRef.current, {
      center: centroInicial || [0, 0],
      zoom: centroInicial ? 15 : 2,
      zoomControl: false,
      attributionControl: false
    });

    // Se ainda não houver centro inicial, consulta o sensor GPS do dispositivo
    if (!centroInicial && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([pos.coords.latitude, pos.coords.longitude], 15);
          }
        },
        () => {
          // Permissão pendente
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    // Adicionar controle de zoom
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Atualizar Tile Layer quando mapaModo muda
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let maxZoom = 19;

    if (mapaModo === 'satelite') {
      // Imagem Satélite de alta resolução
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
    }

    const subLayer = L.tileLayer(url, {
      maxZoom,
      subdomains: mapaModo === 'satelite' ? [] : ['a', 'b', 'c']
    });

    subLayer.addTo(map);
    tileLayerRef.current = subLayer;
  }, [mapaModo]);

  // Atualizar Marcadores no Mapa com base exclusivamente no timestamp real e coordenadas do GPS
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remover marcadores antigos que não possuem mais coordenadas válidas
    Object.keys(markersRef.current).forEach(id => {
      if (!colaboradoresComGps.find(c => c.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    colaboradoresComGps.forEach(colab => {
      const lat = colab.latitude!;
      const lng = colab.longitude!;
      const latLng: [number, number] = [lat, lng];

      // Calcular status real de conexão baseado estritamente no timestamp real
      let statusConexao: 'ativo' | 'desatualizado' | 'offline' = 'offline';
      let tempoDescricao = 'Sem transmissão registrada';
      let statusBadgeHtml = '';

      if (colab.ultimoPing) {
        const diffMs = Date.now() - new Date(colab.ultimoPing).getTime();
        const diffSec = Math.max(0, Math.floor(diffMs / 1000));

        if (diffSec < 120) {
          statusConexao = 'ativo';
          tempoDescricao = diffSec < 5 ? 'agora mesmo' : `há ${diffSec}s`;
          statusBadgeHtml = `<span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; background-color: #dcfce7; color: #166534;">🟢 ATIVO</span>`;
        } else if (diffSec < 600) {
          statusConexao = 'desatualizado';
          tempoDescricao = `há ${Math.floor(diffSec / 60)} min`;
          statusBadgeHtml = `<span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; background-color: #fef3c7; color: #92400e;">🟡 DESATUALIZADO</span>`;
        } else {
          statusConexao = 'offline';
          const min = Math.floor(diffSec / 60);
          tempoDescricao = min >= 60 ? `há ${Math.floor(min / 60)}h` : `há ${min} min`;
          statusBadgeHtml = `<span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; background-color: #fee2e2; color: #991b1b;">🔴 OFFLINE</span>`;
        }
      } else {
        statusBadgeHtml = `<span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; background-color: #f1f5f9; color: #475569;">⚪ OFFLINE</span>`;
      }

      const isSelected = colaboradorSelecionado?.id === colab.id;
      const icone = criarIconeLeaflet(colab.tipo, statusConexao, isSelected, colab.detalhesOperacao?.veiculoOuPonto);

      const velocidadeTexto = colab.velocidadeKmH != null 
        ? `${colab.velocidadeKmH} km/h` 
        : 'Velocidade não disponível';

      const precisaoTexto = colab.precisaoMetros != null 
        ? `±${colab.precisaoMetros}m` 
        : 'Margem não informada';

      const dataFormatada = colab.ultimoPing 
        ? new Date(colab.ultimoPing).toLocaleTimeString('pt-BR') 
        : 'Sem registro';

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 210px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            <strong style="font-size: 13px; color: #0f172a;">${colab.nome}</strong>
            ${statusBadgeHtml}
          </div>
          <div style="font-size: 11px; color: #334155; line-height: 1.5;">
            <p style="margin: 0;"><strong>Veículo/Ponto:</strong> ${colab.detalhesOperacao.veiculoOuPonto || 'Ponto de Apoio'}</p>
            <p style="margin: 0;"><strong>Local Real:</strong> ${colab.localizacaoNome}</p>
            <p style="margin: 0;"><strong>Coordenadas GPS Reais:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
            <p style="margin: 0;"><strong>Precisão do Sensor:</strong> ${precisaoTexto}</p>
            <p style="margin: 0;"><strong>Velocidade:</strong> ${velocidadeTexto}</p>
            <p style="margin: 3px 0 0 0; font-size: 10px; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 3px;">
              <strong>Última atualização:</strong> ${dataFormatada} (${tempoDescricao})
            </p>
          </div>
        </div>
      `;

      if (markersRef.current[colab.id]) {
        const marker = markersRef.current[colab.id];
        marker.setLatLng(latLng);
        marker.setIcon(icone);
        marker.getPopup()?.setContent(popupContent);
      } else {
        const marker = L.marker(latLng, { icon: icone }).addTo(map);
        marker.bindPopup(popupContent);
        marker.on('click', () => {
          onSelecionarColaborador(colab.id);
        });
        markersRef.current[colab.id] = marker;
      }
    });

    // LÓGICA DE CENTRALIZAÇÃO AUTOMÁTICA EXCLUSIVA VIA COORDENADAS GPS REAIS:
    // 1. Se há um colaborador explicitamente selecionado com GPS real:
    if (colaboradorSelecionado?.latitude != null && colaboradorSelecionado?.longitude != null) {
      map.flyTo([colaboradorSelecionado.latitude, colaboradorSelecionado.longitude], 16, {
        duration: 0.8
      });
      markersRef.current[colaboradorSelecionado.id]?.openPopup();
    } 
    // 2. Caso contrário, centralizar automaticamente na localização real dos motoristas ativos:
    else if (motoristasAtivosComGps.length > 0) {
      if (motoristasAtivosComGps.length === 1) {
        map.flyTo([motoristasAtivosComGps[0].latitude!, motoristasAtivosComGps[0].longitude!], 15, {
          duration: 0.8
        });
        markersRef.current[motoristasAtivosComGps[0].id]?.openPopup();
      } else {
        const boundsMotoristas = L.latLngBounds(
          motoristasAtivosComGps.map(m => [m.latitude!, m.longitude!] as [number, number])
        );
        map.fitBounds(boundsMotoristas, { padding: [50, 50], maxZoom: 16 });
      }
    } 
    // 3. Caso não haja motoristas ativos, verificar outros colaboradores ativos:
    else if (outrosAtivosComGps.length > 0) {
      const boundsAtivos = L.latLngBounds(
        outrosAtivosComGps.map(o => [o.latitude!, o.longitude!] as [number, number])
      );
      map.fitBounds(boundsAtivos, { padding: [50, 50], maxZoom: 16 });
    }
    // 4. Caso geral: enquadrar todos os pontos com GPS real
    else if (colaboradoresComGps.length > 0) {
      const boundsGeral = L.latLngBounds(
        colaboradoresComGps.map(c => [c.latitude!, c.longitude!] as [number, number])
      );
      map.fitBounds(boundsGeral, { padding: [50, 50], maxZoom: 15 });
    }
  }, [colaboradores, colaboradorSelecionado]);

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-700 select-none">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Overlay exibido quando não há coordenadas GPS reais recebidas ainda */}
      {colaboradoresComGps.length === 0 && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mb-3 border border-slate-700">
            <span className="text-2xl">📡</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1">
            Nenhuma localização GPS válida disponível no momento.
          </h4>
          <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
            Inicie a transmissão GPS no painel superior ou envie o link de check-in via WhatsApp para os motoristas e vendedores.
          </p>
        </div>
      )}
    </div>
  );
};
