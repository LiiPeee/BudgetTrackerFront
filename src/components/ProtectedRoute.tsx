import { getAccessToken, onAuthUnauthorized } from "@/lib/api";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Estado reativo: re-renderiza quando o token muda (logout em outra aba via
  // evento "storage", ou sessão expirada via "auth:unauthorized").
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAccessToken() != null);

  useEffect(() => {
    const handleStorage = () => setIsAuthenticated(getAccessToken() != null);
    const unsubscribe = onAuthUnauthorized(() => {
      setIsAuthenticated(false);
      window.location.replace("/auth");
    });

    window.addEventListener("storage", handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
