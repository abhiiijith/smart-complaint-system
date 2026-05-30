import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Send, X, Image as ImageIcon, MapPin, Layers, FileText, AlignLeft } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Sanitation",
  "Roads & Traffic",
  "Water Supply",
  "Public Safety",
  "Noise",
  "Other",
];

export const Route = createFileRoute("/_app/complaints/new")({
  head: () => ({
    meta: [{ title: "File Incident · Sentinel/Ops" }],
  }),
  component: NewComplaintPage,
});

function NewComplaintPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onImage = (file: File | null) => {
    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("category", category);
      fd.append("location", location);
      if (image) fd.append("image", image);
      await api.createComplaint(fd);
      toast.success("Incident logged on the grid");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          New Transmission
        </div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">
          File <span className="text-primary text-glow-cyan">Incident</span> Report
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Provide accurate intel. Dispatch responds based on severity & sector.
        </p>
      </header>

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-5">
        <div className="glass-strong rounded-2xl p-6 space-y-5">
          <Field label="Incident Title" icon={<FileText className="size-4" />}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Water Leakage near Block A"
              className="bg-transparent outline-none w-full text-sm"
            />
          </Field>

          <Field label="Description" icon={<AlignLeft className="size-4" />}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Describe the situation, severity, and any hazards."
              className="bg-transparent outline-none w-full text-sm resize-none"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Category" icon={<Layers className="size-4" />}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-popover">{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Location" icon={<MapPin className="size-4" />}>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Sector / Block / Address"
                className="bg-transparent outline-none w-full text-sm"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-strong rounded-2xl p-6 space-y-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Evidence Capture
            </div>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={preview} alt="preview" className="w-full aspect-video object-cover" />
                <button
                  type="button"
                  onClick={() => onImage(null)}
                  className="absolute top-2 right-2 size-8 grid place-items-center rounded-full bg-background/80 border border-border hover:text-danger"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition">
                  <div className="size-12 rounded-full bg-primary/15 border border-primary/30 grid place-items-center mx-auto mb-3 glow-cyan">
                    <Upload className="size-5 text-primary" />
                  </div>
                  <div className="text-sm font-medium">Upload image evidence</div>
                  <div className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onImage(e.target.files?.[0] ?? null)}
                />
              </label>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="size-3.5" />
              Geo-tagged photo strongly recommended.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-neon text-primary-foreground font-semibold tracking-wide flex items-center justify-center gap-2 glow-cyan hover:opacity-95 disabled:opacity-60 transition"
          >
            <Send className="size-4" />
            {loading ? "Transmitting..." : "Transmit Report"}
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="w-full py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, icon, children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-input border border-border focus-within:border-primary focus-within:glow-cyan transition">
        <span className="text-muted-foreground mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </label>
  );
}
