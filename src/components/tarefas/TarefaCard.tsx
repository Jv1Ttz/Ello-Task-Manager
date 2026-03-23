import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PrioridadeBadge } from "./PrioridadeBadge";
import { SetorBadge } from "./SetorBadge";
import type { TarefaWithRelations } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tarefa: TarefaWithRelations;
}

export function TarefaCard({ tarefa }: Props) {
  const isOverdue = tarefa.prazo && new Date(tarefa.prazo) < new Date() && tarefa.status !== "concluido";

  return (
    <Link to={`/tarefas/${tarefa.id}`}>
      <Card className={cn(
        "hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer bg-white dark:bg-card border border-border",
        tarefa.prioridade === "urgente" && "border-l-4 border-l-red-500"
      )}>
        <CardContent className="p-3 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug line-clamp-2">{tarefa.titulo}</p>
            <PrioridadeBadge prioridade={tarefa.prioridade} />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <SetorBadge setor={tarefa.setor_origem} />
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <SetorBadge setor={tarefa.setor_destino} />
          </div>
          <div className="flex items-center justify-between pt-0.5">
            {tarefa.prazo ? (
              <div className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground")}>
                <Calendar className="h-3 w-3" />
                {format(new Date(tarefa.prazo), "dd/MM/yyyy", { locale: ptBR })}
                {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 rounded px-1">Vencida</span>}
              </div>
            ) : <span />}
            {tarefa.responsavel && (
              <p className="text-xs text-muted-foreground truncate max-w-[100px] text-right">
                {tarefa.responsavel.nome.split(" ")[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
