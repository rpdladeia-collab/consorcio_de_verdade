import { MessageCircle, Mail, Instagram, Linkedin } from 'lucide-react';

export default function Contato() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-card to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Entre em contato
            </h1>
            <p className="text-lg text-muted-foreground">
              Tem dúvidas, sugestões ou quer colaborar? Adoraríamos ouvir você.
            </p>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* WhatsApp */}
              <a 
                href="https://wa.me/5511999999999?text=Olá%20Consórcio%20de%20Verdade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-8 bg-card border border-border rounded-lg hover:border-accent transition-all hover:shadow-lg cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                    WhatsApp
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Envie uma mensagem direta pelo WhatsApp e responderemos assim que possível.
                </p>
                <div className="text-accent font-semibold">
                  Abrir WhatsApp →
                </div>
              </a>

              {/* Email */}
              <a 
                href="mailto:contato@consorciodeverdade.com.br"
                className="p-8 bg-card border border-border rounded-lg hover:border-accent transition-all hover:shadow-lg cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                    Email
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  contato@consorciodeverdade.com.br
                </p>
                <div className="text-accent font-semibold">
                  Enviar email →
                </div>
              </a>
            </div>

            {/* Redes Sociais */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8 text-foreground">
                Siga-nos nas redes sociais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a 
                  href="https://instagram.com/consorcio.deverdade" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-6 bg-card border border-border rounded-lg hover:border-accent transition-all hover:shadow-lg cursor-pointer group flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">
                      Instagram
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @consorcio.deverdade
                    </p>
                  </div>
                </a>

                <a 
                  href="https://linkedin.com/company/consorcio-de-verdade" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-6 bg-card border border-border rounded-lg hover:border-accent transition-all hover:shadow-lg cursor-pointer group flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">
                    <Linkedin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">
                      LinkedIn
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Consórcio de Verdade
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
