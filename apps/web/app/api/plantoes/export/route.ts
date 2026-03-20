import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, plantaoRepository } from '@plantao/backend';
import type { Plantao } from '@plantao/shared';

function toCSV(plantoes: Plantao[]): string {
  const header = [
    'ID',
    'Hospital',
    'Especialidade',
    'Data',
    'Horario Inicio',
    'Horario Fim',
    'Valor',
    'Status',
    'Vagas Disponiveis',
    'Vagas Total',
    'Cidade',
    'Estado',
  ].join(',');

  const rows = plantoes.map((p) =>
    [
      p.id,
      `"${p.hospital.replace(/"/g, '""')}"`,
      `"${p.especialidade.replace(/"/g, '""')}"`,
      p.data,
      p.horarioInicio,
      p.horarioFim,
      p.valor,
      p.status,
      p.vagasDisponiveis,
      p.vagasTotal,
      `"${p.cidade.replace(/"/g, '""')}"`,
      p.estado,
    ].join(',')
  );

  return [header, ...rows].join('\n');
}

function toHTML(plantoes: Plantao[]): string {
  const rows = plantoes
    .map(
      (p) => `
    <tr>
      <td>${p.hospital}</td>
      <td>${p.especialidade}</td>
      <td>${p.data}</td>
      <td>${p.horarioInicio} - ${p.horarioFim}</td>
      <td>R$ ${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td>${p.status}</td>
      <td>${p.vagasDisponiveis}/${p.vagasTotal}</td>
      <td>${p.cidade} - ${p.estado}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Escala de Plantoes</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  th { background: #374151; color: white; }
  tr:nth-child(even) { background: #f9fafb; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h2>Escala de Plantoes</h2>
<p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
<table>
<thead>
  <tr>
    <th>Hospital</th>
    <th>Especialidade</th>
    <th>Data</th>
    <th>Horario</th>
    <th>Valor</th>
    <th>Status</th>
    <th>Vagas</th>
    <th>Local</th>
  </tr>
</thead>
<tbody>
${rows}
</tbody>
</table>
</body>
</html>`;
}

// GET /api/plantoes/export?format=csv|html
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') ?? 'csv';

    const plantoes = await plantaoRepository.listPlantoes();

    if (format === 'html') {
      const html = toHTML(plantoes);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': 'inline; filename="escala-plantoes.html"',
        },
      });
    }

    const csv = toCSV(plantoes);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="escala-plantoes.csv"',
      },
    });
  } catch (err) {
    console.error('[plantoes/export/GET]', err);
    return NextResponse.json({ error: 'Erro ao exportar plantoes' }, { status: 500 });
  }
}
