import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, User, LogIn, LogOut, Menu, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/casi-logo.png";
import ufacLogo from "@/assets/ufac-logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/", label: "Início" },
  { to: "/academico", label: "Acadêmico" },
  { to: "/ouvidoria", label: "Ouvidoria" },
  { to: "/eventos", label: "Eventos" },
  { to: "/editais", label: "Editais/Avisos" },
];

export const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ nickname: string | null; display_name: string | null; avatar_url: string | null } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadExtras = async (uid: string | undefined) => {
      if (!uid) { setIsAdmin(false); setProfile(null); return; }
      const [{ data: role }, { data: prof }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
        supabase.from("profiles").select("nickname,display_name,avatar_url").eq("user_id", uid).maybeSingle(),
      ]);
      setIsAdmin(!!role);
      setProfile(prof as any);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      loadExtras(session?.user?.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadExtras(session?.user?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const displayLabel = profile?.nickname || profile?.display_name || user?.email?.split("@")[0] || "";

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 md:h-20 items-center gap-3 md:gap-6">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src={logo} alt="Logo CASI - Centro Acadêmico de Sistemas de Informação" className="h-9 sm:h-10 md:h-14 w-auto drop-shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
        </Link>

        <nav className="hidden lg:flex items-center mx-auto">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => `nav-link ${isActive ? "active text-primary" : ""}`}>
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "active text-primary" : ""}`}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-primary/40 bg-input/60 px-4 py-2 focus-within:shadow-[var(--glow-primary)] transition-shadow">
            <Search className="h-4 w-4 text-primary" />
            <input type="search" placeholder="Buscar..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-40" />
          </div>

          {user ? (
            <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()} title="Sair" className="rounded-full border border-primary/50 hover:bg-primary/10 h-9 w-9">
              <LogOut className="h-4 w-4 text-primary" />
            </Button>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="outline" size="sm" className="hidden sm:flex border-primary/50 text-primary hover:bg-primary/10 hover:text-primary font-display text-xs uppercase tracking-wider">
              <LogIn className="h-4 w-4 sm:mr-2" /> <span className="hidden md:inline">Login</span>
            </Button>
          )}

          {/* Avatar + nickname */}
          <button
            onClick={() => navigate(user ? "/perfil" : "/auth")}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 sm:pr-3 py-1 bg-card/60 border border-primary/40 hover:border-primary hover:shadow-[var(--glow-primary)] transition-all max-w-[160px] sm:max-w-[220px]"
            aria-label="Perfil"
          >
            <span className="relative shrink-0 rounded-full p-0.5 bg-gradient-to-br from-primary to-primary-glow">
              {isAdmin && (
                <span
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 rounded-full bg-gradient-to-br from-gold to-yellow-500 p-0.5 border border-background shadow-[0_0_8px_hsl(45_100%_60%/0.6)]"
                  title="Administrador"
                  aria-label="Administrador"
                >
                  <Crown className="h-2.5 w-2.5 text-background" fill="currentColor" />
                </span>
              )}
              <span className="block rounded-full bg-background overflow-hidden h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
              </span>
            </span>
            {user && displayLabel && (
              <span className="font-display text-[11px] sm:text-xs uppercase tracking-wider text-silver truncate">
                {displayLabel}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden border border-primary/40 text-primary h-9 w-9" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-l border-primary/30 w-[85vw] sm:max-w-sm p-0">
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-primary/20">
                <img src={logo} alt="" className="h-10 w-auto" />
                <img src={ufacLogo} alt="" className="h-7 w-auto opacity-90" />
              </div>
              <nav className="flex flex-col py-4">
                {links.map(l => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `font-display uppercase tracking-widest text-sm px-6 py-3 border-l-2 transition-colors ${
                        isActive
                          ? "text-primary border-primary bg-primary/10"
                          : "text-foreground/80 border-transparent hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `font-display uppercase tracking-widest text-sm px-6 py-3 border-l-2 transition-colors ${
                        isActive
                          ? "text-primary border-primary bg-primary/10"
                          : "text-foreground/80 border-transparent hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                )}
              </nav>
              <div className="px-6 mt-2">
                <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-input/60 px-3 py-2 focus-within:shadow-[var(--glow-primary)] transition-shadow">
                  <Search className="h-4 w-4 text-primary" />
                  <input type="search" placeholder="Buscar..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
                </div>
                {!user && (
                  <Button onClick={() => { setOpen(false); navigate("/auth"); }} className="w-full mt-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest">
                    <LogIn className="h-4 w-4 mr-2" /> Entrar
                  </Button>
                )}
                <p className="mono text-[10px] text-muted-foreground text-center mt-6">&gt; v1.0 :: CASI.SYS</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
