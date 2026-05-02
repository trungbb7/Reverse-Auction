import { ShieldX, Home, LogOut } from "lucide-react";
import { Link } from "react-router";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { logoutUser } from "@/components/Auth/authSlice";
import { useNavigate } from "react-router";
import { getHomeByRole } from "@/utils/roleGuard";

const Unauthorized = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const homeUrl = getHomeByRole(user?.role);

  const roleLabel: Record<string, string> = {
    ROLE_BUYER: "Người mua",
    ROLE_SELLER: "Người bán",
    ROLE_ADMIN: "Quản trị viên",
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Icon container */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl scale-150" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 backdrop-blur-sm">
              <ShieldX className="h-14 w-14 text-red-400" />
            </div>
          </div>
        </div>

        {/* Error code */}
        <p className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2 leading-none">
          403
        </p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Không có quyền truy cập
        </h1>

        {/* Description */}
        <p className="text-slate-400 mb-2 leading-relaxed">
          Trang này không dành cho tài khoản của bạn.
        </p>

        {user && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/60 border border-slate-600/50 backdrop-blur-sm mb-8">
            <span className="text-xs text-slate-400">Vai trò hiện tại:</span>
            <span className="text-xs font-semibold text-white">
              {roleLabel[user.role] ?? user.role}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            to={homeUrl}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-lg shadow-primary-900/30 hover:shadow-primary-900/50 hover:scale-105 transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            Về trang của tôi
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700/60 border border-slate-600/50 text-slate-300 font-semibold hover:bg-slate-700 hover:text-white hover:scale-105 transition-all duration-200 backdrop-blur-sm"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-slate-600">
          HardwareBid &mdash; Reverse Auction Platform
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
