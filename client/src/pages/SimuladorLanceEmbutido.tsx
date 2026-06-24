import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { AlertCircle, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function SimuladorLanceEmbutido() {
  const [valorCarta, setValorCarta] = useState(500000);
  const [percentualEmbutido, setPercentualEmbutido] = useState(30);
  const [mostrarAvancado, setMostrarAvancado] = useState(false);

  const { data: resultado, isLoading, error } = trpc.simuladores.lanceEmbutido.useQuery({
    valorCarta,
    percentualEmbutido,
  });

  const getVeredictIcon = () => {
    if (!resultado) return null;
    const veredito = resultado.diagnosticoExecutivo.veredito;
    if (veredito === 'positivo') return <CheckCircle2 className="text-green-500" size={32} />;
    if (veredito === 'negativo') return <AlertCircle className="text-red-500" size={32} />;
    return <AlertTriangle className="text-yellow-500" size={32} />;
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-card to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Lance Embutido: Vale a Pena?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Descubra quanto crédito você realmente receberá e qual o custo econômico dessa escolha.
          </p>
        </div>
      </section>

      {/* Simulador */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inputs */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6 text-foreground">Simulador Simples</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Valor da Carta (R$)
                    </label>
                    <Input
                      type="number"
                      value={valorCarta}
                      onChange={(e) => setValorCarta(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      R$ {valorCarta.toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Percentual de Lance Embutido (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={percentualEmbutido}
                      onChange={(e) => setPercentualEmbutido(Number(e.target.value))}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={percentualEmbutido}
                      onChange={(e) => setPercentualEmbutido(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>

                  <Button 
                    onClick={() => setMostrarAvancado(!mostrarAvancado)}
                    variant="outline"
                    className="w-full"
                  >
                    {mostrarAvancado ? 'Ocultar Modo Avançado' : 'Modo Avançado'}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Resultado */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Calculando...</p>
                </Card>
              ) : error ? (
                <Card className="p-8 bg-red-50 border-red-200">
                  <p className="text-red-700">Erro ao calcular. Verifique os valores.</p>
                </Card>
              ) : resultado ? (
                <div className="space-y-6">
                  {/* Diagnóstico Executivo */}
                  <Card className="p-6 border-accent">
                    <div className="flex items-start gap-4 mb-4">
                      {getVeredictIcon()}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          Diagnóstico Executivo
                        </h3>
                        <p className="text-muted-foreground">
                          {resultado.diagnosticoExecutivo.conclusao}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Resultado Principal */}
                  <Card className="p-6 bg-card">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      Crédito Líquido Disponível
                    </h3>
                    <p className="text-4xl font-bold text-accent">
                      R$ {(resultado.resultadoPrincipal as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </Card>

                  {/* O que isso significa */}
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      O que isso significa
                    </h3>
                    <p className="text-muted-foreground">
                      {resultado.oQueIssoSignifica}
                    </p>
                  </Card>

                  {/* Pontos Positivos */}
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-green-500" />
                      Pontos Positivos
                    </h3>
                    <ul className="space-y-2">
                      {resultado.pontosPositivos.map((ponto, idx) => (
                        <li key={idx} className="text-muted-foreground flex gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{ponto}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Pontos de Atenção */}
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-yellow-500" />
                      Pontos de Atenção
                    </h3>
                    <ul className="space-y-2">
                      {resultado.pontosAtencao.map((ponto, idx) => (
                        <li key={idx} className="text-muted-foreground flex gap-2">
                          <span className="text-yellow-500 mt-1">⚠</span>
                          <span>{ponto}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Modo Avançado */}
                  {mostrarAvancado && resultado.memoriaCalculo && (
                    <Card className="p-6 bg-muted/50">
                      <h3 className="text-lg font-bold text-foreground mb-4">
                        Memória de Cálculo
                      </h3>
                      <div className="space-y-2 text-sm font-mono text-muted-foreground">
                        {Object.entries(resultado.memoriaCalculo).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="text-foreground">
                              {typeof value === 'number' ? value.toFixed(2) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Fontes */}
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      Fontes e Metodologia
                    </h3>
                    <ul className="space-y-2">
                      {resultado.fontesMetodologia.map((fonte, idx) => (
                        <li key={idx} className="text-muted-foreground text-sm flex gap-2">
                          <span className="text-accent">•</span>
                          <span>{fonte}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* PDF */}
                  <Button className="w-full btn-primary flex items-center justify-center gap-2">
                    <Download size={20} />
                    Gerar Relatório de Auditoria
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
