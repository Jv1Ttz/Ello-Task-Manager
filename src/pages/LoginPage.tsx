import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    navigate("/kanban");
  }

  return (
    <div className="min-h-screen flex">

      {/* Lado esquerdo — imagem de fundo com slogan */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/post_thumbnail-12f6b92eda22bd6b29929391720022f0-925x308.jpeg')",
            backgroundSize: "160% auto",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2540]/75 to-[#0a2540]/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold leading-snug mb-3">
            Organize tarefas.<br />Conecte equipes.<br />Entregue resultados.
          </h2>
          <p className="text-white/60 text-sm">
            Gerencie demandas entre setores com clareza e eficiência.
          </p>
          <p className="text-white/30 text-xs mt-8">© 2025 Grupo Ello</p>
        </div>
      </div>

      {/* Lado direito — logo + formulário */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-background px-8 gap-8">

        {/* Logo em destaque */}
        <img
          src="/Gemini_Generated_Image_1h1rwi1h1rwi1h1r.png"
          alt="Grupo Ello Task Manager"
          className="w-64 object-contain"
        />

        {/* Formulário */}
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Bem-vindo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Acesso restrito a colaboradores autorizados.
          </p>
        </div>
      </div>

    </div>
  );
}
