import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/casi-logo.png";

const schema = z.object({
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: "As senhas não coincidem", path: ["confirm"] });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase coloca o token de recovery na URL — onAuthStateChange dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse({ password, confirm });
    if (!p.success) return toast.error(p.error.errors[0].message);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: p.data.password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada com sucesso!");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md panel-glow p-6 sm:p-8">
        <div className="text-center mb-5">
          <img src={logo} alt="CASI" className="h-16 w-auto mx-auto mb-3 drop-shadow-[0_0_15px_hsl(var(--primary)/0.6)]" />
          <h1 className="font-display text-xl text-silver tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> NOVA SENHA
          </h1>
          <p className="text-xs text-muted-foreground mt-2">Defina uma nova senha para acessar sua conta.</p>
        </div>

        {!ready ? (
          <p className="text-sm text-muted-foreground text-center">Validando link de recuperação...</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label className="mono text-[10px] uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5"><Lock className="h-3 w-3" /> Nova senha</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="bg-input/60 border-primary/30 focus-visible:ring-primary mono" />
            </div>
            <div>
              <Label className="mono text-[10px] uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5"><Lock className="h-3 w-3" /> Confirmar senha</Label>
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} className="bg-input/60 border-primary/30 focus-visible:ring-primary mono" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest hover:shadow-[var(--glow-strong)]">
              {loading ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
