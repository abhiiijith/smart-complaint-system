import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Server, Save, RotateCcw } from "lucide-react";
import { getApiBase, setApiBase, DEFAULT_API_BASE } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Sentinel/Ops" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [base, setBase] = useState(getApiBase());
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Console Configuration
        </div>
        <h1 className="text-3xl font-bold mt-1">Settings</h1>
      </header>

      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/15 border border-primary/30 grid place-items-center glow-cyan">
            <Server className="size-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Backend API Endpoint</div>
            <div className="text-xs text-muted-foreground">
              FastAPI base URL. Default: {DEFAULT_API_BASE}
            </div>
          </div>
        </div>

        <input
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-input border border-border outline-none focus:border-primary focus:glow-cyan transition text-sm font-mono"
          placeholder="http://127.0.0.1:8000"
        />

        <div className="flex gap-2">
          <button
            onClick={() => {
              setApiBase(base);
              toast.success("Endpoint updated");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium glow-cyan hover:opacity-95 transition"
          >
            <Save className="size-4" /> Save
          </button>
          <button
            onClick={() => {
              setBase(DEFAULT_API_BASE);
              setApiBase(DEFAULT_API_BASE);
              toast.success("Reset to default");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/40 text-sm transition"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
        <div className="font-semibold text-foreground mb-1">Heads up</div>
        Your backend must allow CORS from this preview origin. In FastAPI add{" "}
        <code className="text-primary">CORSMiddleware</code> with{" "}
        <code className="text-primary">allow_origins=["*"]</code> during development.
      </div>
    </div>
  );
}
