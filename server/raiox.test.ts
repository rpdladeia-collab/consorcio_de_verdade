import { describe, test, expect } from 'vitest';
import { buildSchedule } from './lib/raiox';

// ---------------------------------------------------------------------------
// Golden Test — caso padrão do HTML original
// Parâmetros: carta 300.000, prazo 120, adm 16%, reserva 2%, seguro 0,
//             correção 5% anual (primeiro reajuste no mês 13).
// Ocorrem 9 reajustes: meses 13, 25, 37, 49, 61, 73, 85, 97, 109.
// Valores esperados extraídos diretamente da tabela renderizada no HTML.
// ---------------------------------------------------------------------------
describe('buildSchedule — golden test (caso padrão HTML)', () => {
  const s = buildSchedule({
    credit: 300000,
    term: 120,
    adminRate: 16,
    reserveRate: 2,
    insuranceRate: 0,
    adjRate: 5,
    adjEvery: 12,
    mode: 'linear',
    ranges: '',
  });

  test('1ª parcela = R$ 2.950,00', () => {
    expect(s.rows[0].installment).toBeCloseTo(2950.0, 1);
  });

  test('Saldo após mês 1 = R$ 351.050,00', () => {
    expect(s.rows[0].balance).toBeCloseTo(351050.0, 1);
  });

  test('Carta corrigida no mês 13 = R$ 315.000,00', () => {
    expect(s.rows[12].credit).toBeCloseTo(315000.0, 1);
  });

  test('Parcela no mês 13 = R$ 3.097,50', () => {
    expect(s.rows[12].installment).toBeCloseTo(3097.5, 1);
  });

  test('Saldo após mês 13 = R$ 331.432,50', () => {
    expect(s.rows[12].balance).toBeCloseTo(331432.5, 1);
  });

  test('Total pago projetado = R$ 445.257,40', () => {
    expect(s.paidTotal).toBeCloseTo(445257.4, 0);
  });

  test('Saldo final (residual) = R$ 0,00', () => {
    expect(s.residual).toBeCloseTo(0, 1);
  });

  // 9 reajustes de 5%: 300.000 × 1,05^9 = 465.398,46
  test('Carta final corrigida = R$ 465.398,46', () => {
    expect(s.finalCredit).toBeCloseTo(465398.46, 0);
  });

  test('Sem warnings no modo linear', () => {
    expect(s.warnings).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Teste de estresse — seguro com decimais
// Parâmetros: carta 300.000, prazo 120, adm 16%, reserva 2%, seguro 0,035%,
//             reajuste 0%, modelo linear.
//
// FIDELIDADE AO HTML (Opção A aprovada):
// O HTML calcula insurance = (fc + ta + fr) * insuranceRate APÓS subtrair
// o pagamento da parcela do saldo (linha 336 do HTML original):
//   fc -= payFc; ta -= payTa; fr -= payFr;   ← parcela paga primeiro
//   insurance = (fc + ta + fr) * insuranceRate  ← sobre saldo residual
//
// Portanto no mês 1:
//   Saldo inicial = 354.000 (300k + 16% adm + 2% reserva)
//   Parcela (componentPay) = 354.000 / 120 = 2.950,00
//   Saldo após parcela = 354.000 − 2.950 = 351.050,00
//   Seguro = 351.050 × 0,00035 = 122,8675 ≈ R$ 122,87
// ---------------------------------------------------------------------------
describe('buildSchedule — seguro com decimais (fidelidade ao HTML)', () => {
  const s = buildSchedule({
    credit: 300000,
    term: 120,
    adminRate: 16,
    reserveRate: 2,
    insuranceRate: 0.035,
    adjRate: 0,
    adjEvery: 0,
    mode: 'linear',
    ranges: '',
  });

  test('Saldo inicial = R$ 354.000,00 (fc + ta + fr antes da parcela)', () => {
    expect(s.initialObligation).toBeCloseTo(354000.0, 1);
  });

  test('Seguro no mês 1 = R$ 122,87 (sobre saldo pós-parcela, fiel ao HTML)', () => {
    // 351.050 × 0,00035 = 122,8675
    expect(s.rows[0].insurance).toBeCloseTo(122.87, 1);
  });

  test('Parcela total mês 1 = componentPay + insurance ≈ R$ 3.072,87', () => {
    // 2.950 + 122,87 = 3.072,87
    expect(s.rows[0].installment).toBeCloseTo(3072.87, 1);
  });
});
