import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, authUserRepository } from '@plantao/backend';

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { token, platform } = body;

  if (!token || !platform) {
    return NextResponse.json(
      { error: 'token e platform são obrigatórios' },
      { status: 400 }
    );
  }

  await authUserRepository.registerPushToken(session!.user.id, token, platform);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: 'token é obrigatório' }, { status: 400 });
  }

  await authUserRepository.removePushToken(session!.user.id, token);
  return NextResponse.json({ success: true });
}
