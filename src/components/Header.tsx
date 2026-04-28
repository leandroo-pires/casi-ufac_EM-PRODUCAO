import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, User, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/casi-logo.png";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Início" },
  { to: "/academico", label: "Acadêmico" },
  { to: "/ouvidoria", label: "Ouvidoria" },
  { to: "/eventos", label: "Eventos" },
  { to: "/editais", label: "Editais/Avisos" },
];

export const Header = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Logo CASI - Centro Acadêmico de Sistemas de Informação" className="h-14 w-auto drop-shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
        </Link>

        <nav className="hidden lg:flex items-center mx-auto">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => `nav-link ${isActive ? "active text-primary" : ""}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-primary/40 bg-input/60 px-4 py-2 focus-within:shadow-[var(--glow-primary)] transition-shadow">
            <Search className="h-4 w-4 text-primary" />
            <input
              type="search"
              placeholder="Buscar..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-40"
            />
          </div>

          {user ? (
            <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()} title="Sair" className="rounded-full border border-primary/50 hover:bg-primary/10">
              <LogOut className="h-4 w-4 text-primary" />
            </Button>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="outline" className="hidden sm:flex border-primary/50 text-primary hover:bg-primary/10 hover:text-primary font-display text-xs uppercase tracking-wider">
              <LogIn className="h-4 w-4 mr-2" /> Login
            </Button>
          )}

          <button onClick={() => navigate(user ? "/perfil" : "/auth")} className="relative rounded-full p-0.5 bg-gradient-to-br from-primary to-primary-glow shadow-[var(--glow-primary)] hover:scale-105 transition-transform">
            <div className="rounded-full bg-background p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
