import { requireAuth, authUserRepository } from '@plantao/backend';
import { NextResponse } from 'next/server';

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const todos = await authUserRepository.listAllActiveUsers();
  const usuarios = todos
    .filter((u) => u.id !== (session.user.id as string))
    .map((u) => ({ id: u.id, nome: u.nome, email: u.email, role: u.role }));

  return NextResponse.json({ usuarios });
}
