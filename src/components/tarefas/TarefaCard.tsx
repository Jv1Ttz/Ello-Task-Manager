import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PrioridadeBadge } from "./PrioridadeBadge";
import { SetorBadge } from "./SetorBadge";
import type { TarefaWithRelations } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ArrowRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  tarefa: TarefaWithRelations;
}

export function TarefaCard({ tarefa }: Props) {
  const isOverdue = tarefa.prazo && new Date(tarefa.prazo) < new Date() && tarefa.status !== "concluido";

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tarefa.id,
    data: { status: tarefa.status },
  });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50 z-50")}>
      <Card className={cn(
        "hover:shadow-md hover:-translate-y-0.5 transition-all bg-white dark:bg-card border border-border",
        tarefa.prioridade === "urgente" && "border-l-4 border-l-red-500",
        isDragging && "shadow-xl"
      )}>
        <CardContent className="p-3 space-y-2.5">
          <div className="flex items-start gap-1">
            {/* Handle de arrastar */}
            <button
              {...listeners}
              {...attributes}
              className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0 space-y-2">
              <Link to={`/tarefas/${tarefa.id}`} className="block">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug line-clamp-2 hover:underline">{tarefa.titulo}</p>
                  <PrioridadeBadge prioridade={tarefa.prioridade} />
                </div>
              </Link>
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
                {tarefa.responsavel ? (
                  <p className="text-xs text-muted-foreground truncate max-w-[100px] text-right">
                    {tarefa.responsavel.nome.split(" ")[0]}
                  </p>
                ) : tarefa.setor_origem !== tarefa.setor_destino ? (
                  <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 shrink-0">
                    Sem responsável
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
