import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tarefa, Status } from "@/types";

export interface TarefaFilters {
  setor?: string;
  prioridade?: string;
  atribuido_para?: string;
  prazo_ate?: string;
}

export function useTarefas(filters: TarefaFilters = {}) {
  return useQuery({
    queryKey: ["tarefas", filters],
    queryFn: async () => {
      let query = supabase
        .from("tarefas")
        .select(`
          *,
          criador:profiles!criado_por(id, nome, setor, role),
          responsavel:profiles!atribuido_para(id, nome, setor, role)
        `)
        .is("arquivado_em", null)
        .order("prioridade", { ascending: false })
        .order("criado_em", { ascending: false });

      if (filters.setor) {
        query = query.or(`setor_origem.eq.${filters.setor},setor_destino.eq.${filters.setor}`);
      }
      if (filters.prioridade) {
        query = query.eq("prioridade", filters.prioridade);
      }
      if (filters.atribuido_para) {
        query = query.eq("atribuido_para", filters.atribuido_para);
      }
      if (filters.prazo_ate) {
        query = query.lte("prazo", filters.prazo_ate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTarefa(id: string) {
  return useQuery({
    queryKey: ["tarefa", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select(`
          *,
          criador:profiles!criado_por(id, nome, setor, role),
          responsavel:profiles!atribuido_para(id, nome, setor, role)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateTarefaStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ status, atualizado_em: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
    },
  });
}

export function useArquivarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ arquivado_em: new Date().toISOString(), status: "arquivado" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
    },
  });
}

export function useCreateTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tarefa: Omit<Tarefa, "id" | "criado_em" | "atualizado_em" | "arquivado_em">) => {
      const { data, error } = await supabase
        .from("tarefas")
        .insert(tarefa)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
    },
  });
}

export function useUpdateTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tarefa> & { id: string }) => {
      const { data, error } = await supabase
        .from("tarefas")
        .update({ ...updates, atualizado_em: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["tarefa", vars.id] });
    },
  });
}
