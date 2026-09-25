import { useEffect, useRef } from "react";
import {
  SimulatorName,
  trackSimulatorAbandon,
  trackSimulatorComplete,
  trackSimulatorStart,
  trackSimulatorStep,
} from "@/lib/posthog";

interface UseSimulatorTrackerOptions {
  simulator: SimulatorName;
  stage?: string | number;
  stageName?: string;
  hasCalculated?: boolean;
  extraProps?: Record<string, unknown>;
}

export function useSimulatorTracker({
  simulator,
  stage = 1,
  stageName = "Parametrização",
  hasCalculated = false,
  extraProps = {},
}: UseSimulatorTrackerOptions) {
  const isCompletedRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());
  const lastStageRef = useRef<string | number>(stage);

  // Marca início do simulador
  useEffect(() => {
    startTimeRef.current = Date.now();
    isCompletedRef.current = false;
    trackSimulatorStart({
      simulator,
      stage,
      stageName,
      ...extraProps,
    });

    return () => {
      // Se desmontou sem calcular/concluir, registra abandono com a etapa em que parou
      if (!isCompletedRef.current) {
        const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackSimulatorAbandon({
          simulator,
          stage: lastStageRef.current,
          stageName,
          timeSpentSeconds,
          ...extraProps,
        });
      }
    };
  }, [simulator]);

  // Registra mudança de etapa
  useEffect(() => {
    lastStageRef.current = stage;
    trackSimulatorStep({
      simulator,
      stage,
      stageName,
      ...extraProps,
    });
  }, [simulator, stage, stageName]);

  // Registra conclusão quando o cálculo é executado com sucesso
  useEffect(() => {
    if (hasCalculated) {
      isCompletedRef.current = true;
      const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackSimulatorComplete({
        simulator,
        stage,
        stageName,
        timeSpentSeconds,
        ...extraProps,
      });
    }
  }, [hasCalculated, simulator, stage, stageName]);

  const markCompleted = (customProps: Record<string, unknown> = {}) => {
    isCompletedRef.current = true;
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    trackSimulatorComplete({
      simulator,
      stage,
      stageName,
      timeSpentSeconds,
      ...extraProps,
      ...customProps,
    });
  };

  return { markCompleted };
}
