/**
 * Store global de simuladores — Zustand com persist
 * Salva os parâmetros base do Módulo 1 para reutilização nos Módulos 2 ao 6.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SimuladorBaseParams {
  /** Valor da carta de crédito (R$) */
  credit: number;
  /** Prazo total do grupo (meses) */
  term: number;
  /** Taxa de administração total (%) */
  adminRate: number;
  /** Fundo de reserva (%) */
  reserveRate: number;
  /** Seguro de vida (%) */
  insuranceRate: number;
  /** Correção anual (%) */
  adjRate: number;
  /** Correção a cada N meses */
  adjEvery: number;
  /** Modalidade: "simples" | "progressivo" */
  mode: string;
}

interface SimuladorStore {
  /** Parâmetros salvos do Módulo 1 */
  baseParams: SimuladorBaseParams | null;
  /** Indica se há dados salvos */
  hasData: boolean;
  /** Salva os parâmetros do Módulo 1 */
  saveBaseParams: (params: SimuladorBaseParams) => void;
  /** Limpa os dados salvos */
  clearBaseParams: () => void;
}

export const useSimuladorStore = create<SimuladorStore>()(
  persist(
    (set) => ({
      baseParams: null,
      hasData: false,
      saveBaseParams: (params) =>
        set({ baseParams: params, hasData: true }),
      clearBaseParams: () =>
        set({ baseParams: null, hasData: false }),
    }),
    {
      name: "cdv-simulador-base", // chave no localStorage
    }
  )
);
