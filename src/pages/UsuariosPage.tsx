import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfiles, useUpdateProfile, useCreateUser, useResetPassword, useDeleteUser } from "@/hooks/useProfiles";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SETORES, ROLE_LABELS } from "@/constants/setores";
import type { Role, Setor } from "@/types";
import { Loader2, UserCheck, UserX, UserPlus, KeyRound, Trash2 } from "lucide-react";

const ROLES: Role[] = ["colaborador", "gestor", "admin"];

const novoUsuarioSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  setor: z.enum(["logistica", "comercial", "fiscal", "financeiro", "ti", "producao", "diretoria"]),
  role: z.enum(["colaborador", "gestor", "admin"]),
});

type NovoUsuarioForm = z.infer<typeof novoUsuarioSchema>;

export function UsuariosPage() {
  const { data: profiles = [], isLoading } = useProfiles();
  const updateProfile = useUpdateProfile();
  const createUser = useCreateUser();
  const resetPassword = useResetPassword();
  const deleteUser = useDeleteUser();
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; userId: string; nome: string; error?: string }>({ open: false, userId: "", nome: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDialog, setResetDialog] = useState<{ open: boolean; userId: string; nome: string }>({ open: false, userId: "", nome: "" });
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NovoUsuarioForm>({
    resolver: zodResolver(novoUsuarioSchema),
    defaultValues: { setor: "ti", role: "colaborador" },
  });

  async function onSubmit(values: NovoUsuarioForm) {
    setErrorMsg(null);
    try {
      await createUser.mutateAsync(values);
      reset();
      setDialogOpen(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao criar usuário.");
    }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await updateProfile.mutateAsync({ id, ativo: !ativo });
  }

  async function changeRole(id: string, role: Role) {
    await updateProfile.mutateAsync({ id, role });
  }

  async function changeSetor(id: string, setor: Setor) {
    await updateProfile.mutateAsync({ id, setor });
  }

  async function handleDeleteUser() {
    setConfirmDelete((d) => ({ ...d, error: undefined }));
    try {
      await deleteUser.mutateAsync(confirmDelete.userId);
      setConfirmDelete({ open: false, userId: "", nome: "" });
    } catch (err) {
      setConfirmDelete((d) => ({ ...d, error: err instanceof Error ? err.message : "Erro ao excluir usuário." }));
    }
  }

  async function handleResetPassword() {
    setResetError(null);
    if (newPassword.length < 6) { setResetError("Mínimo 6 caracteres."); return; }
    try {
      await resetPassword.mutateAsync({ userId: resetDialog.userId, newPassword });
      setResetDialog({ open: false, userId: "", nome: "" });
      setNewPassword("");
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Erro ao redefinir senha.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gerenciar Usuários</h1>
        <Button size="sm" onClick={() => { setErrorMsg(null); reset(); setDialogOpen(true); }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="space-y-3">
        {profiles.map((p) => (
          <Card key={p.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                </div>
                <Select value={p.setor} onValueChange={(v) => changeSetor(p.id, v as Setor)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SETORES.map((s) => (
                      <SelectItem key={s.slug} value={s.slug}>{s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={p.role} onValueChange={(v) => changeRole(p.id, v as Role)}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={p.ativo ? "outline" : "secondary"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => toggleAtivo(p.id, p.ativo)}
                  disabled={updateProfile.isPending}
                >
                  {p.ativo
                    ? <><UserCheck className="h-3 w-3 mr-1" />Ativo</>
                    : <><UserX className="h-3 w-3 mr-1" />Inativo</>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  title="Redefinir senha"
                  onClick={() => { setResetError(null); setNewPassword(""); setResetDialog({ open: true, userId: p.id, nome: p.nome }); }}
                >
                  <KeyRound className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Excluir usuário"
                  onClick={() => setConfirmDelete({ open: true, userId: p.id, nome: p.nome })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {profiles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum usuário cadastrado.
          </p>
        )}
      </div>

      {/* Dialog confirmar exclusão */}
      <Dialog open={confirmDelete.open} onOpenChange={(o) => setConfirmDelete((d) => ({ ...d, open: o }))}>
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <span className="font-medium text-foreground">{confirmDelete.nome}</span>? Esta ação não pode ser desfeita.
          </p>
          {confirmDelete.error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-2">{confirmDelete.error}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false, userId: "", nome: "" })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUser.isPending}>
              {deleteUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog redefinir senha */}
      <Dialog open={resetDialog.open} onOpenChange={(o) => setResetDialog((d) => ({ ...d, open: o }))}>
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Definindo nova senha para <span className="font-medium text-foreground">{resetDialog.nome}</span>.
          </p>
          <div className="space-y-1">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {resetError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-2">{resetError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialog({ open: false, userId: "", nome: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={resetPassword.isPending}>
              {resetPassword.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" {...register("nome")} placeholder="João da Silva" />
              {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} placeholder="joao@empresa.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Senha inicial</Label>
              <Input id="password" type="password" {...register("password")} placeholder="Mínimo 6 caracteres" />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Setor</Label>
                <Select value={watch("setor")} onValueChange={(v) => setValue("setor", v as Setor)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SETORES.map((s) => (
                      <SelectItem key={s.slug} value={s.slug}>{s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.setor && <p className="text-xs text-red-500">{errors.setor.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Perfil</Label>
                <Select value={watch("role")} onValueChange={(v) => setValue("role", v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-2">
                {errorMsg}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
