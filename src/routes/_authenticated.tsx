import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login", replace: true });
  }, [loading, isAuthenticated, navigate]);
  if (loading || !isAuthenticated) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">جارٍ التحقق...</div>;
  }
  return <Outlet />;
}