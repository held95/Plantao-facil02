const NOMINATIM_UA = 'PlantaoFacil/1.0 (contato@plantaofacil.com.br)';

export async function geocode(
  cep: string | undefined,
  cidade: string,
  estado: string,
): Promise<{ latitude?: number; longitude?: number }> {
  const headers = { 'User-Agent': NOMINATIM_UA };

  try {
    const digits = cep?.replace(/\D/g, '') ?? '';

    if (digits.length === 8) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${digits}&country=BR&format=json&limit=1`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        if (data[0]) {
          return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
        }
      }
    }

    // Fallback: cidade + estado (CEPs brasileiros raramente estão indexados no Nominatim)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${cidade}, ${estado}, Brasil`)}&format=json&limit=1`,
      { headers },
    );
    if (res.ok) {
      const data = await res.json();
      if (data[0]) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
      }
    }
  } catch {
    // silent fail — não bloqueia a criação do plantão
  }

  return {};
}
