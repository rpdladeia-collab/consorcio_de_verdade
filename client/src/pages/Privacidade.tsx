export default function Privacidade() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-card to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Política de Privacidade
          </h1>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Coleta de Dados</h2>
              <p>
                O Consórcio de Verdade coleta informações que você nos fornece voluntariamente, como seu nome e email quando você entra em contato conosco. Os simuladores funcionam localmente no seu navegador e não armazenam dados pessoais no nosso servidor.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Uso de Dados</h2>
              <p>
                Utilizamos as informações coletadas para responder suas dúvidas, melhorar nossos serviços e enviar comunicações relevantes. Nunca compartilhamos seus dados com terceiros sem consentimento.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Cookies</h2>
              <p>
                A plataforma pode utilizar cookies para melhorar sua experiência. Você pode desabilitar cookies nas configurações do seu navegador.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Segurança</h2>
              <p>
                Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Direitos do Usuário</h2>
              <p>
                Você tem o direito de acessar, corrigir ou deletar suas informações pessoais. Entre em contato conosco para exercer esses direitos.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Alterações na Política</h2>
              <p>
                O Consórcio de Verdade se reserva o direito de modificar esta Política de Privacidade a qualquer momento. As modificações entram em vigor imediatamente após a publicação.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em contato@consorciodeverdade.com.br.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mt-8">
              <p className="text-sm">
                <strong>Última atualização:</strong> 24 de junho de 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
