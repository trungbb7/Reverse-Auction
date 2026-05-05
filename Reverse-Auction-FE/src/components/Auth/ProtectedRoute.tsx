import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "@/hooks/redux";
import type { Role } from "@/types/role";
import type { ReactNode } from "react";
import { getHomeByRole } from "@/utils/roleGuard";

// ─── RequireAuth ──────────────────────────────────────────────────────────────
// Yêu cầu đăng nhập. Nếu chưa login → redirect /auth/login?returnUrl=...
interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { logged } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!logged) {
    return (
      <Navigate
        to={`/auth/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

// ─── RequireRole ──────────────────────────────────────────────────────────────
// Yêu cầu role cụ thể. Nếu chưa login → redirect /auth/login. Nếu sai role → /unauthorized.
interface RequireRoleProps {
  children: ReactNode;
  roles: Role[];
}

export const RequireRole = ({ children, roles }: RequireRoleProps) => {
  const { logged, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!logged) {
    return (
      <Navigate
        to={`/auth/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (!user?.role || !roles.includes(user.role as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// ─── GuestOnly ────────────────────────────────────────────────────────────────
// Chỉ dành cho người chưa đăng nhập (trang auth).
// Nếu đã login → redirect về trang chính của role.
interface GuestOnlyProps {
  children: ReactNode;
}

export const GuestOnly = ({ children }: GuestOnlyProps) => {
  const { logged, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const returnUrl = params.get("returnUrl");

  if (logged) {
    const home = returnUrl
      ? decodeURIComponent(returnUrl)
      : getHomeByRole(user?.role);
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
};
