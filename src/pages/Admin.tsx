import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useIsAdmin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Pencil, Trash2, Plus, ShieldAlert, Loader2, Inbox,
  FileText, CalendarDays, Megaphone, Users, FileEdit, Image as ImageIcon,
  CalendarRange, FolderOpen, GraduationCap, Camera, BookOpen, LayoutDashboard, ExternalLink,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader as SbHeader,
} from "@/components/ui/sidebar";

type AnyRow = Record<string, any>;
type TableName = "editais" | "eventos" | "ouvidorias";

const fieldDefs: Record<Exclude<TableName, "ouvidorias">, { key: string; label: string; type: "text" | "textarea" | "date" | "datetime" | "url" | "switch" }[]> = {
  editais: [
    { key: "titulo", label: "Título", type: "text" },
    { key: "descricao", label: "Descrição", type: "textarea" },
    { key: "categoria", label: "Categoria", type: "text" },
    { key: "pdf_url", label: "URL do PDF", type: "url" },
    { key: "data_publicacao", label: "Data publicação", type: "date" },
  ],
  eventos: [
    { key: "titulo", label: "Título", type: "text" },
    { key: "descricao", label: "Descrição", type: "textarea" },
    { key: "data_evento", label: "Data do evento", type: "datetime" },
    { key: "local", label: "Local", type: "text" },
    { key: "imagem_url", label: "URL imagem", type: "url" },
    { key: "inscricao_url", label: "URL inscrição", type: "url" },
    { key: "resumo_url", label: "URL resumo", type: "url" },
    { key: "is_novo", label: "Marcar como NOVO", type: "switch" },
  ],
};

const Admin = () => {
  const { isAdmin, user, loading } = useIsAdmin();
  const navigate = useNavigate();

  // Redireciona para /auth assim que o carregamento termina e não há usuário
  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </Layout>
    );
  }
  if (!user) {
    // Em transição de redirecionamento
    return (
      <Layout>
        <div className="container py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </Layout>
    );
  }
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-16 max-w-md text-center">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h1 className="font-display text-xl text-silver mb-2">ACESSO NEGADO</h1>
          <p className="text-muted-foreground mono text-sm">// permissão 'admin' necessária</p>
          <Button onClick={() => navigate("/")} variant="outline" className="mt-4 border-primary/50 text-primary">Voltar ao início</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <BackButton to="/" label="Início" />
        <header className="mb-6">
          <p className="mono text-[10px] sm:text-xs text-primary mb-1">// /admin :: diretoria</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">PAINEL ADMINISTRATIVO</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de conteúdo e ouvidorias do CASI.</p>
        </header>

        <Tabs defaultValue="editais" className="w-full">
          <TabsList className="bg-card/60 border border-primary/30 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-1 h-auto p-1 mb-4">
            <TabsTrigger value="editais" className="font-display text-xs uppercase tracking-widest">Editais</TabsTrigger>
            <TabsTrigger value="eventos" className="font-display text-xs uppercase tracking-widest">Eventos</TabsTrigger>
            <TabsTrigger value="avisos" className="font-display text-xs uppercase tracking-widest">Avisos</TabsTrigger>
            <TabsTrigger value="ouvidorias" className="font-display text-xs uppercase tracking-widest">Ouvidorias</TabsTrigger>
            <TabsTrigger value="diretoria" className="font-display text-xs uppercase tracking-widest">Diretoria</TabsTrigger>
            <TabsTrigger value="conteudo" className="font-display text-xs uppercase tracking-widest">Conteúdo</TabsTrigger>
            <TabsTrigger value="midia" className="font-display text-xs uppercase tracking-widest">Vitrine</TabsTrigger>
            <TabsTrigger value="calendario" className="font-display text-xs uppercase tracking-widest">Calendário</TabsTrigger>
            <TabsTrigger value="documentos" className="font-display text-xs uppercase tracking-widest">Documentos</TabsTrigger>
            <TabsTrigger value="acervo_tccs" className="font-display text-xs uppercase tracking-widest">TCCs</TabsTrigger>
            <TabsTrigger value="acervo_fotos" className="font-display text-xs uppercase tracking-widest">Fotos</TabsTrigger>
            <TabsTrigger value="literaturas" className="font-display text-xs uppercase tracking-widest">Literaturas</TabsTrigger>
          </TabsList>

          <TabsContent value="editais"><CrudPanel table="editais" categoria="Edital" /></TabsContent>
          <TabsContent value="eventos"><CrudPanel table="eventos" /></TabsContent>
          <TabsContent value="avisos"><CrudPanel table="editais" categoria="Aviso" labelOverride="Avisos" /></TabsContent>
          <TabsContent value="ouvidorias"><OuvidoriasPanel /></TabsContent>
          <TabsContent value="diretoria"><DiretoriaPanel /></TabsContent>
          <TabsContent value="conteudo"><ConteudoPanel /></TabsContent>
          <TabsContent value="midia"><MidiaPanel /></TabsContent>
          <TabsContent value="calendario"><CalendarioPanel /></TabsContent>
          <TabsContent value="documentos"><DocumentosPanel /></TabsContent>
          <TabsContent value="acervo_tccs"><AcervoTccsPanel /></TabsContent>
          <TabsContent value="acervo_fotos"><AcervoFotosPanel /></TabsContent>
          <TabsContent value="literaturas"><LiteraturasPanel /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

