import { useState } from "react";
import { Link } from "react-router-dom";
import { useTarefas, useUpdateTarefaStatus } from "@/hooks/useTarefas";
import { useProfiles } from "@/hooks/useProfiles";
import { TarefaCard } from "@/components/tarefas/TarefaCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SETORES, STATUS_LABELS, PRIORIDADE_LABELS, KANBAN_COLUMNS } from "@/constants/setores";
import type { TarefaWithRelations } from "@/types";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function KanbanPage() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState({ setor: "", prioridade: "", atribuido_para: "" });
  const { data: tarefas = [], isLoading } = useTarefas({
    setor: filters.setor || undefined,
    prioridade: filters.prioridade || undefined,
    atribuido_para: filters.atribuido_para || undefined,
  });
  const { data: profiles = [] } = useProfiles();
  const updateStatus = useUpdateTarefaStatus();

  const canCreate = profile?.ativo;

  const byStatus = (status: string) => {
    const list = tarefas.filter((t) => t.status === status) as TarefaWithRelations[];
    return list.sort((a, b) => {
      const urgentOrder = { urgente: 0, alta: 1, media: 2, baixa: 3 };
      return urgentOrder[a.prioridade] - urgentOrder[b.prioridade];
    });
  };

  void updateStatus;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Kanban</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filters.setor} onValueChange={(v) => setFilters((f) => ({ ...f, setor: v === "_all" ? "" : v }))}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Setor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos os setores</SelectItem>
              {SETORES.map((s) => <SelectItem key={s.slug} value={s.slug}>{s.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.prioridade} onValueChange={(v) => setFilters((f) => ({ ...f, prioridade: v === "_all" ? "" : v }))}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todas</SelectItem>
              {Object.entries(PRIORIDADE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.atribuido_para} onValueChange={(v) => setFilters((f) => ({ ...f, atribuido_para: v === "_all" ? "" : v }))}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos</SelectItem>
              {profiles.filter(p => p.ativo).map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          {canCreate && (
            <Button size="sm" asChild>
              <Link to="/tarefas/nova"><Plus className="h-4 w-4 mr-1" />Nova Tarefa</Link>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {KANBAN_COLUMNS.map((status) => {
            const cards = byStatus(status);
            return (
              <div key={status} className="bg-muted/40 rounded-lg p-3 space-y-2 min-h-[200px]">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{STATUS_LABELS[status]}</h2>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2">{cards.length}</span>
                </div>
                {cards.map((t) => <TarefaCard key={t.id} tarefa={t} />)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
