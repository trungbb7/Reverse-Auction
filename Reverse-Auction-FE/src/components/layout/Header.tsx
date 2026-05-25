import { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Bell,
  Menu,
  LogIn,
  UserPlus,
  LogOut,
  UserCircle,
  ChevronDown,
  TriangleAlert,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { logoutUser } from "@/components/Auth/authSlice";

interface HeaderProps {
  isAdmin?: boolean;
}

const Header = ({ isAdmin = false }: HeaderProps) => {
  const { logged, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setDropdownOpen(false);
    navigate("/auth/login");
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "Tai khoan";

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-6 lg:px-8">
        <button className="mr-4 md:hidden text-slate-500 hover:text-slate-900">
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-600">
                HardwareBid
              </span>
            </Link>
          )}
        </div>

        {!isAdmin && (
          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Tim kiem linh kien PC..."
                className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {!isAdmin && logged && (
            <Link
              to="/cart"
              className="relative text-slate-500 transition-colors hover:text-primary-600"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                0
              </span>
            </Link>
          )}

          {logged && (
            <button className="relative text-slate-500 transition-colors hover:text-primary-600">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          )}

          {!isAdmin && logged && (
            <>
              <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
              <Link
                to="/my-auctions"
                className="hidden items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-primary-600 md:flex"
              >
                Đấu giá của tôi
              </Link>
              <Link
                to="/buyer/complaints"
                className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 transition-colors hover:border-amber-300 hover:bg-amber-100 md:flex"
              >
                <TriangleAlert className="h-4 w-4" />
                Khiếu nại
              </Link>
            </>
          )}

          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          {logged ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-slate-100"
              >
                <div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {initials}
                </div>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 sm:inline-block">
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {displayName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary-600"
                  >
                    <UserCircle className="h-4 w-4" />
                    Hồ sơ của tôi
                  </Link>

                  {user?.role === "ROLE_BUYER" && (
                    <>
                      <Link
                        to="/buyer/complaints"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary-600"
                      >
                        <TriangleAlert className="h-4 w-4" />
                        Khiếu nại
                      </Link>
                      <Link
                        to="/buyer/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary-600"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Đơn hàng
                      </Link>
                    </>
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-primary-500 hover:text-primary-600"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
              <Link
                to="/auth/register"
                className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-all shadow-sm hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng ký</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
