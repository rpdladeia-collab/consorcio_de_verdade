export default function Termos() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-card to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Termos de Uso
          </h1>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a plataforma Consórcio de Verdade, você concorda em aceitar e cumprir estes Termos de Uso e todas as leis e regulamentações aplicáveis.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Uso da Plataforma</h2>
              <p>
                A plataforma é fornecida para fins educacionais e informativos. Você concorda em usar a plataforma apenas de forma legal e responsável, e não para qualquer atividade ilegal ou prejudicial.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Isenção de Responsabilidade</h2>
              <p>
                Os conteúdos e simuladores da plataforma têm caráter educativo e não constituem recomendação financeira, jurídica ou comercial. Consulte um profissional qualificado antes de tomar decisões financeiras.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitação de Responsabilidade</h2>
              <p>
                Em nenhuma circunstância o Consórcio de Verdade será responsável por danos diretos, indiretos, incidentais, especiais ou consequentes decorrentes do uso ou incapacidade de usar a plataforma.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo da plataforma, incluindo textos, gráficos, logos e código, é propriedade do Consórcio de Verdade ou de seus fornecedores de conteúdo e é protegido por leis de direitos autorais.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Modificações dos Termos</h2>
              <p>
                O Consórcio de Verdade se reserva o direito de modificar estes Termos de Uso a qualquer momento. As modificações entram em vigor imediatamente após a publicação.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Lei Aplicável</h2>
              <p>
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mt-8">
              <p className="text-[14px] md:text-[15px]">
                <strong>Última atualização:</strong> 24 de junho de 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
