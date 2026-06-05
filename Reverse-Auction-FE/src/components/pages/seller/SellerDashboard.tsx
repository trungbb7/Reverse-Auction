import { useState, useEffect } from "react";
import { orderService } from "@/services/orderService";
import { formatCurrency } from "@/utils/time";
import { Link } from "react-router";
import {
  Gavel,
  Trophy,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Search,
  Package,
  AlertTriangle,
} from "lucide-react";

interface SellerStats {
  totalBids: number;
  totalWonBids: number;
  totalOrders: number;
  totalRevenue: number;
  revenueByMonth: Record<string, number>;
  ordersByStatus: Record<string, number>;
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await orderService.getSellerStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load seller stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#375F97]"></div>
      </div>
    );
  }

  const totalBids = stats?.totalBids || 0;
  const totalWonBids = stats?.totalWonBids || 0;
  const totalOrders = stats?.totalOrders || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  // Win rate calculation
  const winRate = totalBids > 0 ? (totalWonBids / totalBids) * 100 : 0;

  const statusLabels: Record<string, string> = {
    AWAITING_PAYMENT: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    COMPLETED: "Hoàn tất",
    DISPUTED: "Tranh chấp",
    CANCELLED: "Đã hủy",
  };

  const statusColors: Record<string, string> = {
    AWAITING_PAYMENT: "bg-yellow-500",
    PAID: "bg-blue-400",
    PROCESSING: "bg-indigo-500",
    SHIPPED: "bg-blue-600",
    DELIVERED: "bg-teal-500",
    COMPLETED: "bg-emerald-500",
    DISPUTED: "bg-red-500",
    CANCELLED: "bg-slate-400",
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800">Kênh Người bán</h1>
        <p className="text-slate-500 mt-1">
          Theo dõi doanh số, phản hồi các phiên đấu giá PC và quản lý đơn hàng
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bids */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Số lượt báo giá (Bids)</p>
            <p className="text-3xl font-black text-slate-800">{totalBids}</p>
          </div>
          <div className="p-4 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-[#375F97] group-hover:text-white transition-all">
            <Gavel size={24} />
          </div>
        </div>

        {/* Won Bids / Win Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Lượt thắng thầu</p>
            <p className="text-3xl font-black text-slate-800">
              {totalWonBids} <span className="text-sm font-normal text-slate-400">({winRate.toFixed(0)}% thắng)</span>
            </p>
          </div>
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-all">
            <Trophy size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Đơn hàng đã bán</p>
            <p className="text-3xl font-black text-slate-800">{totalOrders}</p>
          </div>
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Doanh thu bán hàng</p>
            <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <TrendingUp className="text-[#375F97]" />
            Doanh số theo tháng
          </h3>

          {stats?.revenueByMonth && Object.keys(stats.revenueByMonth).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.revenueByMonth).map(([month, amount]) => {
                const maxAmount = Math.max(...Object.values(stats.revenueByMonth), 1);
                const percent = (amount / maxAmount) * 100;
                return (
                  <div key={month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700">Tháng {month}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#375F97] to-blue-400 rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">Chưa có dữ liệu doanh thu tháng</p>
          )}
        </div>

        {/* Orders Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <ShoppingCart className="text-orange-500" />
            Tình trạng đơn hàng của bạn
          </h3>

          {stats?.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const total = Object.values(stats.ordersByStatus).reduce((a, b) => a + b, 0);
                const percent = (count / total) * 100;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700">
                        {statusLabels[status] || status}
                      </span>
                      <span className="font-bold text-slate-900">
                        {count} đơn ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${statusColors[status] || "bg-slate-500"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">Bạn chưa bán đơn hàng nào</p>
          )}
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Lối tắt quản trị</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            to="/seller/search"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all font-semibold text-slate-700 hover:text-[#375F97]"
          >
            <Search size={20} />
            <span className="text-xs">Tìm phòng đấu giá</span>
          </Link>

          <Link
            to="/seller/orders"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all font-semibold text-slate-700 hover:text-[#375F97]"
          >
            <ShoppingCart size={20} />
            <span className="text-xs">Quản lý Đơn hàng</span>
          </Link>

          <Link
            to="/seller/products"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all font-semibold text-slate-700 hover:text-[#375F97]"
          >
            <Package size={20} />
            <span className="text-xs">Kho Sản phẩm</span>
          </Link>

          <Link
            to="/seller/chat"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all font-semibold text-slate-700 hover:text-[#375F97]"
          >
            <MessageSquare size={20} />
            <span className="text-xs">Nhắn tin trò chuyện</span>
          </Link>

          <Link
            to="/seller/complaints"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all font-semibold text-slate-700 hover:text-[#375F97]"
          >
            <AlertTriangle size={20} />
            <span className="text-xs">Quản lý Khiếu nại</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
