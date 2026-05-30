import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Radio, User, Mail, Lock, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Request Access · Sentinel/Ops" },
      { name: "description", content: "Provision a new operator account on the complaint operations grid." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register({ name, email, password });
      toast.success("Operator provisioned. Sign in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 glow-magenta relative overflow-hidden">
        <div className="absolute -top-20 -left-20 size-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 size-56 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-11 rounded-xl bg-gradient-to-br from-accent to-primary grid place-items-center glow-magenta">
              <Radio className="size-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-wide">SENTINEL/OPS</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                New Operator Provisioning
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">Request Access</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Create your operator credentials.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={<User className="size-4" />} label="Name" value={name} onChange={setName} placeholder="Jane Operator" required />
            <Field icon={<Mail className="size-4" />} type="email" label="Email" value={email} onChange={setEmail} placeholder="operator@grid.io" required />
            <Field icon={<Lock className="size-4" />} type="password" label="Password" value={password} onChange={setPassword} placeholder="••••••••" required minLength={6} />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-primary-foreground font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-95 glow-magenta disabled:opacity-60 transition"
            >
              {loading ? "Provisioning..." : "Provision Operator"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground text-center">
            Already credentialed?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Authenticate
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
      <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-input border border-border focus-within:border-accent focus-within:glow-magenta transition">
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
