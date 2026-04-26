import { Search, ShoppingCart, User, Bell, Menu } from "lucide-react";
import { Link } from "react-router";

interface HeaderProps {
  isAdmin?: boolean;
}

const Header = ({ isAdmin = false }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
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
        <div className="ml-auto flex items-center gap-4">
          {!isAdmin && (
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

          <button className="text-slate-500 hover:text-primary-600 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          {!isAdmin && (
            <Link
              to="/my-auctions"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
            >
              Đấu giá của tôi
            </Link>
          )}

          {!isAdmin && (
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
          )}
          <Link
            to="/profile"
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <span className="hidden sm:inline-block">Tài khoản</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
