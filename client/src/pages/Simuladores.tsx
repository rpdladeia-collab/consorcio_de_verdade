import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

const simuladores = [
  {
    categoria: "Quero entender meu lance",
    items: [
      { nome: "Lance Embutido", descricao: "Calcula o impacto do lance embutido no crédito líquido e eficiência econômica.", slug: "lance-embutido", path: "/simulador/lance-embutido" },
      { nome: "Lance Livre", descricao: "Analisa cenários de lance livre e seus efeitos na contemplação.", slug: "lance-livre" },
      { nome: "Lance Fixo", descricao: "Avalia a estratégia de lance fixo e seus riscos.", slug: "lance-fixo" },
      { nome: "Zona de Contemplação", descricao: "Diagnostica a saúde do grupo e probabilidade de contemplação.", slug: "zona-contemplacao" },
    ]
  },
  {
    categoria: "Quero saber se vale a pena",
    items: [
      { nome: "Eficiência Econômica", descricao: "Avalia a eficiência econômica de um consórcio.", slug: "eficiencia-economica" },
      { nome: "Consórcio x Financiamento", descricao: "Compara a viabilidade econômica entre consórcio e financiamento.", slug: "consorcio-financiamento" },
      { nome: "Consórcio x Investimentos", descricao: "Compara o consórcio com outras opções de investimento.", slug: "consorcio-investimentos" },
    ]
  },
  {
    categoria: "Quero analisar uma proposta",
    items: [
      { nome: "Raio-X da Proposta", descricao: "Análise completa de qualquer proposta de consórcio.", slug: "raio-x-proposta" },
      { nome: "Diagnóstico de Propostas", descricao: "Diagnostica a viabilidade e riscos de uma proposta.", slug: "diagnostico-propostas" },
      { nome: "Saúde do Grupo", descricao: "Avalia a saúde financeira e operacional de um grupo.", slug: "saude-grupo" },
    ]
  },
  {
    categoria: "Quero cancelar ou sair",
    items: [
      { nome: "Exclusão", descricao: "Calcula o valor a ser restituído em caso de exclusão.", slug: "exclusao" },
    ]
  }
];

export default function Simuladores() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-card to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Central de Simuladores
            </h1>
            <p className="text-lg text-muted-foreground">
              Escolha o simulador que responde sua dúvida e comece a explorar dados independentes sobre consórcios.
            </p>
          </div>
        </div>
      </section>

      {/* Simuladores por categoria */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {simuladores.map((grupo, idx) => (
              <div key={idx}>
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
                  {grupo.categoria}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grupo.items.map((sim, sidx) => (
                    <Link
                      key={sidx}
                      href={(sim as any).path || `/simulador/${sim.slug}`}
                      className="group p-6 bg-card border border-border rounded-lg hover:border-accent transition-all hover:shadow-lg cursor-pointer"
                    >
                      <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                        {sim.nome}
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {sim.descricao}
                      </p>
                      <div className="text-accent font-semibold flex items-center gap-2 text-sm">
                        Analisar agora <ArrowRight size={16} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aviso */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 rounded-lg p-6 text-center text-muted-foreground">
            <p>
              <strong>Nota:</strong> Todos os simuladores funcionam de forma independente e offline. Seus dados não são armazenados ou compartilhados.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
