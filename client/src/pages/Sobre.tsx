import { Link } from 'wouter';
import { Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react';

export default function Sobre() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-card to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Sobre o Consórcio de Verdade
            </h1>
            <p className="text-lg text-muted-foreground">
              Uma plataforma independente dedicada a transparência e educação sobre consórcios no Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* Missão */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
              Nossa missão
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                O Consórcio de Verdade existe para democratizar o acesso a informações confiáveis sobre consórcios no Brasil. Acreditamos que toda pessoa merece entender completamente qualquer instrumento financeiro antes de se comprometer com ele.
              </p>
              <p>
                Consórcios são complexos. Suas regras variam. Seus custos nem sempre são transparentes. A maioria das pessoas não tem acesso a análises independentes e confiáveis sobre como funcionam e se fazem sentido para seu caso específico.
              </p>
              <p>
                Somos uma plataforma de inteligência e transparência. Não vendemos consórcios. Não temos conflito de interesse. Oferecemos dados, matemática e análises fundamentadas para que você tome decisões informadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Independência */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
              Somos independentes
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                <strong>Não vendemos consórcios.</strong> Não recebemos comissão de administradoras. Não temos parcerias comerciais que possam comprometer nossa análise.
              </p>
              <p>
                <strong>Não temos conflito de interesse.</strong> Nossa única motivação é oferecer análises confiáveis e educação financeira.
              </p>
              <p>
                <strong>Somos transparentes.</strong> Todos os nossos cálculos são públicos. Você pode auditá-los. Você pode questionar nossas metodologias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fundador */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
              Quem está por trás
            </h2>
            <div className="bg-card border border-border rounded-lg p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Foto placeholder */}
                <div className="w-32 h-32 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center text-muted-foreground">
                  [Foto do Fundador]
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    [Nome do Fundador]
                  </h3>
                  <p className="text-accent font-semibold mb-4">
                    Fundador, Consórcio de Verdade
                  </p>
                  <p className="text-muted-foreground mb-6">
                    [Breve biografia e experiência no mercado financeiro]
                  </p>
                  <div className="flex gap-4">
                    <a 
                      href="https://linkedin.com/in/fundador" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:opacity-80 transition-opacity"
                    >
                      <Linkedin size={20} />
                      LinkedIn
                    </a>
                    <a 
                      href="https://instagram.com/fundador" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:opacity-80 transition-opacity"
                    >
                      <Instagram size={20} />
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compromisso */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
              Nosso compromisso
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Com a transparência:</strong> Todos os cálculos e metodologias são públicos e auditáveis.
              </p>
              <p>
                <strong>Com a educação:</strong> Explicamos conceitos de forma clara, sem jargão desnecessário.
              </p>
              <p>
                <strong>Com a independência:</strong> Nunca venderemos nossa análise ou influência.
              </p>
              <p>
                <strong>Com a qualidade:</strong> Nossas análises são rigorosas e baseadas em dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
              Entre em contato
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Tem dúvidas, sugestões ou quer colaborar? Adoraríamos ouvir você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/5511999999999?text=Olá%20Consórcio%20de%20Verdade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={20} />
                WhatsApp
              </a>
              <a 
                href="mailto:contato@consorciodeverdade.com.br"
                className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <Mail size={20} />
                Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
