import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || callerProfile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Acesso negado." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ── Criar usuário ──────────────────────────────────────────
    if (action === "create" || !action) {
      const { email, password, nome, setor, role } = body;

      if (!email || !password || !nome || !setor || !role) {
        return new Response(JSON.stringify({ error: "Campos obrigatórios ausentes." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome, setor, role },
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (newUser.user) {
        await supabaseAdmin.from("profiles").upsert({
          id: newUser.user.id,
          nome,
          email,
          setor,
          role,
          ativo: true,
        }, { onConflict: "id" });
      }

      return new Response(JSON.stringify({ user: newUser.user }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Redefinir senha ────────────────────────────────────────
    if (action === "reset-password") {
      const { userId, newPassword } = body;

      if (!userId || !newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({ error: "userId e senha (mín. 6 caracteres) são obrigatórios." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (resetError) {
        return new Response(JSON.stringify({ error: resetError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Excluir usuário ────────────────────────────────────────
    if (action === "delete-user") {
      const { userId } = body;

      if (!userId) {
        return new Response(JSON.stringify({ error: "userId é obrigatório." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Impede o admin de excluir a si mesmo
      if (userId === user.id) {
        return new Response(JSON.stringify({ error: "Você não pode excluir sua própria conta." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Limpa referências antes de deletar para evitar FK violations
      // 1. Arquiva tarefas criadas pelo usuário
      await supabaseAdmin
        .from("tarefas")
        .update({ arquivado_em: new Date().toISOString() })
        .eq("criado_por", userId)
        .is("arquivado_em", null);

      // 2. Remove atribuição de tarefas atribuídas ao usuário
      await supabaseAdmin
        .from("tarefas")
        .update({ atribuido_para: null })
        .eq("atribuido_para", userId);

      // 3. Remove referência de anexos enviados pelo usuário
      await supabaseAdmin
        .from("anexos")
        .update({ enviado_por: null })
        .eq("enviado_por", userId);

      // 4. Deleta comentários do usuário
      await supabaseAdmin
        .from("comentarios")
        .delete()
        .eq("autor_id", userId);

      // 5. Anonimiza audit_logs (não pode deletar — log imutável)
      await supabaseAdmin
        .from("audit_logs")
        .update({ user_id: null })
        .eq("user_id", userId);

      // 6. Deleta o usuário do auth (cascade apaga o profile)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
