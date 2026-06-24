import { NextRequest, NextResponse } from 'next/server';
import { buildSchedule } from '@/lib/consorcio/raio-x-logic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = buildSchedule(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar simulação' }, { status: 400 });
  }
}
