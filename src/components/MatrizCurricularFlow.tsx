import { useCallback, useMemo, useState } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { disciplinas, atividadesComplementares, type Disciplina } from "@/lib/matrizCurricular";
import { cn } from "@/lib/utils";

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
  highlight: "none" | "active" | "related" | "dimmed";
};

const DisciplinaNode = ({ data }: NodeProps) => {
  const d = data as unknown as DiscData;
  const { codigo, nome, ch, isAtividade, highlight } = d;

  return (
    <div
      className={cn(
        "relative w-[230px] rounded-lg border bg-card/80 backdrop-blur-sm px-3 py-2.5 transition-all duration-200",
        "shadow-sm",
        isAtividade
          ? "border-gold/40 bg-gold/5"
          : "border-border/70",
        highlight === "active" &&
          "border-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.7),0_0_22px_hsl(var(--primary)/0.55)] scale-[1.03]",
        highlight === "related" &&
          "border-primary/80 shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_0_14px_hsl(var(--primary)/0.35)]",
        highlight === "dimmed" && "opacity-30",
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

// ============ Component ============
const MatrizFlowInner = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  // Build relationship maps
  const { prereqMap, successorMap, allItems } = useMemo(() => {
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
    return { prereqMap, successorMap, allItems: all };
  }, []);

  // Compute related ids when hovered
  const relatedIds = useMemo(() => {
    if (!hovered) return new Set<string>();
    const set = new Set<string>([hovered]);
    prereqMap.get(hovered)?.forEach((p) => set.add(p));
    successorMap.get(hovered)?.forEach((s) => set.add(s));
    return set;
  }, [hovered, prereqMap, successorMap]);

  // Build positions per column
  const { nodes, edges } = useMemo(() => {
    // group by periodo
    const byPeriodo: Record<number, Disciplina[]> = {};
    for (let p = 1; p <= 8; p++) byPeriodo[p] = [];
    for (const d of disciplinas) byPeriodo[d.periodo].push(d);

    const nodes: Node[] = [];

    // Header nodes (period titles) — non-interactive labels
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

    // Disciplina nodes
    for (let p = 1; p <= 8; p++) {
      const list = byPeriodo[p];
      list.forEach((d, idx) => {
        const hl: DiscData["highlight"] = !hovered
          ? "none"
          : d.id === hovered
            ? "active"
            : relatedIds.has(d.id)
              ? "related"
              : "dimmed";
        nodes.push({
          id: d.id,
          type: "disc",
          position: {
            x: PADDING_X + (p - 1) * (COL_WIDTH + COL_GAP),
            y: HEADER_OFFSET + idx * ROW_HEIGHT,
          },
          data: { codigo: d.codigo, nome: d.nome, ch: d.ch, highlight: hl },
        });
      });
    }

    // Atividades complementares — at bottom of each column
    const maxRows = Math.max(...Object.values(byPeriodo).map((l) => l.length));
    for (const ac of atividadesComplementares) {
      nodes.push({
        id: ac.id,
        type: "disc",
        position: {
          x: PADDING_X + (ac.periodo - 1) * (COL_WIDTH + COL_GAP),
          y: HEADER_OFFSET + (maxRows + 0.5) * ROW_HEIGHT,
        },
        data: { codigo: ac.codigo, nome: ac.nome, ch: ac.ch, isAtividade: true, highlight: "none" },
      });
    }

    // Edges from prereqs
    const edges: Edge[] = [];
    for (const d of disciplinas) {
      for (const pre of d.prereqs) {
        const isActive =
          hovered && (d.id === hovered || pre === hovered);
        const isDimmed = hovered && !isActive;
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
  }, [hovered, relatedIds]);

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "disc") setHovered(node.id);
  }, []);
  const onNodeMouseLeave = useCallback(() => setHovered(null), []);

  // Compute canvas height to give bottom space
  const totalHeight =
    HEADER_OFFSET +
    (Math.max(...Array.from({ length: 8 }, (_, i) => disciplinas.filter((d) => d.periodo === i + 1).length)) +
      2) *
      ROW_HEIGHT;

  return (
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
  );
};

export const MatrizCurricularFlow = () => (
  <ReactFlowProvider>
    <MatrizFlowInner />
  </ReactFlowProvider>
);
