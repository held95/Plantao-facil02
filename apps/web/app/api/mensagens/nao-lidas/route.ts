import { requireAuth, messageRepository } from '@plantao/backend';
import { NextResponse } from 'next/server';

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const count = await messageRepository.countUnread(session.user.id as string);
  return NextResponse.json({ count });
}
