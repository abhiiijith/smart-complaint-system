import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Trash2, ImageOff, MapPin,
  Plus, Search, Activity, Layers, Radio
} from "lucide-react";
import { api, type Complaint, imageUrl } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Operations · Sentinel/Ops" },
      { name: "description", content: "Live operations grid for citywide complaints." },
    ],
  }),
  component: Dashboard,
});

const STATUSES = ["Pending", "In Progress", "Resolved"] as const;

function Dashboard() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["complaints"],
    queryFn: api.listComplaints,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Status updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => api.deleteComplaint(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Incident purged");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const complaints = data ?? [];
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => /pending/i.test(c.status)).length;
    const progress = complaints.filter((c) => /progress/i.test(c.status)).length;
    const resolved = complaints.filter((c) => /resolved/i.test(c.status)).length;
    return { total, pending, progress, resolved };
  }, [complaints]);

  const filtered = complaints.filter((c) => {
    const passStatus = filter === "All" || c.status?.toLowerCase() === filter.toLowerCase();
    const q = query.toLowerCase();
    const passQ =
      !q ||
      c.title?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q);
    return passStatus && passQ;
  });

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success pulse-dot text-success" />
            Live Feed · Operations Grid
          </div>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">
            Citywide <span className="text-glow-cyan text-primary">Complaint</span> Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor, triage, and resolve incidents in real time.
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-neon text-primary-foreground font-semibold glow-cyan hover:opacity-95 transition"
        >
          <Plus className="size-4" /> File New Report
        </Link>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total Incidents" value={stats.total} icon={Layers} tone="primary" />
        <StatTile label="Pending" value={stats.pending} icon={Clock} tone="warning" />
        <StatTile label="In Progress" value={stats.progress} icon={Activity} tone="accent" />
        <StatTile label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="success" />
      </div>

      {/* Filter bar */}
      <div className="glass rounded-xl p-3 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-input border border-border flex-1 min-w-0">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, location, category..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs uppercase tracking-wider border transition",
                filter === s
                  ? "bg-primary/15 text-primary border-primary/40 glow-cyan"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading && <SkeletonGrid />}
      {error && (
        <div className="glass rounded-xl p-6 border border-danger/40 text-danger flex items-center gap-3">
          <AlertTriangle className="size-5" />
          <div>
            <div className="font-semibold">Cannot reach backend</div>
            <div className="text-xs text-muted-foreground">{(error as Error).message}</div>
          </div>
        </div>
      )}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          <Radio className="size-8 mx-auto mb-2 opacity-60" />
          No incidents on the grid. Channel is clear.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <ComplaintCard
            key={c.id}
            complaint={c}
            onUpdate={(status) => updateMut.mutate({ id: c.id, status })}
            onDelete={() => {
              if (confirm(`Purge incident #${c.id}?`)) delMut.mutate(c.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StatTile({
  label, value, icon: Icon, tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "accent" | "success" | "warning";
}) {
  const toneMap = {
    primary: "from-primary/30 to-primary/0 text-primary",
    accent: "from-accent/30 to-accent/0 text-accent",
    success: "from-success/30 to-success/0 text-success",
    warning: "from-warning/30 to-warning/0 text-warning",
  };
  return (
    <div className="glass rounded-xl p-4 relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", toneMap[tone])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">{value.toString().padStart(2, "0")}</div>
        </div>
        <Icon className={cn("size-5", toneMap[tone].split(" ").pop())} />
      </div>
      <div className="relative mt-3 h-1 rounded-full bg-border/40 overflow-hidden">
        <div className={cn("h-full bg-gradient-to-r animate-pulse", toneMap[tone])} style={{ width: `${Math.min(100, value * 8 + 10)}%` }} />
      </div>
    </div>
  );
}

function statusStyle(status: string) {
  const s = status?.toLowerCase() ?? "";
  if (s.includes("resolved")) return { text: "text-success", bg: "bg-success/10 border-success/40", glow: "glow-green", dot: "bg-success" };
  if (s.includes("progress")) return { text: "text-accent", bg: "bg-accent/10 border-accent/40", glow: "glow-magenta", dot: "bg-accent" };
  return { text: "text-warning", bg: "bg-warning/10 border-warning/40", glow: "", dot: "bg-warning" };
}

function ComplaintCard({
  complaint, onUpdate, onDelete,
}: {
  complaint: Complaint;
  onUpdate: (status: string) => void;
  onDelete: () => void;
}) {
  const st = statusStyle(complaint.status);
  const img = imageUrl(complaint.image);

  return (
    <article className="glass rounded-xl overflow-hidden flex flex-col group hover:border-primary/40 transition-all hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-secondary to-background overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={complaint.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => ((e.currentTarget.style.display = "none"))}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={cn("text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-md border backdrop-blur", st.bg, st.text, st.glow)}>
            <span className={cn("inline-block size-1.5 rounded-full mr-1.5 align-middle", st.dot, "pulse-dot")} style={{ color: "currentColor" }} />
            {complaint.status || "Pending"}
          </span>
        </div>
        <div className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.18em] glass px-2 py-1 rounded-md">
          #{complaint.id.toString().padStart(4, "0")}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary">
            <span className="size-1 rounded-full bg-primary" /> {complaint.category || "General"}
          </div>
          <h3 className="mt-1 font-semibold text-lg leading-tight">{complaint.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{complaint.description}</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          <span className="truncate">{complaint.location || "Unknown sector"}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-border/60 flex items-center gap-2">
          <select
            value={complaint.status}
            onChange={(e) => onUpdate(e.target.value)}
            className="flex-1 text-xs bg-input border border-border rounded-md px-2 py-1.5 outline-none focus:border-primary"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={onDelete}
            className="p-2 rounded-md border border-border hover:border-danger hover:text-danger transition"
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass rounded-xl overflow-hidden">
          <div className="aspect-[16/10] bg-muted/40 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-1/3 bg-muted/40 rounded animate-pulse" />
            <div className="h-5 w-2/3 bg-muted/40 rounded animate-pulse" />
            <div className="h-3 w-full bg-muted/40 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
