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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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

  // Get display name: fullName from store, fallback to email prefix
  const displayName =
    user?.fullName || user?.email?.split("@")[0] || "Tài khoản";

  // Generate avatar initials
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Mobile menu button */}
        <button className="mr-4 md:hidden text-slate-500 hover:text-slate-900">
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-600">
                HardwareBid
              </span>
            </Link>
          )}
        </div>

        {/* Search Bar (Only for non-admin) */}
        {!isAdmin && (
          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm linh kiện PC..."
                className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 pl-10 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-3">
          {!isAdmin && logged && (
            <Link
              to="/cart"
              className="text-slate-500 hover:text-primary-600 transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                0
              </span>
            </Link>
          )}

          {logged && (
            <button className="text-slate-500 hover:text-primary-600 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
          )}

          {!isAdmin && logged && (
            <>
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <Link
                to="/my-auctions"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
              >
                Đấu giá của tôi
              </Link>
            </>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Auth section */}
          {logged ? (
            /* Logged in: Avatar + dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-slate-100 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold select-none">
                  {initials}
                </div>
                <span className="hidden sm:inline-block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                  >
                    <UserCircle className="h-4 w-4" />
                    Hồ sơ của tôi
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in: Login + Register buttons */
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-slate-700 border border-slate-200 hover:border-primary-500 hover:text-primary-600 transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
              <Link
                to="/auth/register"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm"
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
