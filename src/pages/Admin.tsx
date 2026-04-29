import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { useIsAdmin } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ShieldAlert, Loader2, Inbox } from "lucide-react";

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

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </Layout>
    );
  }
  if (!user) {
    return (
      <Layout>
        <div className="container py-16 max-w-md text-center">
          <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="font-display text-xl text-silver mb-2">ACESSO RESTRITO</h1>
          <p className="text-muted-foreground mb-4">É necessário entrar na sua conta.</p>
          <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground">Entrar</Button>
        </div>
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
          <TabsList className="bg-card/60 border border-primary/30 grid grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1 mb-4">
            <TabsTrigger value="editais" className="font-display text-xs uppercase tracking-widest">Editais</TabsTrigger>
            <TabsTrigger value="eventos" className="font-display text-xs uppercase tracking-widest">Eventos</TabsTrigger>
            <TabsTrigger value="avisos" className="font-display text-xs uppercase tracking-widest">Avisos</TabsTrigger>
            <TabsTrigger value="ouvidorias" className="font-display text-xs uppercase tracking-widest">Ouvidorias</TabsTrigger>
          </TabsList>

          <TabsContent value="editais"><CrudPanel table="editais" categoria="Edital" /></TabsContent>
          <TabsContent value="eventos"><CrudPanel table="eventos" /></TabsContent>
          <TabsContent value="avisos"><CrudPanel table="editais" categoria="Aviso" labelOverride="Avisos" /></TabsContent>
          <TabsContent value="ouvidorias"><OuvidoriasPanel /></TabsContent>
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

export default Admin;
