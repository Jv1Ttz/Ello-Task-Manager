import { Badge } from "@/components/ui/badge";
import { PRIORIDADE_LABELS } from "@/constants/setores";
import type { Prioridade } from "@/types";
import { cn } from "@/lib/utils";

const PRIORIDADE_COLORS: Record<Prioridade, string> = {
  baixa: "bg-slate-100 text-slate-700 border-slate-200",
  media: "bg-blue-100 text-blue-700 border-blue-200",
  alta: "bg-orange-100 text-orange-700 border-orange-200",
  urgente: "bg-red-100 text-red-700 border-red-200",
};

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  return (
    <Badge variant="outline" className={cn("text-xs", PRIORIDADE_COLORS[prioridade])}>
      {PRIORIDADE_LABELS[prioridade]}
    </Badge>
  );
}
