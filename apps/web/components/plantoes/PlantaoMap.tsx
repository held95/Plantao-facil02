'use client';

import type { Plantao } from '@plantao/shared';

interface PlantaoMapProps {
  plantoes: Plantao[];
}

export default function PlantaoMap({ plantoes }: PlantaoMapProps) {
  const first = plantoes.find((p) => p.cidade && p.estado);
  if (!first) return null;

  const query = encodeURIComponent(`${first.hospital}, ${first.cidade}, ${first.estado}, Brasil`);
  const src = `https://maps.google.com/maps?q=${query}&output=embed&z=14`;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-6">
      <iframe
        title="Localização do plantão"
        src={src}
        className="h-[350px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
