/**
 * Geocodificação Reversa para converter Latitude e Longitude reais
 * em Endereço/Bairro/Cidade textual, preservando rigorosamente as coordenadas GPS.
 */

export async function obterEnderecoPorCoordenadas(lat: number, lng: number): Promise<{ localizacaoNome: string; regiao: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      const rua = addr.road || addr.pedestrian || addr.suburb || '';
      const bairro = addr.suburb || addr.neighbourhood || addr.city_district || '';
      const cidade = addr.city || addr.town || addr.village || addr.municipality || 'Ipojuca';
      const estado = addr.state_code || addr.state || 'PE';

      let localFormatado = '';
      if (rua && bairro && rua !== bairro) {
        localFormatado = `${rua}, ${bairro}`;
      } else if (rua || bairro) {
        localFormatado = rua || bairro;
      } else {
        localFormatado = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }

      const regiaoFormatada = `${cidade} / ${estado}`;

      return {
        localizacaoNome: `${localFormatado} - ${cidade}/${estado}`,
        regiao: regiaoFormatada
      };
    }
  } catch (err) {
    console.warn('Geocodificação reversa offline ou indisponível:', err);
  }

  // Fallback seguro se não houver internet: exibe as coordenadas precisas
  return {
    localizacaoNome: `Posição GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    regiao: 'Localização em Tempo Real'
  };
}
