import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MimeType } from "@/types";

export function useAnexos(tarefaId: string) {
  return useQuery({
    queryKey: ["anexos", tarefaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anexos")
        .select("*")
        .eq("tarefa_id", tarefaId)
        .order("criado_em", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tarefaId,
  });
}

export function useUploadAnexo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tarefaId,
      file,
      userId,
    }: {
      tarefaId: string;
      file: File;
      userId: string;
    }) => {
      const ext = file.name.split(".").pop();
      const path = `${tarefaId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("anexos")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("anexos").insert({
        tarefa_id: tarefaId,
        nome: file.name,
        storage_path: path,
        mime_type: file.type as MimeType,
        tamanho_kb: Math.ceil(file.size / 1024),
        enviado_por: userId,
      });
      if (dbError) throw dbError;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["anexos", vars.tarefaId] });
    },
  });
}

export async function getSignedUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from("anexos")
    .createSignedUrl(storagePath, 300); // 5 minutes TTL
  if (error) throw error;
  return data.signedUrl;
}
