import type { EstruturaResult } from "../../../server/lib/estruturaDoPlano";
import type { PdfEstruturaDaLance } from "./pdfEstruturaDaLance";

export function buildLancePresentation(result: EstruturaResult) {
  const contemplation = result.contemplation;
  if (!contemplation) throw new Error("Nenhum resultado de lance para gerar PDF.");
  const { contract, scenario, event, eventMonth, rows } = contemplation;
  const cartaAtualizada = rows.find(row => row.month === eventMonth)?.credit ?? result.credit;
  const forcaPct = event.base > 0 ? event.total / event.base * 100 : 0;
  const parcelaAntes = rows.find(row => row.month === eventMonth - 1)?.payment ?? 0;
  const baseLabel = scenario.base === "categoria" ? "categoria (carta + taxa administrativa)" : "carta";
  const diagnosticoTexto = `Seu lance representa ${forcaPct.toFixed(1)}% da ${baseLabel}. Desse total, R$ ${(event.own + event.fgts).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} saem do seu patrimônio e R$ ${event.embedded.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} serão abatidos diretamente do crédito. A primeira parcela após o lance é projetada em R$ ${contemplation.firstPostPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Antes de decidir, compare esse esforço financeiro com outras alternativas disponíveis.`;
  return { contract, scenario, cartaAtualizada, forcaPct, parcelaAntes, baseLabel, diagnosticoTexto };
}

/** Nunca combinar campos ainda em edição com uma resposta anterior da API. */
export function buildPdfEstruturaDaLance(
  result: EstruturaResult,
  metadata: { simulationId: string; generatedAt: string },
): PdfEstruturaDaLance {
  const { contract, scenario, cartaAtualizada, forcaPct, parcelaAntes, diagnosticoTexto } = buildLancePresentation(result);
  const contemplation = result.contemplation!;
  return {
    credit: result.credit, term: result.term, adminRate: result.adminRate,
    reserveRate: result.reserveRate, adjustmentRate: result.adjustmentRate,
    adjustmentPeriod: String(result.adjustmentPeriod),
    insuranceRate: contract.insuranceRate, firstAdjustmentMonth: contract.firstAdjustmentMonth,
    paymentPolicyMode: contract.paymentPolicyMode, paymentAdjustmentMode: contract.paymentAdjustmentMode ?? 'fixed',
    paymentRanges: contract.paymentRanges,
    paidMonths: contemplation.eventMonth, baseDoLance: scenario.base,
    lanceProprio: scenario.own, lanceFgts: scenario.fgts, lanceEmbutido: scenario.embedded,
    cartaAtualizada, cartaLiquida: contemplation.event.creditAvailable,
    lanceTotal: contemplation.event.total, forcaPct, parcelaAntes,
    parcelaPosLance: contemplation.firstPostPayment, diagnosticoTexto,
    warnings: [...(result.warnings ?? []), ...contemplation.alerts],
    rows: contemplation.rows.map(row => ({
      month: row.month, credit: row.credit, event: row.tags.join(", ") || row.phase,
      lance: row.totalLance, payment: row.payment, balance: row.saldoFinal, tags: row.tags,
    })),
    ...metadata,
  };
}
