
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export async function generatePdfVendaCarta(data: any) {
  const doc = new jsPDF();
  const { kpis, table, simulationId, generatedAt, form } = data;

  // Cabeçalho (Padrão Ouro)
  doc.setFontSize(18);
  doc.setTextColor(33, 33, 33);
  doc.text("Raio-X da Venda de Carta Contemplada", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`ID da Simulação: ${simulationId}`, 14, 28);
  doc.text(`Gerado em: ${new Date(generatedAt).toLocaleString("pt-BR")}`, 14, 33);

  // KPIs de Destaque
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 40, 182, 30, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("CARTA DISPONÍVEL (LÍQUIDA)", 20, 50);
  doc.setFontSize(16);
  doc.setTextColor(255, 69, 0); // Laranja Forte
  doc.text(data.cartaDisponivel, 20, 60);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("RETORNO LÍQUIDO", 120, 50);
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text(data.retornoLiquido, 120, 60);

  // Parâmetros da Simulação
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Parâmetros Informados", 14, 85);
  
  const formRows = [
    ["Carta Inicial", `R$ ${form.valorInicial}`],
    ["Parcela Inicial", `R$ ${form.parcelaInicial}`],
    ["Prazo Total", `${form.prazoTotal} meses`],
    ["Mês Contemplação", `${form.parcelaContemplacao}º mês`],
    ["Taxa de Repasse", `${form.taxaRepasseMensal}% a.m.`],
    ["Lance Embutido", `R$ ${form.lanceEmbutido}`],
    ["Lance Realizado", `R$ ${form.lanceRealizado}`]
  ];

  (doc as any).autoTable({
    startY: 90,
    head: [["Campo", "Valor"]],
    body: formRows,
    theme: "striped",
    headStyles: { fillColor: [33, 33, 33] }
  });

  // Tabela de Auditoria
  doc.setFontSize(12);
  doc.text("Análise de Auditoria", 14, (doc as any).lastAutoTable.finalY + 15);

  const auditRows = [
    ["Valor Bruto Estimado", data.valorBruto, "VALOR DA CARTA - VALOR PRESENTE"],
    ["Retorno Líquido", data.retornoLiquido, "VALOR BRUTO - PARCELAS PAGAS E/OU LANCE"],
    ["PV das Parcelas Restantes", data.pv, "VALOR DA CARTA ATUAL TRAZIDO A VALOR PRESENTE"],
    ["Parcela de Referência (Reduzida)", data.parcelaReferencia, "Parcela após abatimento do embutido"]
  ];

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Indicador", "Valor", "Explicação"]],
    body: auditRows,
    theme: "grid",
    headStyles: { fillColor: [255, 69, 0] }
  });

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Consórcio de Verdade - Motor de Auditoria v2.3", 14, 285);

  doc.save(`auditoria-venda-${simulationId}.pdf`);
}
