import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTarefa, useUpdateTarefaStatus, useArquivarTarefa } from "@/hooks/useTarefas";
import { useComentarios, useCreateComentario } from "@/hooks/useComentarios";
import { useAnexos, useUploadAnexo, getSignedUrl } from "@/hooks/useAnexos";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrioridadeBadge } from "@/components/tarefas/PrioridadeBadge";
import { SetorBadge } from "@/components/tarefas/SetorBadge";
import { STATUS_LABELS } from "@/constants/setores";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Paperclip, Send, Archive, Loader2 } from "lucide-react";
import type { Status } from "@/types";

const VALID_STATUSES: Status[] = ["a_fazer", "em_andamento", "aguardando", "concluido"];

export function TarefaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: tarefa, isLoading } = useTarefa(id!);
  const { data: comentarios = [] } = useComentarios(id!);
  const { data: anexos = [] } = useAnexos(id!);
  const updateStatus = useUpdateTarefaStatus();
  const arquivar = useArquivarTarefa();
  const createComentario = useCreateComentario();
  const uploadAnexo = useUploadAnexo();
  const [comentario, setComentario] = useState("");

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!tarefa) return <p className="text-center text-muted-foreground py-12">Tarefa não encontrada.</p>;

  const canUpdateStatus =
    profile?.role === "gestor" ||
    profile?.role === "admin" ||
    tarefa.criado_por === profile?.id ||
    tarefa.atribuido_para === profile?.id;

  const canArchive = profile?.role === "gestor" || profile?.role === "admin";

  const canMoveToConcluido =
    tarefa.criado_por === profile?.id ||
    profile?.role === "gestor" ||
    profile?.role === "admin";

  const availableStatuses = VALID_STATUSES.filter((s) => {
    if (s === "concluido" && !canMoveToConcluido) return false;
    return true;
  });

  async function handleStatusChange(status: Status) {
    await updateStatus.mutateAsync({ id: tarefa!.id, status });
  }

  async function handleArquivar() {
    await arquivar.mutateAsync(tarefa!.id);
    navigate("/kanban");
  }

  async function handleComentario() {
    if (!comentario.trim() || !profile) return;
    await createComentario.mutateAsync({ tarefa_id: tarefa!.id, autor_id: profile.id, conteudo: comentario.trim() });
    setComentario("");
  }

  async function handleAnexo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    await uploadAnexo.mutateAsync({ tarefaId: tarefa!.id, file, userId: profile.id });
  }

  async function handleOpenAnexo(storagePath: string) {
    const url = await getSignedUrl(storagePath);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold flex-1 leading-tight">{tarefa.titulo}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <PrioridadeBadge prioridade={tarefa.prioridade} />
              <SetorBadge setor={tarefa.setor_origem} />
              <span className="text-muted-foreground text-xs">→</span>
              <SetorBadge setor={tarefa.setor_destino} />
            </div>
            {tarefa.descricao && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tarefa.descricao}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              {canUpdateStatus ? (
                <Select value={tarefa.status} onValueChange={(v) => handleStatusChange(v as Status)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-medium">{STATUS_LABELS[tarefa.status]}</p>
              )}
            </div>
            {tarefa.prazo && (
              <div>
                <p className="text-xs text-muted-foreground">Prazo</p>
                <p className="text-sm">{format(new Date(tarefa.prazo), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Criado em</p>
              <p className="text-sm">{format(new Date(tarefa.criado_em), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            {canArchive && (
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleArquivar} disabled={arquivar.isPending}>
                <Archive className="h-3 w-3 mr-1" />Arquivar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anexos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Anexos ({anexos.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {anexos.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <span className="truncate">{a.nome}</span>
              <Button variant="ghost" size="sm" onClick={() => handleOpenAnexo(a.storage_path)}>
                Abrir
              </Button>
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Paperclip className="h-4 w-4" />
            {uploadAnexo.isPending ? "Enviando..." : "Adicionar anexo"}
            <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleAnexo} />
          </label>
        </CardContent>
      </Card>

      {/* Comentários */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Comentários ({comentarios.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comentarios.map((c) => (
            <div key={c.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{c.autor?.nome ?? "—"}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(c.criado_em), "dd/MM HH:mm", { locale: ptBR })}
                </span>
                {c.editado_em && <span className="text-xs text-muted-foreground">(editado)</span>}
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.conteudo}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <Textarea
              placeholder="Escreva um comentário..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <Button size="icon" onClick={handleComentario} disabled={!comentario.trim() || createComentario.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
