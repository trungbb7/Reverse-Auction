import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  FileText,
  Search,
  TriangleAlert,
  MessageSquare,
  LayoutGrid,
} from "lucide-react";

interface SidebarProps {
  role?: "admin" | "seller";
}

const Sidebar = ({ role = "admin" }: SidebarProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  const adminNavLinks = [
    { name: "Tổng quan", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Quản lý đơn hàng", path: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: "Quản lý đấu giá", path: "/admin/auctions", icon: <Package size={20} /> },
    { name: "Danh mục", path: "/admin/categories", icon: <LayoutGrid size={20} /> },
    { name: "Người dùng", path: "/admin/users", icon: <Users size={20} /> },
    { name: "Khiếu nại", path: "/admin/complaints", icon: <TriangleAlert size={20} /> },
    { name: "Doanh thu", path: "/admin/revenue", icon: <TrendingUp size={20} /> },
    { name: "Chính sách", path: "/admin/policies", icon: <FileText size={20} /> },
    { name: "Cài đặt", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  const sellerNavLinks = [
    { name: "Quản lý đấu giá", path: "/seller", icon: <LayoutDashboard size={20} /> },
    { name: "Sản phẩm", path: "/seller/products", icon: <Package size={20} /> },
    { name: "Tìm kiếm", path: "/seller/search", icon: <Search size={20} /> },
    { name: "Đơn hàng", path: "/seller/orders", icon: <ShoppingCart size={20} /> },
    { name: "Thống kê", path: "/seller/stats", icon: <TrendingUp size={20} /> },
    { name: "Khiếu nại", path: "/seller/complaints", icon: <TriangleAlert size={20} /> },
    { name: "Trò chuyện", path: "/seller/chat", icon: <MessageSquare size={20} /> },
  ];

  const navLinks = role === "admin" ? adminNavLinks : sellerNavLinks;

  return (
    <aside className="hidden w-64 flex-col bg-slate-900 text-slate-300 transition-all duration-300 md:flex">
      <div className="flex h-16 items-center justify-center border-b border-slate-800 px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            HardwareBid
            <span className="ml-2 rounded-full border border-primary-600/30 bg-primary-600/20 px-2 py-0.5 text-xs text-primary-400">
              {role.toUpperCase()}
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400">
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
