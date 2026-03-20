import { NextRequest, NextResponse } from 'next/server';
import { requireCoordinator, plantaoRepository } from '@plantao/backend';
import type { Plantao, RecurrenceRule } from '@plantao/shared';

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]!;
}

function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0]!;
}

// POST /api/plantoes/recorrentes — create a batch of recurring plantoes
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireCoordinator();
    if (error) return error;

    const body = await request.json();
    const { plantaoBase, recurrenceRule }: { plantaoBase: Partial<Plantao>; recurrenceRule: RecurrenceRule } = body;

    if (!plantaoBase || !recurrenceRule) {
      return NextResponse.json(
        { error: 'plantaoBase e recurrenceRule sao obrigatorios' },
        { status: 400 }
      );
    }

    const { frequency, occurrences } = recurrenceRule;
    if (!frequency || !occurrences || occurrences < 2 || occurrences > 52) {
      return NextResponse.json(
        { error: 'recurrenceRule invalida. occurrences deve ser entre 2 e 52.' },
        { status: 400 }
      );
    }

    const recurrenceId = crypto.randomUUID();
    const plantoes: Plantao[] = [];

    for (let i = 0; i < occurrences; i++) {
      let data: string;
      if (i === 0) {
        data = plantaoBase.data!;
      } else if (frequency === 'semanal') {
        data = addDays(plantaoBase.data!, i * 7);
      } else {
        data = addMonths(plantaoBase.data!, i);
      }

      const plantao: Plantao = {
        id: crypto.randomUUID(),
        hospital: plantaoBase.hospital!,
        especialidade: plantaoBase.especialidade!,
        data,
        horarioInicio: plantaoBase.horarioInicio!,
        horarioFim: plantaoBase.horarioFim!,
        valor: plantaoBase.valor!,
        status: 'disponivel',
        descricao: plantaoBase.descricao,
        requisitos: plantaoBase.requisitos,
        vagasDisponiveis: plantaoBase.vagasTotal ?? 1,
        vagasTotal: plantaoBase.vagasTotal ?? 1,
        cidade: plantaoBase.cidade!,
        estado: plantaoBase.estado!,
        criadoPor: session.user.id as string,
        recurrenceId,
        recurrenceRule: i === 0 ? recurrenceRule : undefined,
      };
      plantoes.push(plantao);
    }

    const created = await plantaoRepository.createBatch(plantoes);

    return NextResponse.json(
      { plantoes: created, recurrenceId, count: created.length },
      { status: 201 }
    );
  } catch (err) {
    console.error('[plantoes/recorrentes/POST]', err);
    return NextResponse.json({ error: 'Erro ao criar plantoes recorrentes' }, { status: 500 });
  }
}
