import { NextRequest, NextResponse } from 'next/server';
import { auth, plantaoRepository } from '@plantao/backend';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const plantoes = await plantaoRepository.listPlantoes();
  const plantao = plantoes.find((p) => p.id === id);
  if (!plantao) {
    return NextResponse.json({ error: 'Plantão não encontrado' }, { status: 404 });
  }

  const isCreator = plantao.criadoPor === session.user?.id;
  const isAdmin = session.user?.role === 'admin';
  if (!isCreator && !isAdmin) {
    return NextResponse.json(
      { error: 'Apenas o criador pode excluir este plantão' },
      { status: 403 }
    );
  }

  await plantaoRepository.deleteById(id);
  return NextResponse.json({ success: true });
}
