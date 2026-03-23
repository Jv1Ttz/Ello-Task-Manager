import { useState } from "react";
import { Link } from "react-router-dom";
import { useTarefas, useUpdateTarefaStatus } from "@/hooks/useTarefas";
import { useProfiles } from "@/hooks/useProfiles";
import { TarefaCard } from "@/components/tarefas/TarefaCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SETORES, STATUS_LABELS, PRIORIDADE_LABELS, KANBAN_COLUMNS } from "@/constants/setores";
import type { TarefaWithRelations } from "@/types";
import { Plus, Loader2, ClipboardList, Zap, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const COLUMN_META: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  a_fazer:      { color: "border-slate-400",  bg: "bg-slate-50 dark:bg-slate-900/40",  icon: ClipboardList },
  em_andamento: { color: "border-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20",    icon: Zap },
  aguardando:   { color: "border-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/20",  icon: Clock },
  concluido:    { color: "border-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CheckCircle2 },
};

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
  void updateStatus;

  const canCreate = profile?.ativo;

  const byStatus = (status: string) => {
    const list = tarefas.filter((t) => t.status === status) as TarefaWithRelations[];
    return list.sort((a, b) => {
      const urgentOrder = { urgente: 0, alta: 1, media: 2, baixa: 3 };
      return urgentOrder[a.prioridade] - urgentOrder[b.prioridade];
    });
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quadro de Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""} visível{tarefas.length !== 1 ? "s" : ""}
          </p>
        </div>
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
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {KANBAN_COLUMNS.map((status) => {
            const cards = byStatus(status);
            const meta = COLUMN_META[status];
            const Icon = meta.icon;
            return (
              <div key={status} className={`rounded-xl border-t-4 ${meta.color} ${meta.bg} shadow-sm`}>
                {/* Cabeçalho da coluna */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">{STATUS_LABELS[status]}</h2>
                  </div>
                  <span className="text-xs font-medium bg-white/60 dark:bg-black/20 border border-black/10 rounded-full px-2 py-0.5">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[180px]">
                  {cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2 opacity-40">
                      <Icon className="h-8 w-8" />
                      <p className="text-xs font-medium">Nenhuma tarefa</p>
                    </div>
                  ) : (
                    cards.map((t) => <TarefaCard key={t.id} tarefa={t} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
