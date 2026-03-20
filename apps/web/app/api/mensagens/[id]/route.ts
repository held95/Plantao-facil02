import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, messageRepository } from '@plantao/backend';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const mensagem = await messageRepository.getById(id);
  if (!mensagem) {
    return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
  }

  const userId = session.user.id as string;
  if (mensagem.fromUserId !== userId && mensagem.toUserId !== userId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  return NextResponse.json({ mensagem });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const mensagem = await messageRepository.getById(id);
  if (!mensagem) {
    return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
  }

  const userId = session.user.id as string;
  if (mensagem.fromUserId !== userId && mensagem.toUserId !== userId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  await messageRepository.deleteById(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const mensagem = await messageRepository.getById(id);
  if (!mensagem) {
    return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
  }

  if (mensagem.toUserId !== (session.user.id as string)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  await messageRepository.markAsRead(id);
  return NextResponse.json({ success: true });
}
