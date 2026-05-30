import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Radio, Lock, Mail, ArrowRight } from "lucide-react";
import { api, setToken, setStoredUser } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Operator Login · Sentinel/Ops" },
      { name: "description", content: "Authenticate to access the complaint operations grid." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setToken(res.access_token);
      setStoredUser({ email });
      toast.success("Access granted");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 glow-cyan relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-56 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-11 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center glow-cyan">
              <Radio className="size-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-wide text-glow-cyan">SENTINEL/OPS</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Secure Operator Terminal
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">Authenticate</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter credentials to access the operations grid.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <Field
              icon={<Mail className="size-4" />}
              type="email"
              placeholder="operator@grid.io"
              value={email}
              onChange={setEmail}
              label="Email"
              required
            />
            <Field
              icon={<Lock className="size-4" />}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              label="Password"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-primary to-neon text-primary-foreground font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-95 glow-cyan disabled:opacity-60 transition"
            >
              {loading ? "Verifying..." : "Engage"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground text-center">
            No clearance?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Request access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon, label, value, onChange, ...rest
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-input border border-border focus-within:border-primary focus-within:glow-cyan transition">
        <span className="text-muted-foreground">{icon}</span>
        <input
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
        />
      </div>
    </label>
  );
}
