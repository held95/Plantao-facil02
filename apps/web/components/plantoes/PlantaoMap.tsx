// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import type { Plantao } from '@plantao/shared';
import { formatDate, getStatusDisplay } from '@plantao/shared';

// Cores por status
const STATUS_COLORS: Record<string, string> = {
  aberto: '#22c55e',
  futuro: '#3b82f6',
  fechado: '#9ca3af',
};

function createPinIcon(color: string): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

function FitBounds({ plantoes }: { plantoes: Plantao[] }) {
  const map = useMap();

  useEffect(() => {
    const withCoords = plantoes.filter((p) => p.latitude != null && p.longitude != null);
    if (withCoords.length === 0) return;

    const bounds = L.latLngBounds(
      withCoords.map((p) => [p.latitude!, p.longitude!] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }, [map, plantoes]);

  return null;
}

interface PlantaoMapProps {
  plantoes: Plantao[];
}

export default function PlantaoMap({ plantoes }: PlantaoMapProps) {
  const withCoords = plantoes.filter((p) => p.latitude != null && p.longitude != null);

  return (
    <MapContainer
      center={[-23.5505, -46.6333]}
      zoom={9}
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds plantoes={withCoords} />

      {withCoords.map((plantao) => {
        const statusDisplay = getStatusDisplay(plantao);
        const color = STATUS_COLORS[statusDisplay] ?? '#6b7280';
        const icon = createPinIcon(color);

        return (
          <Marker
            key={plantao.id}
            position={[plantao.latitude!, plantao.longitude!]}
            icon={icon}
          >
            <Popup minWidth={220}>
              <div className="text-sm space-y-1">
                <p className="font-semibold text-gray-900 text-base leading-snug">
                  {plantao.hospital}
                </p>
                <p className="text-gray-600">{plantao.especialidade}</p>
                <p className="text-gray-600">{formatDate(plantao.data)}</p>
                <p className="font-medium text-gray-800">
                  R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-gray-500 text-xs">
                  {plantao.vagasDisponiveis}/{plantao.vagasTotal} vagas
                </p>
                <Link
                  href={`/plantoes/${plantao.id}`}
                  className="block mt-2 text-center text-white bg-slate-700 hover:bg-slate-800 rounded px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  Ver detalhes
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
