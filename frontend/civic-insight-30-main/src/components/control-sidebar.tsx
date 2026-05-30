import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, PlusCircle, LogOut, Radio, Settings } from "lucide-react";
import { getStoredUser, setStoredUser, setToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const items = [
  { title: "Operations", url: "/" as const, icon: LayoutDashboard },
  { title: "New Report", url: "/complaints/new" as const, icon: PlusCircle },
  { title: "Settings", url: "/settings" as const, icon: Settings },
];

export function ControlSidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const user = getStoredUser();
  if (!user) {
  navigate({ to: "/login" });
  return null;
}

  const logout = () => {
    setToken(null);
    setStoredUser(null);
    navigate({ to: "/login" });
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col glass-strong border-r border-border/60 p-4 gap-6 sticky top-0 h-screen">
      <div className="flex items-center gap-3 px-2 pt-2">
        <div className="relative">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center glow-cyan">
            <Radio className="size-5 text-primary-foreground" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-success pulse-dot text-success" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide text-glow-cyan">SENTINEL/OPS</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Complaint Grid · v2.6
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <div className="px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Navigation
        </div>
        {items.map((it) => {
          const active = pathname === it.url;
          return (
            <Link
              key={it.url}
              to={it.url}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                "hover:bg-sidebar-accent/60",
                active &&
                  "bg-gradient-to-r from-primary/15 to-transparent text-primary border border-primary/30 glow-cyan"
              )}
            >
              <it.icon className={cn("size-4", active && "drop-shadow-[0_0_6px_currentColor]")} />
              <span className="font-medium tracking-wide">{it.title}</span>
              {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="glass rounded-xl p-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-accent to-primary grid place-items-center text-xs font-bold text-primary-foreground">
            {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate"> { user?.email || "Not logged in"}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {user?.email || ""}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-md border border-border/70 hover:border-danger/60 hover:text-danger transition-colors"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
