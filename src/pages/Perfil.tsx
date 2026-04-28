import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import {
  User as UserIcon,
  Camera,
  Save,
  LogOut,
  Instagram,
  Github,
  Linkedin,
  Twitter,
  GraduationCap,
  Calendar,
  AtSign,
  Loader2,
} from "lucide-react";

const profileSchema = z.object({
  display_name: z.string().trim().min(2, "Nome muito curto").max(80),
  nickname: z.string().trim().max(40).optional().or(z.literal("")),
  matricula: z.string().trim().max(40).optional().or(z.literal("")),
  curso: z.string().trim().max(80).optional().or(z.literal("")),
  periodo: z.string().trim().max(20).optional().or(z.literal("")),
  data_nascimento: z.string().optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  instagram: z.string().trim().max(60).optional().or(z.literal("")),
  github: z.string().trim().max(60).optional().or(z.literal("")),
  linkedin: z.string().trim().max(80).optional().or(z.literal("")),
  twitter: z.string().trim().max(60).optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

const empty: ProfileForm = {
  display_name: "", nickname: "", matricula: "", curso: "", periodo: "",
  data_nascimento: "", bio: "", instagram: "", github: "", linkedin: "", twitter: "",
};

const Perfil = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) {
        setForm({
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
        });
        setAvatar(data.avatar_url ?? null);
      }
      setLoading(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) navigate("/auth"); });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const update = (k: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Imagem deve ter no máximo 5MB");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: e2 } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    setUploading(false);
    if (e2) return toast.error(e2.message);
    setAvatar(publicUrl);
    toast.success("Foto atualizada!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setSaving(true);
    const payload: any = { ...parsed.data };
    if (!payload.data_nascimento) payload.data_nascimento = null;
    const { error } = await supabase.from("profiles").update(payload).eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado.");
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10 max-w-4xl">
        <BackButton />
        <header className="mb-6 md:mb-8">
          <p className="mono text-[10px] sm:text-xs text-primary mb-2">// /perfil --user={user?.email}</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">MEU PERFIL</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">Configure suas informações como aluno do CASI UFAC.</p>
        </header>

        <form onSubmit={handleSave} className="grid gap-5 md:grid-cols-[260px_1fr]">
          {/* Avatar */}
          <aside className="panel-glow p-5 flex flex-col items-center gap-4 h-fit">
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
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground p-2 border-2 border-background shadow-[var(--glow-primary)] hover:scale-110 transition-transform disabled:opacity-50"
                aria-label="Trocar foto"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </div>
            <div className="text-center">
              <p className="font-display text-base text-silver tracking-wider">{form.nickname || form.display_name || "Aluno SI"}</p>
              <p className="mono text-[10px] text-muted-foreground break-all">{user?.email}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive font-display uppercase text-xs tracking-widest"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </aside>

          {/* Fields */}
          <div className="space-y-5">
            <section className="panel-base p-5">
              <h2 className="mono text-xs text-primary mb-4">// dados_pessoais</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo" icon={UserIcon} value={form.display_name} onChange={update("display_name")} required />
                <Field label="Nickname" icon={AtSign} value={form.nickname ?? ""} onChange={update("nickname")} placeholder="ex: dev_acre" />
                <Field label="Matrícula" value={form.matricula ?? ""} onChange={update("matricula")} />
                <Field label="Data de nascimento" icon={Calendar} type="date" value={form.data_nascimento ?? ""} onChange={update("data_nascimento")} />
              </div>
            </section>

            <section className="panel-base p-5">
              <h2 className="mono text-xs text-primary mb-4">// academico</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Curso" icon={GraduationCap} value={form.curso ?? ""} onChange={update("curso")} placeholder="Sistemas de Informação" />
                <Field label="Período" value={form.periodo ?? ""} onChange={update("periodo")} placeholder="ex: 5º período" />
              </div>
              <div className="mt-4">
                <Label className="mono text-[10px] uppercase tracking-widest text-primary mb-1 block">Bio</Label>
                <Textarea
                  value={form.bio ?? ""}
                  onChange={update("bio") as any}
                  rows={3}
                  maxLength={500}
                  placeholder="Conte um pouco sobre você..."
                  className="bg-input/60 border-primary/30 focus-visible:ring-primary"
                />
              </div>
            </section>

            <section className="panel-base p-5">
              <h2 className="mono text-xs text-primary mb-4">// redes_sociais</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Instagram" icon={Instagram} value={form.instagram ?? ""} onChange={update("instagram")} placeholder="@usuario" />
                <Field label="GitHub" icon={Github} value={form.github ?? ""} onChange={update("github")} placeholder="usuario" />
                <Field label="LinkedIn" icon={Linkedin} value={form.linkedin ?? ""} onChange={update("linkedin")} placeholder="in/usuario" />
                <Field label="Twitter / X" icon={Twitter} value={form.twitter ?? ""} onChange={update("twitter")} placeholder="@usuario" />
              </div>
            </section>

            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest hover:shadow-[var(--glow-strong)]"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

const Field = ({
  label, icon: Icon, type = "text", value, onChange, placeholder, required,
}: {
  label: string; icon?: any; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean;
}) => (
  <div>
    <Label className="mono text-[10px] uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </Label>
    <Input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="bg-input/60 border-primary/30 focus-visible:ring-primary"
    />
  </div>
);

export default Perfil;
