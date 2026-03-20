import { useTarefas } from "@/hooks/useTarefas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SETORES } from "@/constants/setores";
import { SetorBadge } from "@/components/tarefas/SetorBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export function PainelPage() {
  const { data: tarefas = [] } = useTarefas();

  const hoje = new Date().toISOString().split("T")[0];
  const vencidas = tarefas.filter((t) => t.prazo && t.prazo < hoje && t.status !== "concluido");
  const urgentes = tarefas.filter((t) => t.prioridade === "urgente" && t.status !== "concluido");

  const porSetor = SETORES.map((s) => ({
    setor: s,
    total: tarefas.filter((t) => t.setor_origem === s.slug || t.setor_destino === s.slug).length,
    emAberto: tarefas.filter(
      (t) => (t.setor_origem === s.slug || t.setor_destino === s.slug) && t.status !== "concluido"
    ).length,
  }));

  const crossSetor = tarefas.filter((t) => t.setor_origem !== t.setor_destino && t.status !== "concluido");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Painel Gerencial</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{tarefas.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total de tarefas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-red-600">{vencidas.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Vencidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-orange-600">{urgentes.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Urgentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-blue-600">{crossSetor.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Cross-setor em aberto</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Por Setor</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {porSetor.map(({ setor, total, emAberto }) => (
              <div key={setor.slug} className="flex items-center gap-3">
                <SetorBadge setor={setor.slug as never} />
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: total ? `${((total - emAberto) / total) * 100}%` : "0%", backgroundColor: setor.cor_hex }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{total - emAberto}/{total} concluídas</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {vencidas.length > 0 && (
        <Card className="border-red-200">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />Tarefas Vencidas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vencidas.map((t) => (
                <Link key={t.id} to={`/tarefas/${t.id}`} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md">
                  <span className="text-sm truncate">{t.titulo}</span>
                  <span className="text-xs text-red-600 ml-2 shrink-0">{format(new Date(t.prazo!), "dd/MM/yyyy", { locale: ptBR })}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
