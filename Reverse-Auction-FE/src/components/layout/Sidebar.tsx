import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  TrendingUp,
  FileText
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
    { name: "Quản lý sản phẩm", path: "/admin/products", icon: <Package size={20} /> },
    { name: "Người dùng", path: "/admin/users", icon: <Users size={20} /> },
    { name: "Doanh thu", path: "/admin/revenue", icon: <TrendingUp size={20} /> },
    { name: "Chính sách", path: "/admin/policies", icon: <FileText size={20} /> },
    { name: "Cài đặt", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  const sellerNavLinks = [
    { name: "Bảng điều khiển", path: "/seller", icon: <LayoutDashboard size={20} /> },
    { name: "Đơn hàng của tôi", path: "/seller/orders", icon: <ShoppingCart size={20} /> },
    { name: "Yêu cầu đấu giá", path: "/seller/auctions", icon: <Package size={20} /> },
    { name: "Thống kê", path: "/seller/stats", icon: <TrendingUp size={20} /> },
    { name: "Cửa hàng", path: "/seller/shop", icon: <Settings size={20} /> },
  ];

  const navLinks = role === "admin" ? adminNavLinks : sellerNavLinks;

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-300 transition-all duration-300">
      <div className="flex h-16 items-center justify-center border-b border-slate-800 px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            HardwareBid
            <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-400 border border-primary-600/30">
              {role.toUpperCase()}
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
