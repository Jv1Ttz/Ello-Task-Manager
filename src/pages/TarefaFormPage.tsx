import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TarefaForm } from "@/components/tarefas/TarefaForm";
import { useCreateTarefa, useUpdateTarefa, useTarefa } from "@/hooks/useTarefas";
import { useUploadAnexo } from "@/hooks/useAnexos";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Paperclip, X } from "lucide-react";
import type { Setor, Prioridade, Status } from "@/types";

export function TarefaFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isEditing = !!id;

  const { data: tarefa, isLoading } = useTarefa(id ?? "");
  const createTarefa = useCreateTarefa();
  const updateTarefa = useUpdateTarefa();
  const uploadAnexo = useUploadAnexo();
  const [arquivos, setArquivos] = useState<File[]>([]);

  async function onSubmit(data: {
    titulo: string;
    descricao?: string;
    prioridade: Prioridade;
    setor_origem: Setor;
    setor_destino: Setor;
    atribuido_para?: string;
    prazo?: string;
    status?: Status;
  }) {
    if (!profile) return;

    if (isEditing && id) {
      await updateTarefa.mutateAsync({
        id,
        titulo: data.titulo,
        descricao: data.descricao ?? null,
        prioridade: data.prioridade,
        setor_origem: data.setor_origem,
        setor_destino: data.setor_destino,
        atribuido_para: data.atribuido_para ?? null,
        prazo: data.prazo ?? null,
      });
    } else {
      const novaTarefa = await createTarefa.mutateAsync({
        titulo: data.titulo,
        descricao: data.descricao ?? null,
        prioridade: data.prioridade,
        setor_origem: data.setor_origem,
        setor_destino: data.setor_destino,
        atribuido_para: data.atribuido_para ?? null,
        prazo: data.prazo ?? null,
        status: "a_fazer",
        criado_por: profile.id,
      });
      for (const file of arquivos) {
        await uploadAnexo.mutateAsync({ tarefaId: novaTarefa.id, file, userId: profile.id });
      }
    }
    navigate("/kanban");
  }

  if (isEditing && isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">{isEditing ? "Editar Tarefa" : "Nova Tarefa"}</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TarefaForm
            defaultValues={
              tarefa
                ? {
                    titulo: tarefa.titulo,
                    descricao: tarefa.descricao ?? undefined,
                    prioridade: tarefa.prioridade,
                    setor_origem: tarefa.setor_origem,
                    setor_destino: tarefa.setor_destino,
                    atribuido_para: tarefa.atribuido_para ?? undefined,
                    prazo: tarefa.prazo ?? undefined,
                  }
                : { setor_origem: profile?.setor as Setor | undefined }
            }
            onSubmit={onSubmit}
            isLoading={createTarefa.isPending || updateTarefa.isPending || uploadAnexo.isPending}
            submitLabel={isEditing ? "Salvar Alterações" : "Criar Tarefa"}
            extraContent={!isEditing ? (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors w-fit">
                  <Paperclip className="h-4 w-4" />
                  Adicionar anexos
                  <input
                    type="file"
                    multiple
                    className="sr-only"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      const novos = Array.from(e.target.files ?? []);
                      setArquivos((prev) => [...prev, ...novos]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {arquivos.length > 0 && (
                  <ul className="space-y-1">
                    {arquivos.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1">
                        <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{f.name}</span>
                        <button type="button" onClick={() => setArquivos((prev) => prev.filter((_, j) => j !== i))}>
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
