import { Link } from 'wouter';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-card to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Antes de contratar um consórcio, faça a conta.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Uma plataforma independente com simuladores, dados e análises para ajudar você a entender consórcios sem promessa, pressão comercial ou conflito de interesse.
            </p>
            <Link href="/simuladores" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Acessar Simuladores
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* O que você quer descobrir */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
            O que você quer descobrir?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/simuladores" className="group p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                Entender meu lance
              </h3>
              <p className="text-muted-foreground mb-4">
                Saiba exatamente quanto você ganha ou perde com diferentes tipos de lance.
              </p>
              <div className="text-accent font-semibold flex items-center gap-2">
                Explorar <ArrowRight size={16} />
              </div>
            </Link>

            <Link href="/simuladores" className="group p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                Saber se vale a pena
              </h3>
              <p className="text-muted-foreground mb-4">
                Compare consórcio com financiamento, investimentos e outras alternativas.
              </p>
              <div className="text-accent font-semibold flex items-center gap-2">
                Comparar <ArrowRight size={16} />
              </div>
            </Link>

            <Link href="/simuladores" className="group p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                Analisar uma proposta
              </h3>
              <p className="text-muted-foreground mb-4">
                Faça um raio-x completo de qualquer proposta de consórcio que receber.
              </p>
              <div className="text-accent font-semibold flex items-center gap-2">
                Analisar <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Por que o Consórcio de Verdade existe */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
              Por que o Consórcio de Verdade existe
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Consórcios são instrumentos financeiros complexos. A maioria das pessoas não tem acesso a análises independentes e confiáveis sobre como funcionam, quanto custam e se fazem sentido para seu caso específico.
              </p>
              <p>
                O Consórcio de Verdade é uma plataforma de inteligência e transparência. Não vendemos consórcios. Não temos conflito de interesse. Oferecemos dados, matemática e análises fundamentadas para que você tome decisões informadas.
              </p>
              <p>
                Nosso compromisso é com a educação financeira e a transparência radical.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
            Nossa metodologia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Dados Públicos</h3>
              <p className="text-muted-foreground text-sm">
                Utilizamos informações públicas e regulatórias de órgãos oficiais.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Matemática Rigorosa</h3>
              <p className="text-muted-foreground text-sm">
                Todos os cálculos são transparentes e podem ser auditados.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Independência</h3>
              <p className="text-muted-foreground text-sm">
                Sem conflito de interesse. Sem pressão comercial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Pronto para entender melhor?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Acesse nossa Central de Simuladores e comece a explorar dados e análises independentes sobre consórcios.
          </p>
          <Link href="/simuladores" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Acessar Simuladores
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
