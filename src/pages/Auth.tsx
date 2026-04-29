import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Terminal, Lock, Mail, User as UserIcon, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/casi-logo.png";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
const signupSchema = loginSchema.extend({
  display_name: z.string().trim().min(2, "Nome muito curto").max(80),
});
const forgotSchema = z.object({ email: z.string().email("Email inválido") });

const SUPPORT_EMAIL = "casi@ufac.br";

const errorWithSupport = (msg: string) =>
  toast.error(msg, {
    description: (
      <span className="text-xs">
        Precisa de ajuda? Fale com o suporte:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline mono">
          {SUPPORT_EMAIL}
        </a>
      </span>
    ) as any,
    duration: 7000,
  });

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ display_name: "", email: "", password: "" });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => session && navigate("/"));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => s && navigate("/"));
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = loginSchema.safeParse(login);
    if (!p.success) return errorWithSupport(p.error.errors[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: p.data.email, password: p.data.password });
    setLoading(false);
    error ? errorWithSupport(error.message) : toast.success("Acesso autorizado.");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = signupSchema.safeParse(signup);
    if (!p.success) return errorWithSupport(p.error.errors[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: p.data.email,
      password: p.data.password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: p.data.display_name } },
    });
    setLoading(false);
    error ? errorWithSupport(error.message) : toast.success("Cadastro realizado! Verifique seu email.");
  };

  const handleGoogle = async () => {
    setOauthLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setOauthLoading(false);
      errorWithSupport("Falha ao entrar com Google");
      return;
    }
    if (result.redirected) return;
    navigate("/");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = forgotSchema.safeParse({ email: forgotEmail });
    if (!p.success) return toast.error(p.error.errors[0].message);
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(p.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Enviamos um link de recuperação para seu email.");
    setForgotOpen(false);
    setForgotEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 mono text-[9px] sm:text-[10px] text-primary/10 overflow-hidden p-4 sm:p-6 leading-tight pointer-events-none select-none whitespace-nowrap">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i}>&gt; {Array.from({ length: 80 }).map(() => Math.random() > 0.5 ? "1" : "0").join("")}</div>
        ))}
      </div>

      <div className="relative w-full max-w-md panel-glow p-6 sm:p-8 animate-fade-up">
        <button
          onClick={() => navigate("/")}
          className="mono text-[11px] uppercase tracking-widest text-primary/80 hover:text-primary flex items-center gap-1.5 mb-4 transition-colors group"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> voltar ao início
        </button>
        <div className="text-center mb-5 sm:mb-6">
          <img src={logo} alt="CASI" className="h-16 sm:h-20 w-auto mx-auto mb-3 drop-shadow-[0_0_15px_hsl(var(--primary)/0.6)]" />
          <div className="mono text-[10px] sm:text-xs text-primary mb-1">&gt; access_terminal --area=aluno</div>
          <h1 className="font-display text-lg sm:text-2xl text-silver tracking-widest flex items-center justify-center gap-2">
            <Terminal className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" /> ÁREA DO ALUNO
          </h1>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 w-full bg-input/60 border border-primary/30">
            <TabsTrigger value="login" className="font-display text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Login</TabsTrigger>
            <TabsTrigger value="signup" className="font-display text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Cadastro</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <Field icon={Mail} label="Email" type="email" value={login.email} onChange={v => setLogin({ ...login, email: v })} />
              <Field icon={Lock} label="Senha" type="password" value={login.password} onChange={v => setLogin({ ...login, password: v })} />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setForgotEmail(login.email); setForgotOpen(true); }}
                  className="mono text-[10px] uppercase tracking-widest text-primary/80 hover:text-primary transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest hover:shadow-[var(--glow-strong)]">
                {loading ? "Autenticando..." : "Entrar no Sistema"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignup} className="space-y-3">
              <Field icon={UserIcon} label="Nome" value={signup.display_name} onChange={v => setSignup({ ...signup, display_name: v })} />
              <Field icon={Mail} label="Email" type="email" value={signup.email} onChange={v => setSignup({ ...signup, email: v })} />
              <Field icon={Lock} label="Senha" type="password" value={signup.password} onChange={v => setSignup({ ...signup, password: v })} />
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest hover:shadow-[var(--glow-strong)]">
                {loading ? "Registrando..." : "Criar Acesso"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Divisor + Google */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-primary/20" />
          <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-primary/20" />
        </div>
        <Button
          type="button"
          onClick={handleGoogle}
          disabled={oauthLoading}
          variant="outline"
          className="w-full bg-background/60 border-primary/40 hover:bg-primary/10 hover:border-primary text-foreground font-display uppercase tracking-wider text-xs"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden>
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-9.4 0-.6-.1-1.2-.2-1.9H12z"/>
          </svg>
          {oauthLoading ? "Conectando..." : "Continuar com Google"}
        </Button>

        {/* Suporte */}
        <div className="mt-6 rounded-md border border-primary/20 bg-card/40 px-3 py-2.5 flex items-start gap-2">
          <LifeBuoy className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Problemas para acessar ou se cadastrar? Fale com o suporte do CASI:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline mono">{SUPPORT_EMAIL}</a>
          </p>
        </div>

        <p className="mono text-[10px] text-muted-foreground text-center mt-4">&gt; secure_connection :: AES-256 :: CASI.SYS</p>
      </div>

      {/* Dialog: esqueci minha senha */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="bg-background border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-display tracking-widest text-silver">Recuperar senha</DialogTitle>
            <DialogDescription>
              Informe seu email cadastrado. Enviaremos um link para você criar uma nova senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgot} className="space-y-3">
            <Field icon={Mail} label="Email" type="email" value={forgotEmail} onChange={setForgotEmail} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setForgotOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={forgotLoading} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest">
                {forgotLoading ? "Enviando..." : "Enviar link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ icon: Icon, label, type = "text", value, onChange }: any) => (
  <div>
    <Label className="mono text-[10px] uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5"><Icon className="h-3 w-3" /> {label}</Label>
    <Input type={type} value={value} onChange={e => onChange(e.target.value)} required className="bg-input/60 border-primary/30 focus-visible:ring-primary mono" />
  </div>
);

export default Auth;
