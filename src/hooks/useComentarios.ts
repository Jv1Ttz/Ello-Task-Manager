import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useComentarios(tarefaId: string) {
  return useQuery({
    queryKey: ["comentarios", tarefaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comentarios")
        .select(`*, autor:profiles(id, nome, setor, role)`)
        .eq("tarefa_id", tarefaId)
        .order("criado_em", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tarefaId,
  });
}

export function useCreateComentario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tarefa_id, autor_id, conteudo }: { tarefa_id: string; autor_id: string; conteudo: string }) => {
      const { data, error } = await supabase
        .from("comentarios")
        .insert({ tarefa_id, autor_id, conteudo })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["comentarios", vars.tarefa_id] });
    },
  });
}

export function useUpdateComentario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, conteudo, tarefa_id }: { id: string; conteudo: string; tarefa_id: string }) => {
      const { data, error } = await supabase
        .from("comentarios")
        .update({ conteudo, editado_em: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...(data as any), tarefa_id };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["comentarios", data.tarefa_id] });
    },
  });
}
