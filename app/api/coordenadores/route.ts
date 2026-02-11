import { NextRequest, NextResponse } from 'next/server';
import { requireCoordinator } from '@/lib/api/routeGuards';
import { mockCoordenadores } from '@/lib/data/mockCoordenadores';
import type { Coordenador } from '@/types/coordenador';

/**
 * GET /api/coordenadores - Get all coordinators
 *
 * Protected endpoint - Only coordinators and admins can access
 * Returns list of all coordinators in the system
 *
 * Query parameters:
 * - ativo: Filter by active status (true/false)
 * - hospital: Filter by hospital name
 */
export async function GET(request: NextRequest) {
  try {
    // Check authorization - only coordinators and admins
    const { session, error } = await requireCoordinator();
    if (error) return error;

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const ativoParam = searchParams.get('ativo');
    const hospital = searchParams.get('hospital');

    // Filter coordinators based on query parameters
    let filteredCoordenadores = [...mockCoordenadores];

    if (ativoParam !== null) {
      const ativoValue = ativoParam === 'true';
      filteredCoordenadores = filteredCoordenadores.filter(
        coord => coord.ativo === ativoValue
      );
    }

    if (hospital) {
      filteredCoordenadores = filteredCoordenadores.filter(
        coord => coord.hospital.toLowerCase().includes(hospital.toLowerCase())
      );
    }

    // Return coordinators list
    return NextResponse.json({
      coordenadores: filteredCoordenadores,
      total: filteredCoordenadores.length,
    });
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar coordenadores' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coordenadores - Create new coordinator
 *
 * Protected endpoint - Only coordinators and admins can create
 * Note: In production, might want to restrict to admins only
 *
 * Required fields:
 * - nome: string
 * - email: string
 * - telefone: string
 * - hospital: string
 */
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const { session, error } = await requireCoordinator();
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['nome', 'email', 'telefone', 'hospital'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios faltando',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailExists = mockCoordenadores.some(
      coord => coord.email.toLowerCase() === body.email.toLowerCase()
    );
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // In production, this would save to database
    const newCoordenador: Coordenador = {
      id: `coord-${Date.now()}`,
      nome: body.nome,
      email: body.email,
      telefone: body.telefone,
      crm: body.crm || '',
      especialidade: body.especialidade || 'Coordenador',
      hospital: body.hospital,
      ativo: body.ativo !== undefined ? body.ativo : true,
      totalPlantoesGerenciados: 0,
      createdAt: new Date().toISOString(),
    };

    console.log('👤 New coordinator created:', newCoordenador);

    return NextResponse.json(
      {
        success: true,
        coordenador: newCoordenador,
        message: 'Coordenador cadastrado com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coordinator:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar coordenador' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/coordenadores - Update coordinator status
 *
 * Protected endpoint - Coordinators and admins only
 * Used to activate/deactivate coordinators
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authorization
    const { session, error } = await requireCoordinator();
    if (error) return error;

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'ID do coordenador é obrigatório' },
        { status: 400 }
      );
    }

    // In production, update in database
    console.log('📝 Coordinator updated:', body);

    return NextResponse.json({
      success: true,
      message: 'Coordenador atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating coordinator:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar coordenador' },
      { status: 500 }
    );
  }
}
