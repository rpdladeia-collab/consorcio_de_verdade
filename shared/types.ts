export interface SimuladorResultado {
  resultadoPrincipal: number | string;
  diagnosticoExecutivo: {
    veredito: 'positivo' | 'neutro' | 'negativo';
    conclusao: string;
  };
  oQueIssoSignifica: string;
  pontosPositivos: string[];
  pontosAtencao: string[];
  memoriaCalculo?: Record<string, unknown>;
  fontesMetodologia: string[];
}

export interface LanceEmbutidoInput {
  valorCarta: number;
  percentualEmbutido: number;
}

export interface ZonaContemplacacaoInput {
  valorCarta: number;
  numeroMeses: number;
  taxaMedia: number;
}

export interface LanceAvaliacaoInput {
  valorCarta: number;
  tipoLance: 'embutido' | 'livre' | 'fixo';
  percentualLance?: number;
  valorLance?: number;
}

export interface EficienciaEconomicaInput {
  valorCarta: number;
  taxaMedia: number;
  numeroMeses: number;
  custoAdministrativo: number;
}

export interface ComparativoFinanciamentoInput {
  valorCarta: number;
  taxaFinanciamento: number;
  numeroMeses: number;
  taxaConsorcio: number;
}

export interface ComparativoInvestimentosInput {
  valorCarta: number;
  taxaConsorcio: number;
  taxaInvestimento: number;
  numeroMeses: number;
}

export interface SaudeGrupoInput {
  numeroParticipantes: number;
  numeroDesistencias: number;
  numeroExclusoes: number;
  numeroContemplados: number;
}

export interface ExclusaoInput {
  valorCarta: number;
  numeroMesesPagos: number;
  numeroMesesTotal: number;
  taxaMedia: number;
}

export interface RaioXPropostaInput {
  valorCarta: number;
  percentualEmbutido: number;
  taxaMedia: number;
  numeroMeses: number;
  custoAdministrativo: number;
}

export interface DiagnosticoPropostasInput {
  valorCarta: number;
  percentualEmbutido: number;
  taxaMedia: number;
  numeroMeses: number;
  administradora: string;
}
