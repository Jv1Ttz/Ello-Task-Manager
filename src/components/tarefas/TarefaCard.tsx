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
        "hover:shadow-md transition-shadow cursor-pointer",
        tarefa.prioridade === "urgente" && "border-red-300 bg-red-50/30"
      )}>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight line-clamp-2">{tarefa.titulo}</p>
            <PrioridadeBadge prioridade={tarefa.prioridade} />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <SetorBadge setor={tarefa.setor_origem} />
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <SetorBadge setor={tarefa.setor_destino} />
          </div>
          {tarefa.prazo && (
            <div className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
              <Calendar className="h-3 w-3" />
              {format(new Date(tarefa.prazo), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          )}
          {tarefa.responsavel && (
            <p className="text-xs text-muted-foreground truncate">
              {tarefa.responsavel.nome}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
