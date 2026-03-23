import { useState } from "react";
import { useTarefasArquivadas, useRestaurarTarefa, useDeleteTarefa } from "@/hooks/useTarefas";
import { SetorBadge } from "@/components/tarefas/SetorBadge";
import { PrioridadeBadge } from "@/components/tarefas/PrioridadeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArchiveRestore, Loader2, ArrowRight, Archive, Trash2 } from "lucide-react";

export function ArquivadosPage() {
  const { data: tarefas = [], isLoading } = useTarefasArquivadas();
  const restaurar = useRestaurarTarefa();
  const deletar = useDeleteTarefa();
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; titulo: string } | null>(null);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tarefas Arquivadas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""} arquivada{tarefas.length !== 1 ? "s" : ""}</p>
      </div>

      {tarefas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Archive className="h-12 w-12 opacity-30" />
          <p className="text-sm">Nenhuma tarefa arquivada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tarefas.map((t) => (
            <Card key={t.id} className="opacity-80 hover:opacity-100 transition-opacity">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium truncate">{t.titulo}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <SetorBadge setor={t.setor_origem} />
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <SetorBadge setor={t.setor_destino} />
                      <PrioridadeBadge prioridade={t.prioridade} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Arquivado em</p>
                      <p className="text-xs font-medium">
                        {format(new Date(t.arquivado_em!), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={restaurar.isPending}
                      onClick={() => restaurar.mutate(t.id)}
                    >
                      {restaurar.isPending && restaurar.variables === t.id
                        ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        : <ArchiveRestore className="h-3 w-3 mr-1" />}
                      Restaurar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmDelete({ id: t.id, titulo: t.titulo })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Excluir tarefa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir permanentemente{" "}
            <span className="font-medium text-foreground">"{confirmDelete?.titulo}"</span>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={deletar.isPending}
              onClick={async () => {
                if (!confirmDelete) return;
                await deletar.mutateAsync(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              {deletar.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
