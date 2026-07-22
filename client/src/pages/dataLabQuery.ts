export type DataLabPeriodPreset = "12m" | "5y" | "10y" | "all" | "custom";

export function resolveVisibleMetricId(
  currentMetricId: string,
  visibleMetrics: ReadonlyArray<{ id: string }>,
): string {
  return visibleMetrics.some(metric => metric.id === currentMetricId)
    ? currentMetricId
    : (visibleMetrics[0]?.id ?? "");
}

export function getActiveCustomBounds(
  period: DataLabPeriodPreset,
  customStartDataBase: number | undefined,
  customEndDataBase: number | undefined,
) {
  if (period !== "custom") {
    return {
      customStartDataBase: undefined,
      customEndDataBase: undefined,
    };
  }

  return {
    customStartDataBase,
    customEndDataBase,
  };
}
