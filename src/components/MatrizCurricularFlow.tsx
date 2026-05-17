import { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { disciplinas, atividadesComplementares, type Disciplina } from "@/lib/matrizCurricular";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, X, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

// ============ Layout constants ============
const COL_WIDTH = 260;
const COL_GAP = 60;
const ROW_HEIGHT = 110;
const HEADER_OFFSET = 60;
const PADDING_X = 30;

// ============ Custom Node ============
type DiscData = {
  codigo: string;
  nome: string;
  ch: string;
  isAtividade?: boolean;
  highlight: "none" | "active" | "related" | "dimmed" | "match";
};

const DisciplinaNode = ({ data }: NodeProps) => {
  const d = data as unknown as DiscData;
  const { codigo, nome, ch, isAtividade, highlight } = d;

  return (
    <div
      className={cn(
        "relative w-[230px] rounded-lg border bg-card/80 backdrop-blur-sm px-3 py-2.5 transition-all duration-200",
        "shadow-sm",
        isAtividade ? "border-gold/40 bg-gold/5" : "border-border/70",
        highlight === "active" &&
          "border-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.7),0_0_22px_hsl(var(--primary)/0.55)] scale-[1.03]",
        highlight === "related" &&
          "border-primary/80 shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_0_14px_hsl(var(--primary)/0.35)]",
        highlight === "match" &&
          "border-gold shadow-[0_0_0_1px_hsl(45_100%_60%/0.7),0_0_22px_hsl(45_100%_60%/0.55)] scale-[1.03]",
        highlight === "dimmed" && "opacity-25",
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-primary !border-primary !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-primary !border-primary !w-2 !h-2" />

      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="mono text-[10px] text-primary/80 tracking-wider">{codigo}</span>
        <span className="mono text-[10px] text-muted-foreground">{ch}</span>
      </div>
      <div
        className={cn(
          "font-display text-[13px] leading-snug tracking-wide",
          isAtividade ? "text-gold" : "text-silver",
        )}
      >
        {nome}
      </div>
    </div>
  );
};

const nodeTypes = { disc: DisciplinaNode };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// ============ Component ============
const MatrizFlowInner = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(false);
  const flowWrapperRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const handleDownloadPdf = useCallback(async () => {
    if (!flowWrapperRef.current || downloading) return;
    setDownloading(true);
    // limpa hover/busca para captura limpa
    setHovered(null);
    const prevSearch = search;
    setSearch("");
    try {
      // enquadra o grafo inteiro
      fitView({ padding: 0.08, duration: 0 });
      // aguarda render do fitView + remoção de hover
      await new Promise((r) => setTimeout(r, 350));

      const node = flowWrapperRef.current;
      const bgColor = "hsl(205, 70%, 4%)";

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bgColor,
        filter: (el) => {
          if (!(el instanceof HTMLElement)) return true;
          // remove controles, minimap e qualquer elemento marcado
          if (el.classList?.contains("react-flow__controls")) return false;
          if (el.classList?.contains("react-flow__minimap")) return false;
          if (el.dataset?.pdfHide === "true") return false;
          return true;
        },
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("Falha ao carregar imagem"));
      });

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2 - 14; // espaço para título

      const ratio = img.width / img.height;
      let drawW = availW;
      let drawH = drawW / ratio;
      if (drawH > availH) {
        drawH = availH;
        drawW = drawH * ratio;
      }
      const offsetX = (pageW - drawW) / 2;
      const offsetY = margin + 12 + (availH - drawH) / 2;

      // fundo escuro
      pdf.setFillColor(8, 18, 26);
      pdf.rect(0, 0, pageW, pageH, "F");

      // título
      pdf.setTextColor(40, 230, 240);
      pdf.setFontSize(14);
      pdf.text("MATRIZ CURRICULAR — Sistemas de Informação · UFAC", pageW / 2, margin + 6, {
        align: "center",
      });

      pdf.addImage(dataUrl, "PNG", offsetX, offsetY, drawW, drawH, undefined, "FAST");

      pdf.save("matriz_curricular_casi.pdf");
    } catch (err) {
      console.error("[PDF] erro:", err);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setSearch(prevSearch);
      setDownloading(false);
    }
  }, [downloading, fitView, search]);

  const { prereqMap, successorMap } = useMemo(() => {
    const all = [...disciplinas, ...atividadesComplementares];
    const prereqMap = new Map<string, Set<string>>();
    const successorMap = new Map<string, Set<string>>();
    for (const d of all) {
      prereqMap.set(d.id, new Set(d.prereqs));
      if (!successorMap.has(d.id)) successorMap.set(d.id, new Set());
    }
    for (const d of all) {
      for (const p of d.prereqs) {
        if (!successorMap.has(p)) successorMap.set(p, new Set());
        successorMap.get(p)!.add(d.id);
      }
    }
    return { prereqMap, successorMap };
  }, []);

  const relatedIds = useMemo(() => {
    if (!hovered) return new Set<string>();
    const set = new Set<string>([hovered]);
    prereqMap.get(hovered)?.forEach((p) => set.add(p));
    successorMap.get(hovered)?.forEach((s) => set.add(s));
    return set;
  }, [hovered, prereqMap, successorMap]);

  // Search matches: disciplinas cujos nome/codigo contêm o termo
  const matchIds = useMemo(() => {
    const term = norm(search.trim());
    if (term.length < 2) return new Set<string>();
    const all = [...disciplinas, ...atividadesComplementares];
    return new Set(
      all
        .filter((d) => norm(d.nome).includes(term) || norm(d.codigo).includes(term))
        .map((d) => d.id),
    );
  }, [search]);

  const hasSearch = matchIds.size > 0 || search.trim().length >= 2;

  const { nodes, edges } = useMemo(() => {
    const byPeriodo: Record<number, Disciplina[]> = {};
    for (let p = 1; p <= 8; p++) byPeriodo[p] = [];
    for (const d of disciplinas) byPeriodo[d.periodo].push(d);

    const nodes: Node[] = [];

    for (let p = 1; p <= 8; p++) {
      nodes.push({
        id: `header-${p}`,
        type: "default",
        draggable: false,
        selectable: false,
        position: { x: PADDING_X + (p - 1) * (COL_WIDTH + COL_GAP), y: 0 },
        data: { label: `${p}º PERÍODO` },
        style: {
          width: 230,
          background: "transparent",
          border: "1px solid hsl(var(--primary) / 0.4)",
          borderRadius: 8,
          color: "hsl(var(--primary))",
          fontFamily: "Orbitron, sans-serif",
          fontSize: 12,
          letterSpacing: "0.15em",
          textAlign: "center",
          padding: "8px 0",
        },
      });
    }

    const computeHl = (id: string): DiscData["highlight"] => {
      // Hover tem prioridade quando ativo
      if (hovered) {
        if (id === hovered) return "active";
        if (relatedIds.has(id)) return "related";
        return "dimmed";
      }
      if (hasSearch) {
        if (matchIds.has(id)) return "match";
        return "dimmed";
      }
      return "none";
    };

    for (let p = 1; p <= 8; p++) {
      const list = byPeriodo[p];
      list.forEach((d, idx) => {
        nodes.push({
          id: d.id,
          type: "disc",
          position: {
            x: PADDING_X + (p - 1) * (COL_WIDTH + COL_GAP),
            y: HEADER_OFFSET + idx * ROW_HEIGHT,
          },
          data: { codigo: d.codigo, nome: d.nome, ch: d.ch, highlight: computeHl(d.id) },
        });
      });
    }

    const maxRows = Math.max(...Object.values(byPeriodo).map((l) => l.length));
    for (const ac of atividadesComplementares) {
      nodes.push({
        id: ac.id,
        type: "disc",
        position: {
          x: PADDING_X + (ac.periodo - 1) * (COL_WIDTH + COL_GAP),
          y: HEADER_OFFSET + (maxRows + 0.5) * ROW_HEIGHT,
        },
        data: {
          codigo: ac.codigo,
          nome: ac.nome,
          ch: ac.ch,
          isAtividade: true,
          highlight: computeHl(ac.id),
        },
      });
    }

    const edges: Edge[] = [];
    for (const d of disciplinas) {
      for (const pre of d.prereqs) {
        const isActive = hovered && (d.id === hovered || pre === hovered);
        const isDimmed = (hovered && !isActive) || (hasSearch && !hovered);
        edges.push({
          id: `${pre}->${d.id}`,
          source: pre,
          target: d.id,
          type: "smoothstep",
          animated: !!isActive,
          style: {
            stroke: isActive ? "hsl(var(--primary))" : "hsl(var(--secondary) / 0.35)",
            strokeWidth: isActive ? 2.5 : 1.2,
            opacity: isDimmed ? 0.08 : 1,
            filter: isActive ? "drop-shadow(0 0 6px hsl(var(--primary) / 0.7))" : undefined,
            transition: "all 200ms ease",
          },
        });
      }
    }

    return { nodes, edges };
  }, [hovered, relatedIds, matchIds, hasSearch]);

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "disc") setHovered(node.id);
  }, []);
  const onNodeMouseLeave = useCallback(() => setHovered(null), []);

  return (
    <div className="space-y-3">
      {/* Busca LOCAL da matriz */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar disciplina (ex: Lógica, Banco, CCET...)"
            className="bg-input/60 border-primary/40 pl-9 pr-9 focus-visible:ring-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-primary/10"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        {hasSearch && (
          <p className="mono text-xs text-primary">
            // {matchIds.size} disciplina{matchIds.size === 1 ? "" : "s"} encontrada
            {matchIds.size === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div
        className="w-full rounded-xl border border-primary/20 overflow-hidden"
        style={{
          height: "min(80vh, 820px)",
          background:
            "radial-gradient(ellipse at top, hsl(205 65% 8%) 0%, hsl(205 70% 4%) 70%)",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          fitView
          fitViewOptions={{ padding: 0.15, minZoom: 0.3, maxZoom: 1.2 }}
          minZoom={0.25}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          panOnScroll
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="hsl(var(--primary) / 0.15)"
          />
          <Controls
            showInteractive={false}
            className="!bg-card/80 !border-border [&>button]:!bg-card/80 [&>button]:!border-border [&>button]:!text-foreground hover:[&>button]:!bg-primary/20"
          />
          <MiniMap
            pannable
            zoomable
            className="!bg-card/80 !border !border-border"
            maskColor="hsl(205 60% 6% / 0.7)"
            nodeColor={(n) =>
              (n.data as DiscData)?.isAtividade ? "hsl(45 95% 60%)" : "hsl(186 95% 55%)"
            }
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export const MatrizCurricularFlow = () => (
  <ReactFlowProvider>
    <MatrizFlowInner />
  </ReactFlowProvider>
);
