import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SETORES, PRIORIDADE_LABELS } from "@/constants/setores";
import { useProfiles } from "@/hooks/useProfiles";

const schema = z.object({
  titulo: z.string().min(1, "Obrigatório").max(120, "Máximo 120 caracteres"),
  descricao: z.string().max(2000).optional(),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"]),
  setor_origem: z.enum(["logistica", "comercial", "fiscal", "financeiro", "ti", "producao", "diretoria"]),
  setor_destino: z.enum(["logistica", "comercial", "fiscal", "financeiro", "ti", "producao", "diretoria"]),
  atribuido_para: z.string().optional(),
  prazo: z.string().optional(),
  status: z.enum(["a_fazer", "em_andamento", "aguardando", "concluido", "arquivado"]).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TarefaForm({ defaultValues, onSubmit, isLoading, submitLabel = "Salvar" }: Props) {
  const { data: profiles = [] } = useProfiles();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      prioridade: "media",
      setor_origem: "ti",
      setor_destino: "ti",
      ...defaultValues,
    },
  });

  const watchedFields = watch(["setor_origem", "setor_destino", "prioridade", "atribuido_para", "status"]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="titulo">Título *</Label>
        <Input id="titulo" {...register("titulo")} placeholder="Título da tarefa" />
        {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" {...register("descricao")} placeholder="Descreva a tarefa..." rows={4} />
        {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Setor Origem *</Label>
          <Select value={watchedFields[0]} onValueChange={(v) => setValue("setor_origem", v as never)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SETORES.map((s) => <SelectItem key={s.slug} value={s.slug}>{s.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Setor Destino *</Label>
          <Select value={watchedFields[1]} onValueChange={(v) => setValue("setor_destino", v as never)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SETORES.map((s) => <SelectItem key={s.slug} value={s.slug}>{s.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Prioridade *</Label>
          <Select value={watchedFields[2]} onValueChange={(v) => setValue("prioridade", v as never)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORIDADE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="prazo">Prazo</Label>
          <Input id="prazo" type="date" {...register("prazo")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Responsável</Label>
        <Select value={watchedFields[3] ?? ""} onValueChange={(v) => setValue("atribuido_para", v === "_none" ? undefined : v)}>
          <SelectTrigger><SelectValue placeholder="Setor geral (sem responsável)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">Sem responsável</SelectItem>
            {profiles.filter(p => p.ativo).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
