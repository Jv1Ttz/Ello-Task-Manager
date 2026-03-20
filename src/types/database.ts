export type Role = "colaborador" | "gestor" | "admin";
export type Status = "a_fazer" | "em_andamento" | "aguardando" | "concluido" | "arquivado";
export type Prioridade = "baixa" | "media" | "alta" | "urgente";
export type Setor = "logistica" | "comercial" | "fiscal" | "financeiro" | "ti" | "producao" | "diretoria";
export type MimeType = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
export type AuditAction = "INSERT" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";

export interface SetorRecord {
  slug: Setor;
  nome: string;
  cor_hex: string;
}

export interface Profile {
  id: string;
  nome: string;
  email: string;
  setor: Setor;
  role: Role;
  ativo: boolean;
  criado_em: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  status: Status;
  prioridade: Prioridade;
  setor_origem: Setor;
  setor_destino: Setor;
  criado_por: string;
  atribuido_para: string | null;
  prazo: string | null;
  arquivado_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface TarefaWithRelations extends Tarefa {
  criador?: Profile;
  responsavel?: Profile;
}

export interface Comentario {
  id: string;
  tarefa_id: string;
  autor_id: string;
  conteudo: string;
  editado_em: string | null;
  criado_em: string;
  autor?: Profile;
}

export interface Anexo {
  id: string;
  tarefa_id: string;
  nome: string;
  storage_path: string;
  mime_type: MimeType;
  tamanho_kb: number | null;
  enviado_por: string | null;
  criado_em: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  tabela: string;
  registro_id: string | null;
  dados_antes: Record<string, unknown> | null;
  dados_depois: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  criado_em: string;
}

export interface Database {
  public: {
    Tables: {
      setores: {
        Row: SetorRecord;
        Insert: SetorRecord;
        Update: Partial<SetorRecord>;
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          nome: string;
          email: string;
          setor: Setor;
          role: Role;
          ativo: boolean;
        };
        Update: {
          nome?: string;
          email?: string;
          setor?: Setor;
          role?: Role;
          ativo?: boolean;
        };
      };
      tarefas: {
        Row: Tarefa;
        Insert: {
          titulo: string;
          descricao?: string | null;
          status: Status;
          prioridade: Prioridade;
          setor_origem: Setor;
          setor_destino: Setor;
          criado_por: string;
          atribuido_para?: string | null;
          prazo?: string | null;
          arquivado_em?: string | null;
        };
        Update: {
          titulo?: string;
          descricao?: string | null;
          status?: Status;
          prioridade?: Prioridade;
          setor_origem?: Setor;
          setor_destino?: Setor;
          atribuido_para?: string | null;
          prazo?: string | null;
          arquivado_em?: string | null;
          atualizado_em?: string;
        };
      };
      comentarios: {
        Row: Comentario;
        Insert: {
          tarefa_id: string;
          autor_id: string;
          conteudo: string;
          editado_em?: string | null;
        };
        Update: {
          conteudo?: string;
          editado_em?: string | null;
        };
      };
      anexos: {
        Row: Anexo;
        Insert: {
          tarefa_id: string;
          nome: string;
          storage_path: string;
          mime_type: MimeType;
          tamanho_kb?: number | null;
          enviado_por?: string | null;
        };
        Update: Record<string, never>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Record<string, never>;
        Update: Record<string, never>;
      };
    };
    Functions: {
      get_my_role: { Returns: Role };
      get_my_setor: { Returns: Setor };
    };
  };
}