/* ---------- CRUD genérico para editais/eventos ---------- */
const CrudPanel = ({ table, categoria, labelOverride }: { table: "editais" | "eventos"; categoria?: string; labelOverride?: string }) => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const fields = fieldDefs[table];

  const load = async () => {
    setLoading(true);
    const base: any = supabase.from(table).select("*");
    const q = (table === "editais" && categoria) ? base.eq("categoria", categoria) : base;
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar"); else setRows((data as AnyRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [table, categoria]);

  const openNew = () => {
    const blank: AnyRow = {};
    fields.forEach(f => { blank[f.key] = f.type === "switch" ? false : ""; });
    if (table === "editais" && categoria) blank.categoria = categoria;
    setEditing(blank);
    setOpen(true);
  };
  const openEdit = (row: AnyRow) => {
    const r: AnyRow = { ...row };
    if (r.data_evento) r.data_evento = new Date(r.data_evento).toISOString().slice(0, 16);
    setEditing(r);
    setOpen(true);
  };
  const save = async () => {
    if (!editing) return;
    const payload: AnyRow = { ...editing };
    fields.forEach(f => { if (payload[f.key] === "") payload[f.key] = null; });
    if (!payload.titulo) { toast.error("Título obrigatório"); return; }
    let res;
    const tbl: any = supabase.from(table);
    if (payload.id) {
      const { id, created_at, updated_at, ...rest } = payload;
      res = await tbl.update(rest).eq("id", id);
    } else {
      const { id, created_at, updated_at, ...rest } = payload;
      res = await tbl.insert(rest);
    }
    if (res.error) toast.error("Erro ao salvar: " + res.error.message);
    else { toast.success("Salvo"); setOpen(false); load(); }
  };
  const del = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error("Erro ao excluir"); else { toast.success("Excluído"); load(); }
  };

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">
          {labelOverride ?? (table === "editais" ? "EDITAIS" : "EVENTOS")}
        </h2>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Novo</Button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : rows.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// nenhum registro</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-left text-xs uppercase font-display text-muted-foreground tracking-wider border-b border-primary/20">
                <th className="px-3 py-2">Título</th>
                <th className="px-3 py-2 hidden sm:table-cell">Data</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-primary/5">
                  <td className="px-3 py-2 text-foreground">{r.titulo}</td>
                  <td className="px-3 py-2 mono text-xs text-muted-foreground hidden sm:table-cell">
                    {table === "eventos" ? new Date(r.data_evento).toLocaleDateString("pt-BR") : new Date(r.data_publicacao || r.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)} className="h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(r.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-primary/40 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display tracking-widest">{editing?.id ? "EDITAR" : "NOVO"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              {fields.map(f => (
                <div key={f.key}>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea value={editing[f.key] ?? ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} rows={3} className="bg-input/60 border-primary/30 mt-1" />
                  ) : f.type === "switch" ? (
                    <div className="mt-2"><Switch checked={!!editing[f.key]} onCheckedChange={v => setEditing({ ...editing, [f.key]: v })} /></div>
                  ) : (
                    <Input type={f.type === "datetime" ? "datetime-local" : f.type === "date" ? "date" : "text"} value={editing[f.key] ?? ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Painel de Ouvidorias ---------- */
const OuvidoriasPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todas" | "pendente" | "resolvida">("todas");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("ouvidorias").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: AnyRow) => {
    const { error } = await (supabase.from("ouvidorias") as any).update(patch).eq("id", id);
    if (error) toast.error("Erro: " + error.message); else { toast.success("Atualizado"); load(); }
  };
  const del = async (id: string) => {
    if (!confirm("Excluir esta ouvidoria?")) return;
    const { error } = await supabase.from("ouvidorias").delete().eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Excluída"); load(); }
  };

  const filtered = useMemo(() => filter === "todas" ? rows : rows.filter(r => r.status === filter), [rows, filter]);

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest flex items-center gap-2"><Inbox className="h-4 w-4 text-primary" /> OUVIDORIAS RECEBIDAS</h2>
        <div className="flex gap-1">
          {(["todas", "pendente", "resolvida"] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className={filter === f ? "bg-primary text-primary-foreground" : "border-primary/40 text-primary"}>{f}</Button>
          ))}
        </div>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// sem mensagens</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map(o => (
            <li key={o.id} className="rounded-lg border border-primary/20 bg-background/40 p-4 hover:border-primary/50 transition-colors">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-display uppercase tracking-widest px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">{o.categoria}</span>
                <span className={`text-xs mono px-2 py-0.5 rounded border ${o.status === "resolvida" ? "border-primary/40 text-primary" : "border-amber-500/40 text-amber-400"}`}>{o.status}</span>
                {o.is_public && <span className="text-[10px] mono text-muted-foreground">público</span>}
                <span className="ml-auto text-xs mono text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</span>
              </div>
              <p className="text-xs mono text-muted-foreground mb-2">
                {o.nome || o.matricula ? <>De: <span className="text-foreground">{o.nome ?? "—"}</span> {o.matricula && <>· mat. {o.matricula}</>}</> : <span className="italic">// envio anônimo</span>}
              </p>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">{o.mensagem}</p>
              <Textarea
                placeholder="Resposta pública (opcional)"
                defaultValue={o.resposta_publica ?? ""}
                onBlur={e => e.target.value !== (o.resposta_publica ?? "") && update(o.id, { resposta_publica: e.target.value || null })}
                rows={2}
                className="bg-input/60 border-primary/30 text-sm"
              />
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={o.status === "resolvida"} onCheckedChange={v => update(o.id, { status: v ? "resolvida" : "pendente" })} />
                  Resolvida
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={!!o.is_public} onCheckedChange={v => update(o.id, { is_public: v })} />
                  Pública
                </label>
                <Button size="sm" variant="ghost" onClick={() => del(o.id)} className="ml-auto text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-1" /> Excluir</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ---------- Painel da Diretoria ---------- */
const DiretoriaPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("diretoria" as any).select("*") as any).order("ordem", { ascending: true });
    if (error) toast.error("Erro ao carregar diretoria"); else setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ nome: "", cargo: "", bio: "", foto_url: "", email: "", instagram: "", github: "", linkedin: "", whatsapp: "", ordem: rows.length, ativo: true });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("diretoria").upload(path, file, { upsert: false });
    if (upErr) { toast.error("Falha no upload: " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("diretoria").getPublicUrl(path);
    setEditing({ ...editing, foto_url: data.publicUrl });
    setUploading(false);
    toast.success("Foto enviada");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.nome || !editing.cargo) { toast.error("Nome e cargo são obrigatórios"); return; }
    const payload: AnyRow = { ...editing };
    Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });
    const { id, created_at, updated_at, ...rest } = payload;
    const tbl: any = supabase.from("diretoria" as any);
    const res = id ? await tbl.update(rest).eq("id", id) : await tbl.insert(rest);
    if (res.error) toast.error("Erro: " + res.error.message);
    else { toast.success("Salvo"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Remover este membro?")) return;
    const { error } = await (supabase.from("diretoria" as any) as any).delete().eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Removido"); load(); }
  };

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">DIRETORIA</h2>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Novo membro</Button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : rows.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// nenhum membro cadastrado</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {rows.map(m => (
            <li key={m.id} className="rounded-lg border border-primary/20 bg-background/40 p-3 flex gap-3 items-center">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
                {m.foto_url ? <img src={m.foto_url} alt="" className="h-full w-full object-cover" /> : <span>👤</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{m.nome}</div>
                <div className="text-[10px] mono text-primary uppercase truncate">{m.cargo}</div>
                <div className="text-[10px] text-muted-foreground">Ordem: {m.ordem} · {m.ativo ? "ativo" : "inativo"}</div>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }} className="h-7 w-7 text-primary"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(m.id)} className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-primary/40 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display tracking-widest">{editing?.id ? "EDITAR MEMBRO" : "NOVO MEMBRO"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/30">
                  {editing.foto_url ? <img src={editing.foto_url} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl">👤</span>}
                </div>
                <div className="flex-1 space-y-2">
                  <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} className="bg-input/60 border-primary/30 text-xs" />
                  {editing.foto_url && <Button size="sm" variant="outline" onClick={() => setEditing({ ...editing, foto_url: "" })}>Remover foto</Button>}
                </div>
              </div>
              {[
                { k: "nome", l: "Nome*" }, { k: "cargo", l: "Cargo*" },
                { k: "email", l: "E-mail" }, { k: "instagram", l: "Instagram (@)" },
                { k: "github", l: "GitHub (@)" }, { k: "linkedin", l: "LinkedIn" },
                { k: "whatsapp", l: "WhatsApp (telefone)" },
              ].map(f => (
                <div key={f.k}>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">{f.l}</Label>
                  <Input value={editing[f.k] ?? ""} onChange={e => setEditing({ ...editing, [f.k]: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
                </div>
              ))}
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Bio</Label>
                <Textarea value={editing.bio ?? ""} onChange={e => setEditing({ ...editing, bio: e.target.value })} rows={3} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ordem</Label>
                  <Input type="number" value={editing.ordem ?? 0} onChange={e => setEditing({ ...editing, ordem: parseInt(e.target.value) || 0 })} className="bg-input/60 border-primary/30 mt-1" />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ativo</Label>
                  <Switch checked={!!editing.ativo} onCheckedChange={v => setEditing({ ...editing, ativo: v })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Painel de Conteúdo do site ---------- */
const ConteudoPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, AnyRow>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("site_content" as any).select("*") as any).order("chave");
    if (error) toast.error("Erro ao carregar"); else setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (row: AnyRow) => {
    const patch = edits[row.id];
    if (!patch) return;
    const { error } = await (supabase.from("site_content" as any) as any).update({ titulo: patch.titulo, conteudo: patch.conteudo }).eq("id", row.id);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Salvo"); setEdits(s => { const n = { ...s }; delete n[row.id]; return n; }); load(); }
  };

  return (
    <div className="panel-base p-4 sm:p-6">
      <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest mb-4">CONTEÚDO DO SITE</h2>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : (
        <ul className="space-y-4">
          {rows.map(r => {
            const cur = edits[r.id] ?? r;
            const dirty = !!edits[r.id];
            return (
              <li key={r.id} className="rounded-lg border border-primary/20 bg-background/40 p-4">
                <div className="text-[10px] mono text-primary uppercase tracking-widest mb-2">// {r.chave}</div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Título</Label>
                <Input value={cur.titulo ?? ""} onChange={e => setEdits(s => ({ ...s, [r.id]: { ...cur, titulo: e.target.value } }))} className="bg-input/60 border-primary/30 mt-1 mb-3" />
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Conteúdo</Label>
                <Textarea value={cur.conteudo ?? ""} onChange={e => setEdits(s => ({ ...s, [r.id]: { ...cur, conteudo: e.target.value } }))} rows={4} className="bg-input/60 border-primary/30 mt-1" />
                <div className="flex justify-end mt-2">
                  <Button size="sm" disabled={!dirty} onClick={() => save(r)} className="bg-primary text-primary-foreground">Salvar</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/* ---------- Painel de Calendário Acadêmico ---------- */
const CalendarioPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("calendario_academico" as any).select("*") as any).order("ano", { ascending: false });
    if (error) toast.error("Erro ao carregar"); else setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ ano: new Date().getFullYear(), titulo: "", pdf_url: "", ativo: true });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!editing) return;
    if (file.type !== "application/pdf") { toast.error("Envie um arquivo PDF"); return; }
    setUploading(true);
    const path = `calendario/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("documentos").upload(path, file, { upsert: false, contentType: "application/pdf" });
    if (upErr) { toast.error("Falha no upload: " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    setEditing({ ...editing, pdf_url: data.publicUrl });
    setUploading(false);
    toast.success("PDF enviado");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titulo || !editing.pdf_url || !editing.ano) { toast.error("Preencha ano, título e PDF"); return; }
    const { id, created_at, updated_at, ...rest } = editing;
    rest.ano = Number(rest.ano);
    const tbl: any = supabase.from("calendario_academico" as any);
    const res = id ? await tbl.update(rest).eq("id", id) : await tbl.insert(rest);
    if (res.error) toast.error("Erro: " + res.error.message);
    else { toast.success("Salvo"); setOpen(false); load(); }
  };

  const setAtivo = async (id: string, ativo: boolean) => {
    const { error } = await (supabase.from("calendario_academico" as any) as any).update({ ativo }).eq("id", id);
    if (error) toast.error("Erro: " + error.message); else { toast.success(ativo ? "Calendário definido como ativo" : "Calendário desativado"); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir este calendário?")) return;
    const { error } = await (supabase.from("calendario_academico" as any) as any).delete().eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Excluído"); load(); }
  };

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">CALENDÁRIO ACADÊMICO</h2>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Novo</Button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : rows.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// nenhum calendário cadastrado</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(c => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-background/40 p-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-silver">{c.titulo}</span>
                  <span className="mono text-xs text-primary">// ano {c.ano}</span>
                  {c.ativo && <span className="text-[10px] mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/40">ativo</span>}
                </div>
                <a href={c.pdf_url} target="_blank" rel="noopener" className="text-xs text-muted-foreground hover:text-primary truncate block max-w-[60vw]">{c.pdf_url}</a>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={!!c.ativo} onCheckedChange={(v) => setAtivo(c.id, v)} />
                  Ativo
                </label>
                <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }} className="h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(c.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-primary/40 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display tracking-widest">{editing?.id ? "EDITAR CALENDÁRIO" : "NOVO CALENDÁRIO"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ano</Label>
                <Input type="number" value={editing.ano ?? ""} onChange={e => setEditing({ ...editing, ano: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Título</Label>
                <Input value={editing.titulo ?? ""} onChange={e => setEditing({ ...editing, titulo: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">PDF do calendário</Label>
                <Input type="file" accept="application/pdf" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} className="bg-input/60 border-primary/30 mt-1 text-xs" />
                {editing.pdf_url && <a href={editing.pdf_url} target="_blank" rel="noopener" className="text-xs text-primary mono mt-1 inline-block truncate max-w-full">{editing.pdf_url}</a>}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ou cole a URL do PDF</Label>
                <Input value={editing.pdf_url ?? ""} onChange={e => setEditing({ ...editing, pdf_url: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={!!editing.ativo} onCheckedChange={v => setEditing({ ...editing, ativo: v })} />
                Definir como calendário vigente (ativo)
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={uploading} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Painel de Documentos & Modelos ---------- */
const CATEGORIAS_DOC = [
  { value: "requerimentos", label: "Requerimentos" },
  { value: "modelos_tcc", label: "Modelos de TCC" },
  { value: "horas_complementares", label: "Horas Complementares" },
  { value: "estagio", label: "Estágio" },
];

const DocumentosPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("documentos_academicos" as any).select("*") as any)
      .order("categoria", { ascending: true })
      .order("ordem", { ascending: true });
    if (error) toast.error("Erro ao carregar"); else setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ titulo: "", descricao: "", categoria: "requerimentos", pdf_url: "", ordem: 0, ativo: true });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!editing) return;
    if (file.type !== "application/pdf") { toast.error("Envie um arquivo PDF"); return; }
    setUploading(true);
    const path = `documentos/${editing.categoria || "outros"}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("documentos").upload(path, file, { upsert: false, contentType: "application/pdf" });
    if (upErr) { toast.error("Falha no upload: " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    setEditing({ ...editing, pdf_url: data.publicUrl });
    setUploading(false);
    toast.success("PDF enviado");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titulo || !editing.pdf_url || !editing.categoria) {
      toast.error("Preencha título, categoria e PDF"); return;
    }
    const { id, created_at, updated_at, ...rest } = editing;
    rest.ordem = Number(rest.ordem) || 0;
    const tbl: any = supabase.from("documentos_academicos" as any);
    const res = id ? await tbl.update(rest).eq("id", id) : await tbl.insert(rest);
    if (res.error) toast.error("Erro: " + res.error.message);
    else { toast.success("Salvo"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir este documento?")) return;
    const { error } = await (supabase.from("documentos_academicos" as any) as any).delete().eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Excluído"); load(); }
  };

  const labelCat = (k: string) => CATEGORIAS_DOC.find(c => c.value === k)?.label ?? k;

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">DOCUMENTOS &amp; MODELOS</h2>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Novo</Button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : rows.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// nenhum documento cadastrado</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(d => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-background/40 p-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-silver truncate">{d.titulo}</span>
                  <span className="text-[10px] mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">{labelCat(d.categoria)}</span>
                  {!d.ativo && <span className="text-[10px] mono text-amber-400">inativo</span>}
                </div>
                <a href={d.pdf_url} target="_blank" rel="noopener" className="text-xs text-muted-foreground hover:text-primary truncate block max-w-[60vw]">{d.pdf_url}</a>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { setEditing(d); setOpen(true); }} className="h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(d.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-primary/40 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display tracking-widest">{editing?.id ? "EDITAR DOCUMENTO" : "NOVO DOCUMENTO"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Título</Label>
                <Input value={editing.titulo ?? ""} onChange={e => setEditing({ ...editing, titulo: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição</Label>
                <Textarea value={editing.descricao ?? ""} onChange={e => setEditing({ ...editing, descricao: e.target.value })} rows={3} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Categoria</Label>
                <select
                  value={editing.categoria ?? "requerimentos"}
                  onChange={e => setEditing({ ...editing, categoria: e.target.value })}
                  className="w-full mt-1 rounded-md border border-primary/30 bg-input/60 px-3 py-2 text-sm text-foreground"
                >
                  {CATEGORIAS_DOC.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">PDF</Label>
                <Input type="file" accept="application/pdf" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} className="bg-input/60 border-primary/30 mt-1 text-xs" />
                {editing.pdf_url && <a href={editing.pdf_url} target="_blank" rel="noopener" className="text-xs text-primary mono mt-1 inline-block truncate max-w-full">{editing.pdf_url}</a>}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ou cole a URL do PDF</Label>
                <Input value={editing.pdf_url ?? ""} onChange={e => setEditing({ ...editing, pdf_url: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ordem</Label>
                  <Input type="number" value={editing.ordem ?? 0} onChange={e => setEditing({ ...editing, ordem: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ativo</Label>
                  <Switch checked={!!editing.ativo} onCheckedChange={v => setEditing({ ...editing, ativo: v })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={uploading} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Painel de Vitrine de Mídia ---------- */
const MidiaPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("midia_showcase" as any).select("*") as any)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar"); else setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ titulo: "", subtitulo: "", imagem_url: "", link_url: "", ordem: rows.length, ativo: true });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!editing) return;
    if (!file.type.startsWith("image/")) { toast.error("Envie uma imagem"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("midia").upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) { toast.error("Falha no upload: " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("midia").getPublicUrl(path);
    setEditing({ ...editing, imagem_url: data.publicUrl });
    setUploading(false);
    toast.success("Imagem enviada");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titulo || !editing.imagem_url) { toast.error("Preencha título e imagem"); return; }
    const { id, created_at, updated_at, ...rest } = editing;
    rest.ordem = Number(rest.ordem) || 0;
    Object.keys(rest).forEach(k => { if (rest[k] === "") rest[k] = null; });
    rest.titulo = editing.titulo;
    rest.imagem_url = editing.imagem_url;
    const tbl: any = supabase.from("midia_showcase" as any);
    const res = id ? await tbl.update(rest).eq("id", id) : await tbl.insert(rest);
    if (res.error) toast.error("Erro: " + res.error.message);
    else { toast.success("Salvo"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir este slide?")) return;
    const { error } = await (supabase.from("midia_showcase" as any) as any).delete().eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Excluído"); load(); }
  };

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">VITRINE DE MÍDIA</h2>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Novo slide</Button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : rows.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// nenhum slide cadastrado</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(s => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-background/40 p-3">
              <img src={s.imagem_url} alt={s.titulo} className="h-14 w-24 object-cover rounded border border-primary/30 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-silver truncate">{s.titulo}</span>
                  <span className="mono text-[10px] text-primary">// ordem {s.ordem}</span>
                  {!s.ativo && <span className="text-[10px] mono text-amber-400">inativo</span>}
                </div>
                {s.subtitulo && <p className="text-xs text-muted-foreground truncate">{s.subtitulo}</p>}
                {s.link_url && <a href={s.link_url} target="_blank" rel="noopener" className="text-[10px] text-primary truncate block max-w-[60vw]">{s.link_url}</a>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }} className="h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(s.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-primary/40 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display tracking-widest">{editing?.id ? "EDITAR SLIDE" : "NOVO SLIDE"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Título</Label>
                <Input value={editing.titulo ?? ""} onChange={e => setEditing({ ...editing, titulo: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Subtítulo</Label>
                <Input value={editing.subtitulo ?? ""} onChange={e => setEditing({ ...editing, subtitulo: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Imagem</Label>
                <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} className="bg-input/60 border-primary/30 mt-1 text-xs" />
                {editing.imagem_url && <img src={editing.imagem_url} alt="preview" className="mt-2 h-32 w-full object-cover rounded border border-primary/30" />}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ou cole a URL da imagem</Label>
                <Input value={editing.imagem_url ?? ""} onChange={e => setEditing({ ...editing, imagem_url: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Link de redirecionamento (opcional)</Label>
                <Input placeholder="https://..." value={editing.link_url ?? ""} onChange={e => setEditing({ ...editing, link_url: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ordem</Label>
                  <Input type="number" value={editing.ordem ?? 0} onChange={e => setEditing({ ...editing, ordem: e.target.value })} className="bg-input/60 border-primary/30 mt-1" />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ativo</Label>
                  <Switch checked={!!editing.ativo} onCheckedChange={v => setEditing({ ...editing, ativo: v })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={uploading} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Painel: Acervo TCCs ---------- */
const AcervoTccsPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("acervo_tccs" as any).select("*") as any).order("ano", { ascending: false }).order("ordem");
    if (error) toast.error("Erro ao carregar"); else setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ titulo: "", autor: "", ano: new Date().getFullYear(), descricao: "", pdf_url: "", capa_url: "", ordem: 0, ativo: true }); setOpen(true); };

  const uploadFile = async (file: File, kind: "pdf" | "img") => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `tccs/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("acervo").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error("Falha no upload: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("acervo").getPublicUrl(path);
    setEditing(prev => prev ? { ...prev, [kind === "pdf" ? "pdf_url" : "capa_url"]: data.publicUrl } : prev);
    setUploading(false);
    toast.success("Arquivo enviado");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titulo || !editing.autor || !editing.pdf_url || !editing.ano) { toast.error("Título, autor, ano e PDF obrigatórios"); return; }
    const { id, created_at, updated_at, ...rest } = editing;
    rest.ano = Number(rest.ano);
    rest.ordem = Number(rest.ordem) || 0;
    Object.keys(rest).forEach(k => { if (rest[k] === "") rest[k] = null; });
    const tbl: any = supabase.from("acervo_tccs" as any);
    const res = id ? await tbl.update(rest).eq("id", id) : await tbl.insert(rest);
    if (res.error) toast.error("Erro: " + res.error.message); else { toast.success("Salvo"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir este TCC?")) return;
    const { error } = await (supabase.from("acervo_tccs" as any) as any).delete().eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Excluído"); load(); }
  };

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">ACERVO :: TCCs</h2>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Novo TCC</Button>
      </div>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : rows.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// nenhum TCC cadastrado</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(t => (
            <li key={t.id} className="flex items-center gap-3 rounded-lg border border-primary/20 bg-background/40 p-3">
              <div className="h-12 w-12 rounded bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                {t.capa_url ? <img src={t.capa_url} className="h-full w-full object-cover" alt="" /> : "🎓"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-silver truncate">{t.titulo}</div>
                <div className="text-xs text-muted-foreground truncate">{t.autor} · {t.ano}{!t.ativo && " · inativo"}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }} className="h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(t.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-primary/40 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display tracking-widest">{editing?.id ? "EDITAR TCC" : "NOVO TCC"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Título</Label><Input value={editing.titulo ?? ""} onChange={e => setEditing({ ...editing, titulo: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Autor</Label><Input value={editing.autor ?? ""} onChange={e => setEditing({ ...editing, autor: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Ano</Label><Input type="number" value={editing.ano ?? ""} onChange={e => setEditing({ ...editing, ano: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição / resumo</Label><Textarea value={editing.descricao ?? ""} onChange={e => setEditing({ ...editing, descricao: e.target.value })} rows={3} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">PDF do TCC</Label>
                <Input type="file" accept="application/pdf" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], "pdf")} disabled={uploading} className="bg-input/60 border-primary/30 mt-1 text-xs" />
                {editing.pdf_url && <a href={editing.pdf_url} target="_blank" rel="noopener" className="text-xs text-primary mono mt-1 inline-block truncate max-w-full">{editing.pdf_url}</a>}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Capa (opcional)</Label>
                <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], "img")} disabled={uploading} className="bg-input/60 border-primary/30 mt-1 text-xs" />
                {editing.capa_url && <img src={editing.capa_url} alt="capa" className="mt-2 h-24 rounded border border-primary/30" />}
              </div>
              <div className="flex gap-3">
                <div className="flex-1"><Label className="text-xs uppercase tracking-widest text-muted-foreground">Ordem</Label><Input type="number" value={editing.ordem ?? 0} onChange={e => setEditing({ ...editing, ordem: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
                <div className="flex flex-col justify-end pb-1"><Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ativo</Label><Switch checked={!!editing.ativo} onCheckedChange={v => setEditing({ ...editing, ativo: v })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={uploading} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Painel: Acervo Fotos ---------- */
const AcervoFotosPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("acervo_fotos" as any).select("*") as any).order("ano", { ascending: false }).order("ordem");
    if (error) toast.error("Erro ao carregar"); else setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ titulo: "", descricao: "", imagem_url: "", evento: "", ano: new Date().getFullYear(), ordem: 0, ativo: true }); setOpen(true); };

  const uploadImg = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Envie uma imagem"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `fotos/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("acervo").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error("Erro: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("acervo").getPublicUrl(path);
    setEditing(prev => prev ? { ...prev, imagem_url: data.publicUrl } : prev);
    setUploading(false);
    toast.success("Imagem enviada");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titulo || !editing.imagem_url) { toast.error("Título e imagem obrigatórios"); return; }
    const { id, created_at, updated_at, ...rest } = editing;
    rest.ano = rest.ano ? Number(rest.ano) : null;
    rest.ordem = Number(rest.ordem) || 0;
    Object.keys(rest).forEach(k => { if (rest[k] === "") rest[k] = null; });
    const tbl: any = supabase.from("acervo_fotos" as any);
    const res = id ? await tbl.update(rest).eq("id", id) : await tbl.insert(rest);
    if (res.error) toast.error("Erro: " + res.error.message); else { toast.success("Salvo"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir esta foto?")) return;
    const { error } = await (supabase.from("acervo_fotos" as any) as any).delete().eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Excluída"); load(); }
  };

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">ACERVO :: FOTOS</h2>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Nova foto</Button>
      </div>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : rows.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// nenhuma foto cadastrada</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map(f => (
            <li key={f.id} className="rounded-lg border border-primary/20 bg-background/40 p-3 flex gap-3">
              <img src={f.imagem_url} alt="" className="h-16 w-16 object-cover rounded border border-primary/30 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-display text-silver text-sm truncate">{f.titulo}</div>
                <div className="text-[10px] text-muted-foreground truncate">{f.evento} {f.ano && `· ${f.ano}`}</div>
                <div className="flex gap-1 mt-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(f); setOpen(true); }} className="h-7 w-7 text-primary"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(f.id)} className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-primary/40 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display tracking-widest">{editing?.id ? "EDITAR FOTO" : "NOVA FOTO"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Título</Label><Input value={editing.titulo ?? ""} onChange={e => setEditing({ ...editing, titulo: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Evento</Label><Input value={editing.evento ?? ""} onChange={e => setEditing({ ...editing, evento: e.target.value })} placeholder="Calourada, Semana Acadêmica..." className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Ano</Label><Input type="number" value={editing.ano ?? ""} onChange={e => setEditing({ ...editing, ano: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição</Label><Textarea value={editing.descricao ?? ""} onChange={e => setEditing({ ...editing, descricao: e.target.value })} rows={2} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Imagem</Label>
                <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadImg(e.target.files[0])} disabled={uploading} className="bg-input/60 border-primary/30 mt-1 text-xs" />
                {editing.imagem_url && <img src={editing.imagem_url} alt="preview" className="mt-2 h-32 w-full object-cover rounded border border-primary/30" />}
              </div>
              <div className="flex gap-3">
                <div className="flex-1"><Label className="text-xs uppercase tracking-widest text-muted-foreground">Ordem</Label><Input type="number" value={editing.ordem ?? 0} onChange={e => setEditing({ ...editing, ordem: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
                <div className="flex flex-col justify-end pb-1"><Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ativo</Label><Switch checked={!!editing.ativo} onCheckedChange={v => setEditing({ ...editing, ativo: v })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={uploading} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Painel: Literaturas ---------- */
const LiteraturasPanel = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("literaturas" as any).select("*") as any).order("ordem");
    if (error) toast.error("Erro ao carregar"); else setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ titulo: "", autores: "", area: "", disciplina: "", descricao: "", capa_url: "", link_url: "", professor: "", ordem: 0, ativo: true }); setOpen(true); };

  const uploadCapa = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `livros/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("acervo").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error("Erro: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("acervo").getPublicUrl(path);
    setEditing(prev => prev ? { ...prev, capa_url: data.publicUrl } : prev);
    setUploading(false);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titulo || !editing.autores) { toast.error("Título e autores obrigatórios"); return; }
    const { id, created_at, updated_at, ...rest } = editing;
    rest.ordem = Number(rest.ordem) || 0;
    Object.keys(rest).forEach(k => { if (rest[k] === "") rest[k] = null; });
    const tbl: any = supabase.from("literaturas" as any);
    const res = id ? await tbl.update(rest).eq("id", id) : await tbl.insert(rest);
    if (res.error) toast.error("Erro: " + res.error.message); else { toast.success("Salvo"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Remover esta literatura?")) return;
    const { error } = await (supabase.from("literaturas" as any) as any).delete().eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Excluída"); load(); }
  };

  return (
    <div className="panel-base p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">ACERVO :: LITERATURAS</h2>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Nova</Button>
      </div>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" /> : rows.length === 0 ? (
        <p className="text-center text-muted-foreground mono text-sm py-8">// nenhuma literatura cadastrada</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(b => (
            <li key={b.id} className="flex items-center gap-3 rounded-lg border border-primary/20 bg-background/40 p-3">
              <div className="h-12 w-12 rounded bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                {b.capa_url ? <img src={b.capa_url} className="h-full w-full object-cover" alt="" /> : "📚"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-silver truncate">{b.titulo}</div>
                <div className="text-xs text-muted-foreground truncate">{b.autores} {b.area && `· ${b.area}`}{!b.ativo && " · inativo"}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { setEditing(b); setOpen(true); }} className="h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(b.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-primary/40 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display tracking-widest">{editing?.id ? "EDITAR LITERATURA" : "NOVA LITERATURA"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Título</Label><Input value={editing.titulo ?? ""} onChange={e => setEditing({ ...editing, titulo: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Autores</Label><Input value={editing.autores ?? ""} onChange={e => setEditing({ ...editing, autores: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div className="flex gap-3">
                <div className="flex-1"><Label className="text-xs uppercase tracking-widest text-muted-foreground">Área</Label><Input value={editing.area ?? ""} onChange={e => setEditing({ ...editing, area: e.target.value })} placeholder="Programação, Banco de Dados..." className="bg-input/60 border-primary/30 mt-1" /></div>
                <div className="flex-1"><Label className="text-xs uppercase tracking-widest text-muted-foreground">Disciplina</Label><Input value={editing.disciplina ?? ""} onChange={e => setEditing({ ...editing, disciplina: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              </div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Professor que recomenda</Label><Input value={editing.professor ?? ""} onChange={e => setEditing({ ...editing, professor: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição</Label><Textarea value={editing.descricao ?? ""} onChange={e => setEditing({ ...editing, descricao: e.target.value })} rows={3} className="bg-input/60 border-primary/30 mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Link externo (opcional)</Label><Input value={editing.link_url ?? ""} onChange={e => setEditing({ ...editing, link_url: e.target.value })} placeholder="https://..." className="bg-input/60 border-primary/30 mt-1" /></div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Capa (opcional)</Label>
                <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadCapa(e.target.files[0])} disabled={uploading} className="bg-input/60 border-primary/30 mt-1 text-xs" />
                {editing.capa_url && <img src={editing.capa_url} alt="capa" className="mt-2 h-24 rounded border border-primary/30" />}
              </div>
              <div className="flex gap-3">
                <div className="flex-1"><Label className="text-xs uppercase tracking-widest text-muted-foreground">Ordem</Label><Input type="number" value={editing.ordem ?? 0} onChange={e => setEditing({ ...editing, ordem: e.target.value })} className="bg-input/60 border-primary/30 mt-1" /></div>
                <div className="flex flex-col justify-end pb-1"><Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ativo</Label><Switch checked={!!editing.ativo} onCheckedChange={v => setEditing({ ...editing, ativo: v })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={uploading} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
