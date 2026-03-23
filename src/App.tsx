import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { KanbanPage } from "@/pages/KanbanPage";
import { TarefaDetailPage } from "@/pages/TarefaDetailPage";
import { TarefaFormPage } from "@/pages/TarefaFormPage";
import { PainelPage } from "@/pages/PainelPage";
import { UsuariosPage } from "@/pages/UsuariosPage";
import { ArquivadosPage } from "@/pages/ArquivadosPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/kanban" element={<KanbanPage />} />
              <Route path="/tarefas/nova" element={<TarefaFormPage />} />
              <Route path="/tarefas/:id" element={<TarefaDetailPage />} />
              <Route path="/tarefas/:id/editar" element={<TarefaFormPage />} />
              <Route
                path="/painel"
                element={
                  <ProtectedRoute allowedRoles={["gestor", "admin"]}>
                    <PainelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/arquivados"
                element={
                  <ProtectedRoute allowedRoles={["gestor", "admin"]}>
                    <ArquivadosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UsuariosPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/kanban" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
