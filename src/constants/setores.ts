import type { SetorRecord } from "@/types";

export const SETORES: SetorRecord[] = [
  { slug: "logistica", nome: "Logística", cor_hex: "#f59e0b" },
  { slug: "comercial", nome: "Comercial", cor_hex: "#10b981" },
  { slug: "fiscal", nome: "Fiscal", cor_hex: "#3b82f6" },
  { slug: "financeiro", nome: "Financeiro", cor_hex: "#8b5cf6" },
  { slug: "ti", nome: "TI", cor_hex: "#06b6d4" },
  { slug: "producao", nome: "Produção", cor_hex: "#f97316" },
  { slug: "diretoria", nome: "Diretoria", cor_hex: "#ec4899" },
];

export const STATUS_LABELS: Record<string, string> = {
  a_fazer: "A Fazer",
  em_andamento: "Em Andamento",
  aguardando: "Aguardando",
  concluido: "Concluído",
  arquivado: "Arquivado",
};

export const PRIORIDADE_LABELS: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const ROLE_LABELS: Record<string, string> = {
  colaborador: "Colaborador",
  gestor: "Gestor",
  admin: "Admin",
};

export const KANBAN_COLUMNS = [
  "a_fazer",
  "em_andamento",
  "aguardando",
  "concluido",
] as const;
