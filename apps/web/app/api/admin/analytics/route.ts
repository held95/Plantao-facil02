import { NextRequest, NextResponse } from 'next/server';
import { requireCoordinator, plantaoRepository, authUserRepository, documentRepository } from '@plantao/backend';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireCoordinator();
    if (error) return error;

    const [plantoes, users, docs] = await Promise.all([
      plantaoRepository.listPlantoes(),
      authUserRepository.listAllActiveUsers(),
      documentRepository.listUploadedAfter(new Date(0).toISOString()),
    ]);

    const totalPlantoes = plantoes.length;
    const plantoesDisponiveis = plantoes.filter((p) => p.status === 'disponivel').length;
    const plantoesPreenchidos = plantoes.filter((p) => p.status === 'preenchido').length;
    const plantoesCancelados = plantoes.filter((p) => p.status === 'cancelado').length;

    const totalMedicos = users.filter((u) => u.role === 'medico').length;
    const totalCoordenadores = users.filter((u) => u.role === 'coordenador').length;

    const totalDocumentos = docs.length;

    // Coverage by hospital
    const byHospital: Record<string, { total: number; preenchidos: number }> = {};
    for (const p of plantoes) {
      if (!byHospital[p.hospital]) {
        byHospital[p.hospital] = { total: 0, preenchidos: 0 };
      }
      byHospital[p.hospital].total++;
      if (p.status === 'preenchido') byHospital[p.hospital].preenchidos++;
    }

    const coberturaHospitais = Object.entries(byHospital).map(([hospital, data]) => ({
      hospital,
      total: data.total,
      preenchidos: data.preenchidos,
      taxaCobertura: data.total > 0 ? Math.round((data.preenchidos / data.total) * 100) : 0,
    }));

    // By specialty
    const byEspecialidade: Record<string, number> = {};
    for (const p of plantoes) {
      byEspecialidade[p.especialidade] = (byEspecialidade[p.especialidade] || 0) + 1;
    }

    return NextResponse.json({
      plantoes: {
        total: totalPlantoes,
        disponiveis: plantoesDisponiveis,
        preenchidos: plantoesPreenchidos,
        cancelados: plantoesCancelados,
      },
      usuarios: {
        total: users.length,
        medicos: totalMedicos,
        coordenadores: totalCoordenadores,
      },
      documentos: {
        total: totalDocumentos,
      },
      coberturaHospitais: coberturaHospitais.slice(0, 10),
      byEspecialidade,
    });
  } catch (err) {
    console.error('[analytics/GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar analytics' }, { status: 500 });
  }
}
