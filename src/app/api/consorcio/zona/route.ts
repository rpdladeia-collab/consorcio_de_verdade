import { NextRequest, NextResponse } from 'next/server';
import { calculateHealth, avg, median } from '@/lib/consorcio/zona-logic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows, method, term } = body;
    
    const result = {
      health: calculateHealth(rows, term),
      averages: {
        low: method === 'mediana' ? median(rows, 'low') : avg(rows, 'low'),
        mid: method === 'mediana' ? median(rows, 'mid') : avg(rows, 'mid'),
        high: method === 'mediana' ? median(rows, 'high') : avg(rows, 'high'),
      }
    };
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar diagnóstico' }, { status: 400 });
  }
}
