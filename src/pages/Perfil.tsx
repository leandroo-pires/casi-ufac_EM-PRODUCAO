import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useBeforeUnload } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { z } from "zod";
import {
  User as UserIcon, Camera, Save, LogOut, Instagram, Github, Linkedin, Twitter,
  GraduationCap, Calendar, AtSign, Loader2, Trash2, ShieldCheck, Shield, ShieldAlert,
  KeyRound, Mail, Crown,
} from "lucide-react";
import {
  normalizeInstagram, normalizeTwitter, normalizeGithub, normalizeLinkedin,
  socialUrl, validators,
} from "@/lib/socialNormalize";

// ---------- Schema com mensagens específicas por campo ----------
const today = new Date();
const minBirth = new Date(today.getFullYear() - 100, 0, 1);
const maxBirth = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

const profileSchema = z.object({
  display_name: z.string().trim().min(2, "Nome completo deve ter ao menos 2 caracteres").max(80, "Máximo 80 caracteres"),
  nickname: z.string().trim().max(40, "Máximo 40 caracteres")
    .regex(/^[A-Za-z0-9._-]*$/, "Use apenas letras, números, ponto, traço ou underscore").optional().or(z.literal("")),
  matricula: z.string().trim().max(40).regex(/^[A-Za-z0-9-]*$/, "Matrícula inválida").optional().or(z.literal("")),
  curso: z.string().trim().max(80, "Máximo 80 caracteres").optional().or(z.literal("")),
  periodo: z.string().trim().max(20, "Máximo 20 caracteres")
    .regex(/^(\s*|[1-9]|10|[1-9]º( período)?|10º( período)?)$/i, "Use formato: 5 ou 5º período").optional().or(z.literal("")),
  data_nascimento: z.string().optional().or(z.literal("")).refine(v => {
    if (!v) return true;
    const d = new Date(v);
    return !isNaN(d.getTime()) && d >= minBirth && d <= maxBirth;
  }, "Data de nascimento inválida (idade mínima 13 anos)"),
  bio: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
  instagram: z.string().max(60).refine(validators.handle, "Usuário Instagram inválido").optional().or(z.literal("")),
  github:    z.string().max(60).refine(validators.handle, "Usuário GitHub inválido").optional().or(z.literal("")),
  linkedin:  z.string().max(80).refine(validators.linkedin, "Use formato in/usuario ou company/usuario").optional().or(z.literal("")),
  twitter:   z.string().max(60).refine(validators.handle, "Usuário Twitter/X inválido").optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;
type Errors = Partial<Record<keyof ProfileForm, string>>;

const empty: ProfileForm = {
  display_name: "", nickname: "", matricula: "", curso: "", periodo: "",
  data_nascimento: "", bio: "", instagram: "", github: "", linkedin: "", twitter: "",
};

const Perfil = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>(empty);
  const [initial, setInitial] = useState<ProfileForm>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 2FA
  const [factors, setFactors] = useState<any[]>([]);
  const [enroll, setEnroll] = useState<{ id: string; uri: string; secret: string } | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [twoFaBusy, setTwoFaBusy] = useState(false);

  // Admin flag
  const [isAdmin, setIsAdmin] = useState(false);

  // Troca de senha
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdResetLoading, setPwdResetLoading] = useState(false);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  // Aviso de saída (refresh / fechar aba)
  useBeforeUnload((e) => {
    if (dirty) { e.preventDefault(); (e as any).returnValue = ""; }
  });

  const loadFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) {
        const next: ProfileForm = {
          display_name: data.display_name ?? "",
          nickname: (data as any).nickname ?? "",
          matricula: data.matricula ?? "",
          curso: (data as any).curso ?? "",
          periodo: (data as any).periodo ?? "",
          data_nascimento: (data as any).data_nascimento ?? "",
          bio: data.bio ?? "",
          instagram: (data as any).instagram ?? "",
          github: (data as any).github ?? "",
          linkedin: (data as any).linkedin ?? "",
          twitter: (data as any).twitter ?? "",
        };
        setForm(next); setInitial(next);
        setAvatar(data.avatar_url ?? null);
      }
      // checa role admin
      const { data: roleRow } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!roleRow);
      await loadFactors();
      setLoading(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) navigate("/auth"); });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Validação por campo (em onChange)
  const setField = (k: keyof ProfileForm, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    const result = profileSchema.safeParse(next);
    if (result.success) setErrors({});
    else {
      const map: Errors = {};
      result.error.errors.forEach(err => {
        const key = err.path[0] as keyof ProfileForm;
        if (!map[key]) map[key] = err.message;
      });
      setErrors(map);
    }
  };

  // ---------- Avatar: upload com progresso, erro, remoção ----------
  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return toast.error("Selecione uma imagem");
    if (file.size > 5 * 1024 * 1024) return toast.error("Imagem deve ter no máximo 5MB");

    setUploading(true); setProgress(5);
    const tick = setInterval(() => setProgress(p => Math.min(p + 7, 90)), 120);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: e2 } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
      if (e2) throw e2;
      // remover anterior
      if (avatarPath) await supabase.storage.from("avatars").remove([avatarPath]).catch(() => {});
      setAvatar(publicUrl); setAvatarPath(path);
      setProgress(100);
      toast.success("Foto atualizada!");
    } catch (err: any) {
      toast.error(err?.message ?? "Falha no upload da foto");
    } finally {
      clearInterval(tick);
      setTimeout(() => { setUploading(false); setProgress(0); }, 400);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !avatar) return;
    setUploading(true);
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
      if (error) throw error;
      // tenta deletar o objeto se conhecermos o path
      try {
        const url = new URL(avatar);
        const idx = url.pathname.indexOf("/avatars/");
        if (idx >= 0) {
          const objectPath = url.pathname.slice(idx + "/avatars/".length);
          await supabase.storage.from("avatars").remove([objectPath]);
        }
      } catch { /* ignore */ }
      setAvatar(null); setAvatarPath(null);
      toast.success("Foto removida");
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao remover foto");
    } finally {
      setUploading(false);
    }
  };

  // ---------- Save com normalização das redes ----------
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // normaliza antes de validar
    const normalized: ProfileForm = {
      ...form,
      instagram: normalizeInstagram(form.instagram ?? ""),
      twitter:   normalizeTwitter(form.twitter ?? ""),
      github:    normalizeGithub(form.github ?? ""),
      linkedin:  normalizeLinkedin(form.linkedin ?? ""),
    };
    const parsed = profileSchema.safeParse(normalized);
    if (!parsed.success) {
      const map: Errors = {};
      parsed.error.errors.forEach(err => {
        const key = err.path[0] as keyof ProfileForm;
        if (!map[key]) map[key] = err.message;
      });
      setErrors(map);
      return toast.error(parsed.error.errors[0].message);
    }
    setForm(normalized);
    setErrors({});
    setSaving(true);
    const payload: any = { ...parsed.data };
    if (!payload.data_nascimento) payload.data_nascimento = null;
    const { error } = await supabase.from("profiles").update(payload).eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setInitial(normalized);
    toast.success("Perfil atualizado.");
  };

  // ---------- 2FA TOTP ----------
  const startEnroll = async () => {
    setTwoFaBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "CASI 2FA" });
    setTwoFaBusy(false);
    if (error) return toast.error(error.message);
    setEnroll({ id: data.id, uri: data.totp.uri, secret: data.totp.secret });
  };
  const verifyEnroll = async () => {
    if (!enroll) return;
    setTwoFaBusy(true);
    const { data: ch, error: ce } = await supabase.auth.mfa.challenge({ factorId: enroll.id });
    if (ce) { setTwoFaBusy(false); return toast.error(ce.message); }
    const { error } = await supabase.auth.mfa.verify({ factorId: enroll.id, challengeId: ch.id, code: enrollCode });
    setTwoFaBusy(false);
    if (error) return toast.error(error.message);
    toast.success("2FA ativada!");
    setEnroll(null); setEnrollCode("");
    await loadFactors();
  };
  const disableFactor = async (id: string) => {
    setTwoFaBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setTwoFaBusy(false);
    if (error) return toast.error(error.message);
    toast.success("2FA desativada");
    await loadFactors();
  };

  if (loading) {
    return <Layout><div className="container py-20 flex items-center justify-center"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div></Layout>;
  }

  const previewName = form.nickname || form.display_name || "Aluno SI";

  return (
    <Layout>
      <div className="container py-6 md:py-10 max-w-5xl">
        <BackButton />
        <header className="mb-6 md:mb-8">
          <p className="mono text-[10px] sm:text-xs text-primary mb-2">// /perfil --user={user?.email}</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">MEU PERFIL</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">Configure suas informações como aluno do CASI UFAC.</p>
        </header>

        <form onSubmit={handleSave} className="grid gap-5 md:grid-cols-[280px_1fr]">
          {/* Avatar + Preview */}
          <aside className="space-y-5 md:sticky md:top-24 self-start">
            <div className="panel-glow p-5 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full p-1 bg-gradient-to-br from-primary to-primary-glow shadow-[var(--glow-primary)]">
                  <div className="h-full w-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-12 w-12 text-primary/60" />
                    )}
                  </div>
                </div>
                <button
                  type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground p-2 border-2 border-background shadow-[var(--glow-primary)] hover:scale-110 transition-transform disabled:opacity-50"
                  aria-label="Trocar foto"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </div>

              {uploading && <Progress value={progress} className="w-full h-2" />}

              <div className="text-center">
                <p className="font-display text-base text-silver tracking-wider truncate max-w-[220px]">{previewName}</p>
                <p className="mono text-[10px] text-muted-foreground break-all">{user?.email}</p>
              </div>

              {avatar && (
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={uploading}
                  className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive font-display uppercase text-[11px] tracking-widest">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Remover foto
                </Button>
              )}

              <Button type="button" variant="outline" size="sm"
                onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
                className="w-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary font-display uppercase text-[11px] tracking-widest">
                <LogOut className="h-3.5 w-3.5 mr-2" /> Sair
              </Button>
            </div>

            {/* Pré-visualização: como aparece no header/cards */}
            <div className="panel-base p-4">
              <h3 className="mono text-[10px] uppercase tracking-widest text-primary mb-3">// preview --header</h3>
              <div className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 bg-card/60 border border-primary/40 max-w-full">
                <span className="rounded-full p-0.5 bg-gradient-to-br from-primary to-primary-glow shrink-0">
                  <span className="block rounded-full bg-background overflow-hidden h-8 w-8 flex items-center justify-center">
                    {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-4 w-4 text-primary" />}
                  </span>
                </span>
                <span className="font-display text-xs uppercase tracking-wider text-silver truncate">{previewName}</span>
              </div>

              <h3 className="mono text-[10px] uppercase tracking-widest text-primary mt-4 mb-2">// preview --card</h3>
              <div className="esports-card p-4 flex gap-3 items-start">
                <span className="rounded-full p-0.5 bg-gradient-to-br from-primary to-primary-glow shrink-0">
                  <span className="block rounded-full bg-background overflow-hidden h-12 w-12 flex items-center justify-center">
                    {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-6 w-6 text-primary" />}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm text-silver truncate">{previewName}</p>
                  <p className="mono text-[10px] text-muted-foreground truncate">{form.curso || "Sistemas de Informação"} · {form.periodo || "—"}</p>
                  <p className="text-xs text-foreground/80 line-clamp-2 mt-1">{form.bio || "Sem bio."}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {form.instagram && <a href={socialUrl.instagram(normalizeInstagram(form.instagram))} target="_blank" rel="noreferrer"><Instagram className="h-3.5 w-3.5 text-primary" /></a>}
                    {form.github    && <a href={socialUrl.github(normalizeGithub(form.github))} target="_blank" rel="noreferrer"><Github    className="h-3.5 w-3.5 text-primary" /></a>}
                    {form.linkedin  && <a href={socialUrl.linkedin(normalizeLinkedin(form.linkedin))} target="_blank" rel="noreferrer"><Linkedin  className="h-3.5 w-3.5 text-primary" /></a>}
                    {form.twitter   && <a href={socialUrl.twitter(normalizeTwitter(form.twitter))} target="_blank" rel="noreferrer"><Twitter   className="h-3.5 w-3.5 text-primary" /></a>}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Fields */}
          <div className="space-y-5">
            <section className="panel-base p-5">
              <h2 className="mono text-xs text-primary mb-4">// dados_pessoais</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo" icon={UserIcon} value={form.display_name} onChange={v => setField("display_name", v)} required error={errors.display_name} />
                <Field label="Nickname" icon={AtSign} value={form.nickname ?? ""} onChange={v => setField("nickname", v)} placeholder="ex: dev_acre" error={errors.nickname} />
                <Field label="Matrícula" value={form.matricula ?? ""} onChange={v => setField("matricula", v)} error={errors.matricula} />
                <Field label="Data de nascimento" icon={Calendar} type="date" value={form.data_nascimento ?? ""} onChange={v => setField("data_nascimento", v)} error={errors.data_nascimento} />
              </div>
            </section>

            <section className="panel-base p-5">
              <h2 className="mono text-xs text-primary mb-4">// academico</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Curso" icon={GraduationCap} value={form.curso ?? ""} onChange={v => setField("curso", v)} placeholder="Sistemas de Informação" error={errors.curso} />
                <Field label="Período" value={form.periodo ?? ""} onChange={v => setField("periodo", v)} placeholder="ex: 5º período" error={errors.periodo} />
              </div>
              <div className="mt-4">
                <Label className="mono text-[10px] uppercase tracking-widest text-primary mb-1 block">Bio</Label>
                <Textarea value={form.bio ?? ""} onChange={e => setField("bio", e.target.value)} rows={3} maxLength={500}
                  placeholder="Conte um pouco sobre você..."
                  className="bg-input/60 border-primary/30 focus-visible:ring-primary" />
                {errors.bio && <p className="mono text-[10px] text-destructive mt-1">{errors.bio}</p>}
                <p className="mono text-[10px] text-muted-foreground mt-1 text-right">{(form.bio ?? "").length}/500</p>
              </div>
            </section>

            <section className="panel-base p-5">
              <h2 className="mono text-xs text-primary mb-4">// redes_sociais</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Instagram" icon={Instagram} value={form.instagram ?? ""} onChange={v => setField("instagram", v)}
                  placeholder="@usuario ou link"
                  hint={form.instagram ? socialUrl.instagram(normalizeInstagram(form.instagram)) : ""}
                  error={errors.instagram} />
                <Field label="GitHub" icon={Github} value={form.github ?? ""} onChange={v => setField("github", v)}
                  placeholder="usuario ou link"
                  hint={form.github ? socialUrl.github(normalizeGithub(form.github)) : ""}
                  error={errors.github} />
                <Field label="LinkedIn" icon={Linkedin} value={form.linkedin ?? ""} onChange={v => setField("linkedin", v)}
                  placeholder="in/usuario ou link"
                  hint={form.linkedin ? socialUrl.linkedin(normalizeLinkedin(form.linkedin)) : ""}
                  error={errors.linkedin} />
                <Field label="Twitter / X" icon={Twitter} value={form.twitter ?? ""} onChange={v => setField("twitter", v)}
                  placeholder="@usuario ou link"
                  hint={form.twitter ? socialUrl.twitter(normalizeTwitter(form.twitter)) : ""}
                  error={errors.twitter} />
              </div>
            </section>

            {/* 2FA */}
            <section className="panel-base p-5">
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div>
                  <h2 className="mono text-xs text-primary">// seguranca --2fa</h2>
                  <p className="text-xs text-muted-foreground mt-1">Verificação em duas etapas via app autenticador (TOTP).</p>
                </div>
                {factors.some(f => f.status === "verified") ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-primary mono uppercase tracking-widest">
                    <ShieldCheck className="h-4 w-4" /> Ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mono uppercase tracking-widest">
                    <ShieldAlert className="h-4 w-4" /> Inativa
                  </span>
                )}
              </div>

              {factors.filter(f => f.status === "verified").map(f => (
                <div key={f.id} className="flex items-center justify-between gap-3 rounded-md border border-primary/20 px-3 py-2 mb-2">
                  <span className="text-sm">{f.friendly_name || "Autenticador"}</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => disableFactor(f.id)} disabled={twoFaBusy}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    Desativar
                  </Button>
                </div>
              ))}

              {!factors.some(f => f.status === "verified") && !enroll && (
                <Button type="button" onClick={startEnroll} disabled={twoFaBusy}
                  className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest">
                  <Shield className="h-4 w-4 mr-2" /> Ativar 2FA
                </Button>
              )}

              {enroll && (
                <div className="space-y-3">
                  <p className="text-sm">Escaneie o QR no seu app (Google Authenticator, Authy):</p>
                  <img alt="QR 2FA" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(enroll.uri)}`} className="rounded-md border border-primary/30 p-2 bg-background" />
                  <p className="mono text-[10px] text-muted-foreground break-all">Ou digite manualmente: <span className="text-primary">{enroll.secret}</span></p>
                  <div className="flex gap-2">
                    <Input value={enrollCode} onChange={e => setEnrollCode(e.target.value)} placeholder="Código de 6 dígitos" maxLength={6}
                      className="bg-input/60 border-primary/30 focus-visible:ring-primary mono w-40" />
                    <Button type="button" onClick={verifyEnroll} disabled={twoFaBusy || enrollCode.length !== 6}
                      className="bg-primary text-primary-foreground font-display uppercase">Confirmar</Button>
                    <Button type="button" variant="ghost" onClick={() => { setEnroll(null); setEnrollCode(""); }}>Cancelar</Button>
                  </div>
                </div>
              )}
            </section>

            <div className="flex flex-wrap gap-3 items-center">
              <Button type="submit" disabled={saving || !dirty || Object.keys(errors).length > 0}
                className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest hover:shadow-[var(--glow-strong)]">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
              {dirty && <span className="mono text-[10px] uppercase tracking-widest text-gold">// alterações não salvas</span>}
            </div>
          </div>
        </form>
      </div>

  );
};

const Field = ({
  label, icon: Icon, type = "text", value, onChange, placeholder, required, error, hint,
}: {
  label: string; icon?: any; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean; error?: string; hint?: string;
}) => (
  <div>
    <Label className="mono text-[10px] uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </Label>
    <Input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      className={`bg-input/60 focus-visible:ring-primary ${error ? "border-destructive" : "border-primary/30"}`}
    />
    {error
      ? <p className="mono text-[10px] text-destructive mt-1">{error}</p>
      : hint ? <p className="mono text-[10px] text-muted-foreground mt-1 truncate">→ {hint}</p> : null}
  </div>
);

export default Perfil;
