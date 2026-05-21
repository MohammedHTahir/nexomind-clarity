import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ForceGraph2D from "react-force-graph-2d";


type NodeType = "theme" | "emotion" | "person" | "distortion" | "trigger";

type RawNode = {
  id: string;
  type: NodeType;
  label: string;
  frequency: number;
  first_seen_at: string;
  last_seen_at: string;
};

type RawEdge = { source: string; target: string; weight: number };

type DetailResp = {
  node: RawNode;
  entries: { id: string; content: string; created_at: string }[];
  trend: Record<string, number>;
  reframe: string;
};

const TYPE_COLOR: Record<NodeType, string> = {
  theme: "#3B6FA0",
  emotion: "#D4842A",
  person: "#C45C7C",
  distortion: "#8B6FBA",
  trigger: "#2D8A9E",
};

const TYPE_LABEL: Record<NodeType, string> = {
  theme: "Theme",
  emotion: "Emotion",
  person: "Person",
  distortion: "Distortion",
  trigger: "Trigger",
};

const MindMap = () => {
  const [nodes, setNodes] = useState<RawNode[]>([]);
  const [edges, setEdges] = useState<RawEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DetailResp | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [filter, setFilter] = useState<NodeType | "all">("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const fgRef = useRef<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-mind-map");
      if (error) throw error;
      setNodes(data?.nodes ?? []);
      setEdges(data?.edges ?? []);
    } catch (e) {
      toast.error("Couldn't load your mind map");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setSize({ w: r.width, h: Math.max(500, r.height) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const graphData = useMemo(() => {
    const visible = filter === "all" ? nodes : nodes.filter((n) => n.type === filter);
    const idSet = new Set(visible.map((n) => n.id));
    return {
      nodes: visible.map((n) => ({
        id: n.id,
        label: n.label,
        type: n.type,
        frequency: n.frequency,
        val: 1 + Math.log2(1 + n.frequency) * 4,
        color: TYPE_COLOR[n.type],
      })),
      links: edges
        .filter((e) => idSet.has(e.source) && idSet.has(e.target))
        .map((e) => ({ source: e.source, target: e.target, value: e.weight })),
    };
  }, [nodes, edges, filter]);

  const openDetail = async (id: string) => {
    setSelectedLoading(true);
    setSelected({ node: nodes.find((n) => n.id === id)!, entries: [], trend: {}, reframe: "" });
    try {
      const { data, error } = await supabase.functions.invoke("mind-node-detail", {
        body: { node_id: id },
      });
      if (error) throw error;
      setSelected(data as DetailResp);
    } catch (e) {
      toast.error("Couldn't load this node");
    } finally {
      setSelectedLoading(false);
    }
  };

  const backfill = async () => {
    setBackfilling(true);
    try {
      const { data, error } = await supabase.functions.invoke("backfill-mind-map");
      if (error) throw error;
      toast.success(`Mapped ${data?.processed ?? 0} entries`);
      await load();
    } catch (e) {
      toast.error("Backfill failed");
    } finally {
      setBackfilling(false);
    }
  };

  const trendBars = useMemo(() => {
    if (!selected) return [];
    const today = new Date();
    const days: { d: string; v: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10);
      days.push({ d, v: selected.trend[d] ?? 0 });
    }
    const max = Math.max(1, ...days.map((d) => d.v));
    return days.map((x) => ({ ...x, h: (x.v / max) * 100 }));
  }, [selected]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="font-barlow text-[11px] tracking-[0.2em] uppercase text-[#111]/40 mb-2">
              ( Mind Map · beta )
            </p>
            <h1 className="font-instrument text-[44px] md:text-[56px] leading-[1.05]">
              The architecture <br /> of <span className="italic">your</span> mind.
            </h1>
            <p className="font-barlow text-[15px] text-[#111]/55 mt-3 max-w-md">
              A living graph built quietly from every reflection. Tap any node to see what built it.
            </p>
          </div>
          <button
            onClick={backfill}
            disabled={backfilling}
            className="font-barlow text-[13px] px-4 py-2 rounded-full border border-black/15 hover:bg-black/[0.04] transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${backfilling ? "animate-spin" : ""}`} />
            {backfilling ? "Building…" : "Rebuild from past entries"}
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "theme", "emotion", "person", "distortion", "trigger"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`font-barlow text-[12px] px-3 py-1.5 rounded-full border transition ${
                filter === k
                  ? "bg-[#111] text-white border-[#111]"
                  : "border-black/10 text-[#111]/60 hover:text-[#111]"
              }`}
              style={
                filter === k && k !== "all"
                  ? { backgroundColor: TYPE_COLOR[k as NodeType], borderColor: TYPE_COLOR[k as NodeType] }
                  : undefined
              }
            >
              {k === "all" ? "All" : TYPE_LABEL[k as NodeType]}
            </button>
          ))}
        </div>

        <GlassCard className="!p-0 overflow-hidden">
          <div ref={containerRef} className="relative w-full h-[600px] bg-[#FAF9F4]">
            {loading ? (
              <div className="absolute inset-0 grid place-items-center">
                <p className="font-barlow text-[14px] text-[#111]/40">Loading your mind…</p>
              </div>
            ) : nodes.length === 0 ? (
              <div className="absolute inset-0 grid place-items-center text-center px-6">
                <div>
                  <Sparkles className="w-7 h-7 mx-auto mb-4 text-[#111]/30" strokeWidth={1.5} />
                  <h3 className="font-instrument text-[28px] mb-2">Your mind map is forming.</h3>
                  <p className="font-barlow text-[14px] text-[#111]/55 max-w-sm mx-auto mb-6">
                    Write 3 reflections and the AI starts surfacing your recurring themes, emotions, and patterns. Or rebuild from past entries.
                  </p>
                  <button
                    onClick={backfill}
                    disabled={backfilling}
                    className="font-barlow text-[13px] px-5 py-2.5 rounded-full bg-[#111] text-white hover:bg-[#222] transition disabled:opacity-50"
                  >
                    {backfilling ? "Building…" : "Build from past entries"}
                  </button>
                </div>
              </div>
            ) : (
              <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                width={size.w}
                height={size.h}
                backgroundColor="#FAF9F4"
                nodeLabel={(n: any) => `${TYPE_LABEL[n.type as NodeType]} · ${n.label} (×${n.frequency})`}
                nodeCanvasObject={(node: any, ctx: any, scale: number) => {
                  const r = node.val;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                  ctx.fillStyle = node.color;
                  ctx.globalAlpha = 0.85;
                  ctx.fill();
                  ctx.globalAlpha = 1;
                  if (scale > 1.2) {
                    ctx.font = `${11 / scale}px "Barlow", system-ui`;
                    ctx.fillStyle = "#111";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";
                    ctx.fillText(node.label, node.x, node.y + r + 2);
                  }
                }}
                linkColor={() => "rgba(17,17,17,0.15)"}
                linkWidth={(l: any) => Math.min(4, 0.5 + Math.log2(1 + l.value))}
                cooldownTicks={120}
                onNodeClick={(n: any) => openDetail(n.id)}
              />
            )}
          </div>
        </GlassCard>

        <p className="font-barlow text-[12px] text-[#111]/40 mt-4 text-center">
          Tap a node to open it. Drag to rearrange. Scroll to zoom.
        </p>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-[#F3F4ED] overflow-y-auto"
            >
              <div className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span
                      className="font-barlow text-[10px] tracking-[0.18em] uppercase px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: TYPE_COLOR[selected.node.type] }}
                    >
                      {TYPE_LABEL[selected.node.type]}
                    </span>
                    <h2 className="font-instrument text-[38px] leading-[1.05] mt-3 capitalize">
                      {selected.node.label}
                    </h2>
                    <p className="font-barlow text-[12px] text-[#111]/50 mt-1">
                      Seen {selected.node.frequency}× · first {new Date(selected.node.first_seen_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 rounded-full hover:bg-black/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Trend */}
                <div className="mb-7">
                  <p className="font-barlow text-[11px] tracking-[0.18em] uppercase text-[#111]/40 mb-3">
                    Last 30 days
                  </p>
                  <div className="flex items-end gap-[2px] h-16">
                    {trendBars.map((b) => (
                      <div
                        key={b.d}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${Math.max(4, b.h)}%`,
                          backgroundColor: b.v > 0 ? TYPE_COLOR[selected.node.type] : "rgba(17,17,17,0.08)",
                          opacity: b.v > 0 ? 0.85 : 1,
                        }}
                        title={`${b.d}: ${b.v}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Reframe */}
                {selectedLoading ? (
                  <div className="mb-7 rounded-2xl bg-white/60 border border-black/5 p-5">
                    <p className="font-barlow text-[13px] text-[#111]/40 animate-pulse">Reflecting…</p>
                  </div>
                ) : selected.reframe ? (
                  <div className="mb-7 rounded-2xl bg-white/80 border border-black/5 p-5">
                    <p className="font-barlow text-[10px] tracking-[0.18em] uppercase text-[#111]/40 mb-2">
                      Reframe
                    </p>
                    <p className="font-instrument text-[20px] leading-[1.3] text-[#111]/85">
                      "{selected.reframe}"
                    </p>
                  </div>
                ) : null}

                {/* Recent entries */}
                {selected.entries.length > 0 && (
                  <div>
                    <p className="font-barlow text-[11px] tracking-[0.18em] uppercase text-[#111]/40 mb-3">
                      What built this node
                    </p>
                    <div className="space-y-3">
                      {selected.entries.map((e) => (
                        <div key={e.id} className="rounded-xl bg-white/60 border border-black/5 p-4">
                          <p className="font-barlow text-[10px] text-[#111]/40 mb-1.5">
                            {new Date(e.created_at).toLocaleString()}
                          </p>
                          <p className="font-barlow text-[13px] text-[#111]/80 leading-relaxed">
                            {e.content}{e.content.length >= 240 ? "…" : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};

export default MindMap;
