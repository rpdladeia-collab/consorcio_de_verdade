/**
 * ImportToggle — componente reutilizável para importar dados do Módulo 1.
 * Exibido no topo do formulário dos Módulos 2 ao 6.
 */
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Database } from "lucide-react";

interface ImportToggleProps {
  /** Se há dados disponíveis do Módulo 1 */
  hasData: boolean;
  /** Estado atual do toggle */
  enabled: boolean;
  /** Callback ao mudar o toggle */
  onChange: (v: boolean) => void;
}

export function ImportToggle({ hasData, enabled, onChange }: ImportToggleProps) {
  if (!hasData) return null;

  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 mb-4 transition-colors ${
      enabled
        ? "border-[var(--orange)]/40 bg-[var(--orange)]/5"
        : "border-border bg-secondary/30"
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Database className={`w-4 h-4 shrink-0 ${enabled ? "text-[var(--orange)]" : "text-foreground/40"}`} />
        <div className="min-w-0">
          <Label htmlFor="import-toggle" className="text-sm font-medium cursor-pointer leading-tight">
            Importar dados do Módulo 1
          </Label>
          <p className="text-[11px] text-foreground/50 mt-0.5">
            {enabled
              ? "Campos preenchidos automaticamente com os dados simulados"
              : "Desligado — preencha os campos manualmente"}
          </p>
        </div>
      </div>
      <Switch
        id="import-toggle"
        checked={enabled}
        onCheckedChange={onChange}
        className="shrink-0"
      />
    </div>
  );
}
