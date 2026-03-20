import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_LABELS, SETORES } from "@/constants/setores";
import { LayoutDashboard, Kanban, Users, LogOut } from "lucide-react";

export function Navbar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  if (!profile) return null;

  const setor = SETORES.find((s) => s.slug === profile.setor);
  const initials = profile.nome.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const links = [
    { to: "/kanban", label: "Kanban", icon: Kanban, roles: ["colaborador", "gestor", "admin"] },
    { to: "/painel", label: "Painel", icon: LayoutDashboard, roles: ["gestor", "admin"] },
    { to: "/usuarios", label: "Usuários", icon: Users, roles: ["admin"] },
  ].filter((l) => l.roles.includes(profile.role));

  return (
    <nav className="border-b bg-background sticky top-0 z-40">
      <div className="container flex h-14 items-center gap-4">
        <Link to="/kanban" className="font-bold text-lg mr-4">
          ETM
        </Link>
        <div className="flex items-center gap-1 flex-1">
          {links.map((link) => (
            <Button
              key={link.to}
              variant={location.pathname.startsWith(link.to) ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to={link.to} className="flex items-center gap-2">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback style={{ backgroundColor: setor?.cor_hex + "33", color: setor?.cor_hex }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-sm">
              <p className="font-medium leading-none">{profile.nome}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[profile.role]}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
