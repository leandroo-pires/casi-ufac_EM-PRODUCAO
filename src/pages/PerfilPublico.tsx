import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon, Loader2, Crown, Instagram, Github, Linkedin, Twitter,
  GraduationCap, Shield, MessageSquare,
} from "lucide-react";
import { socialUrl } from "@/lib/socialNormalize";

interface PublicProfile {
  user_id: string;
  display_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  curso: string | null;
  periodo: string | null;
  instagram: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
}

const PerfilPublico = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [{ data: profs }, { data: role }] = await Promise.all([
        (supabase.rpc as any)("get_public_profile", { _user_id: id }),
        supabase.from("user_roles").select("role").eq("user_id", id).eq("role", "admin").maybeSingle(),
      ]);
      setProfile((profs && profs[0]) ?? null);
      setIsAdmin(!!role);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <Layout><div className="container py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container py-16 max-w-md text-center">
          <BackButton />
          <h1 className="font-display text-xl text-silver mt-6 mb-2">PERFIL NÃO ENCONTRADO</h1>
          <p className="text-muted-foreground mono text-sm">// este aluno ainda não criou o perfil dele</p>
        </div>
      </Layout>
    );
  }

  const name = profile.nickname || profile.display_name || "Aluno SI";
  const realName = profile.display_name && profile.nickname && profile.display_name !== profile.nickname ? profile.display_name : null;

  const socials: { key: string; value: string | null; icon: any; type: "instagram" | "twitter" | "github" | "linkedin" }[] = [
    { key: "instagram", value: profile.instagram, icon: Instagram, type: "instagram" },
    { key: "github", value: profile.github, icon: Github, type: "github" },
    { key: "linkedin", value: profile.linkedin, icon: Linkedin, type: "linkedin" },
    { key: "twitter", value: profile.twitter, icon: Twitter, type: "twitter" },
  ].filter(s => !!s.value);

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-3xl">
        <BackButton />
        <p className="mono text-[10px] sm:text-xs text-primary mt-4 mb-2">// /perfil/{profile.user_id.slice(0, 8)}…</p>

        {/* Player Card */}
        <div className="relative panel-base p-0 overflow-hidden animate-fade-up">
          {/* Banner gradient */}
          <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/40 via-primary-glow/20 to-background relative">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <div className="absolute top-3 right-3 mono text-[10px] tracking-widest text-primary/80">CASI :: PLAYER CARD</div>
          </div>

          <div className="px-5 sm:px-8 pb-8 -mt-16 sm:-mt-20 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative shrink-0 self-center sm:self-end">
                {isAdmin && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-gradient-to-br from-gold to-yellow-500 p-1.5 border-2 border-background shadow-[0_0_12px_hsl(45_100%_60%/0.6)]">
                    <Crown className="h-4 w-4 text-background" fill="currentColor" />
                  </div>
                )}
                <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full p-1 bg-gradient-to-br from-primary to-primary-glow shadow-[var(--glow-primary)]">
                  <div className="h-full w-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-14 w-14 text-primary/60" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className={`font-display text-2xl sm:text-3xl tracking-widest text-glow ${isAdmin ? "text-[hsl(var(--gold))]" : "text-silver"}`}>
                    {name}
                  </h1>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] mono text-[10px] uppercase tracking-widest border border-[hsl(var(--gold)/0.4)]">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  )}
                </div>
                {realName && <p className="mono text-xs text-muted-foreground mt-1">// {realName}</p>}
                <div className="flex items-center gap-3 justify-center sm:justify-start mt-2 flex-wrap text-xs text-muted-foreground">
                  {profile.curso && (
                    <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5 text-primary" /> {profile.curso}</span>
                  )}
                  {profile.periodo && (
                    <span className="mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                      {/^\d+$/.test(profile.periodo) ? `${profile.periodo}º período` : profile.periodo}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 rounded-lg border border-primary/20 bg-background/40 p-4">
                <p className="mono text-[10px] text-primary uppercase tracking-widest mb-1">// bio</p>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {socials.length > 0 && (
              <div className="mt-5">
                <p className="mono text-[10px] text-primary uppercase tracking-widest mb-2">// links</p>
                <div className="flex flex-wrap gap-2">
                  {socials.map(s => {
                    const Icon = s.icon;
                    const url = socialUrl[s.type](s.value!);
                    return (
                      <a
                        key={s.key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-card/60 px-3 py-1.5 text-sm hover:border-primary hover:shadow-[var(--glow-primary)] transition-all text-foreground"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        @{s.value}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button asChild variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                <Link to="/comunidade"><MessageSquare className="h-4 w-4 mr-2" /> Voltar ao Lounge</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PerfilPublico;
