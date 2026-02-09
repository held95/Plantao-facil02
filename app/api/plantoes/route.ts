import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Plantao } from '@/types/plantao';
import {
  validatePlantaoForm,
  formatPlantaoForSubmission,
} from '@/lib/validation/plantaoValidation';

// GET /api/plantoes - Get all plantões
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // In production, fetch from database
    // For now, return empty array (will be handled by mock data on client)
    return NextResponse.json({ plantoes: [] });
  } catch (error) {
    console.error('Error fetching plantões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar plantões' },
      { status: 500 }
    );
  }
}

// POST /api/plantoes - Create new plantão
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check authentication
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check role - only coordinators can create plantões
    if (session.user?.role !== 'coordenador' && session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas coordenadores podem criar plantões' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const errors = validatePlantaoForm(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Dados inválidos', validationErrors: errors },
        { status: 400 }
      );
    }

    // Format plantão data
    const plantaoData = formatPlantaoForSubmission(body);

    // Generate ID (in production, database would handle this)
    const newPlantao: Plantao = {
      id: `plantao-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...plantaoData,
    };

    // In production: Save to database

    // Email notifications disabled for stability
    console.log('📧 Email notifications disabled - plantão created successfully');

    // Return the created plantão
    return NextResponse.json(
      {
        success: true,
        plantao: newPlantao,
        message: 'Plantão criado com sucesso!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating plantão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar plantão' },
      { status: 500 }
    );
  }
}
