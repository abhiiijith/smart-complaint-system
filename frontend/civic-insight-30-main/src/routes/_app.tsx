import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { ControlSidebar } from "@/components/control-sidebar";
import { getToken } from "@/lib/api-client";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <ControlSidebar />
      <main className="flex-1 min-w-0 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
