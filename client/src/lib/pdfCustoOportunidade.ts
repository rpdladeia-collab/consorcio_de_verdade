
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBRL } from "@/components/cdv/SimuladorUI";

export async function generatePdfCustoOportunidade(data: any) {
  const doc = new jsPDF();
  const { totalPagoConsorcio, cartaFinal, patrimonioInvestimento, custoOportunidade, progressao, form } = data;

  // Header
  doc.setFillColor(10, 10, 8); // #0A0A08
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("RAIO-X DO CONSÓRCIO", 15, 18);
  doc.setFontSize(10);
  doc.text("RELATÓRIO DE CUSTO DE OPORTUNIDADE", 15, 28);

  // KPIs
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text("RESULTADOS DA SIMULAÇÃO", 15, 55);
  
  autoTable(doc, {
    startY: 60,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total Pago no Consórcio", formatBRL(totalPagoConsorcio)],
      ["Carta de Crédito Final", formatBRL(cartaFinal)],
      ["Patrimônio no Investimento", formatBRL(patrimonioInvestimento)],
      ["CUSTO DE OPORTUNIDADE", formatBRL(custoOportunidade)],
    ],
    theme: "striped",
    headStyles: { fillStyle: [255, 78, 31] }, // #FF4E1F
  });

  // Tabela de Auditoria
  doc.text("AUDITORIA DE FLUXO DE CAIXA (IGUALADO)", 15, (doc as any).lastAutoTable.finalY + 15);
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Mês", "Parcela (Aporte)", "Carta Atualizada", "Saldo Investimento"]],
    body: progressao.filter((_: any, i: number) => i === 0 || (i + 1) % 12 === 0 || i === progressao.length - 1).map((row: any) => [
      `Mês ${row.mes}`,
      formatBRL(row.parcela),
      formatBRL(row.carta),
      formatBRL(row.investimento)
    ]),
  });

  // Footer Legal
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("* Este simulador possui caráter exclusivamente educativo e informativo, não constituindo recomendação financeira.", 15, finalY);

  doc.save(`auditoria-custo-oportunidade-${Date.now()}.pdf`);
}
