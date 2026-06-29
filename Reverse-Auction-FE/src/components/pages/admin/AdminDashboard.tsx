import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { formatCurrency } from "@/utils/time";
import { Link } from "react-router";
import toast from "react-hot-toast";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Scale,
  Plus,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalAuctions: number;
  totalRevenue: number;
  revenueByCategory: Record<string, number>;
  ordersByStatus: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState<string>("10");
  const [updatingCommission, setUpdatingCommission] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, rate] = await Promise.all([
          adminService.getAdminStats(),
          adminService.getCommissionRate(),
        ]);
        setStats(statsData);
        setCommissionRate(rate.toString());
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveCommission = async () => {
    const rateNum = Number(commissionRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      toast.error("Tỷ lệ hoa hồng phải từ 0% đến 100%!");
      return;
    }
    setUpdatingCommission(true);
    try {
      const newRate = await adminService.updateCommissionRate(rateNum);
      setCommissionRate(newRate.toString());
      toast.success("Cập nhật tỷ lệ hoa hồng thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật tỷ lệ hoa hồng!");
    } finally {
      setUpdatingCommission(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const totalUsers = stats?.totalUsers || 0;
  const totalAuctions = stats?.totalAuctions || 0;
  const totalOrders = stats?.totalOrders || 0;

  // Prepare order status mapping for visual breakdown
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-black text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Theo dõi số liệu hoạt động, tăng trưởng doanh số và quản lý toàn bộ hệ
          thống
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Người dùng</p>
            <p className="text-3xl font-black text-slate-800">{totalUsers}</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Users size={24} />
          </div>
        </div>

        {/* Total Auctions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Phiên đấu giá
            </p>
            <p className="text-3xl font-black text-slate-800">
              {totalAuctions}
            </p>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
            <Package size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Đơn hàng</p>
            <p className="text-3xl font-black text-slate-800">{totalOrders}</p>
          </div>
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Doanh thu hoàn tất
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Revenue Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <TrendingUp className="text-primary-600" />
              Doanh thu theo Danh mục
            </h3>
          </div>

          {stats?.revenueByCategory &&
          Object.keys(stats.revenueByCategory).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.revenueByCategory).map(
                ([category, amount]) => {
                  const maxAmount = Math.max(
                    ...Object.values(stats.revenueByCategory),
                    1,
                  );
                  const percent = (amount / maxAmount) * 100;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-700">
                          {category}
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-primary-600 to-blue-400 rounded-full transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">
              Chưa ghi nhận doanh thu hoàn thành nào
            </p>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <ShoppingCart className="text-orange-500" />
            Tình trạng Đơn hàng
          </h3>

          {stats?.ordersByStatus &&
          Object.keys(stats.ordersByStatus).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const total = Object.values(stats.ordersByStatus).reduce(
                  (a, b) => a + b,
                  0,
                );
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
            <p className="text-slate-400 text-sm text-center py-10">
              Chưa ghi nhận đơn hàng nào
            </p>
          )}
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Cấu hình Hệ thống</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="font-semibold text-slate-700 text-sm">
              Tỷ lệ hoa hồng (%)
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Tỷ lệ phần trăm hoa hồng trích từ mỗi đơn hàng thành công của
              người bán.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white w-24 text-center"
            />
            <button
              onClick={handleSaveCommission}
              disabled={updatingCommission}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-60 active:scale-95 whitespace-nowrap"
            >
              {updatingCommission ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Phím tắt Quản lý</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            to="/admin/users"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-primary-50 hover:border-primary-200 transition-all font-semibold text-slate-700 hover:text-primary-600"
          >
            <Users size={20} />
            <span className="text-xs">Quản lý Người dùng</span>
          </Link>

          <Link
            to="/admin/categories"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-primary-50 hover:border-primary-200 transition-all font-semibold text-slate-700 hover:text-primary-600"
          >
            <Plus size={20} />
            <span className="text-xs">Quản lý Danh mục</span>
          </Link>

          <Link
            to="/admin/auctions"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-primary-50 hover:border-primary-200 transition-all font-semibold text-slate-700 hover:text-primary-600"
          >
            <Package size={20} />
            <span className="text-xs">Quản lý Đấu giá</span>
          </Link>

          <Link
            to="/admin/orders"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-primary-50 hover:border-primary-200 transition-all font-semibold text-slate-700 hover:text-primary-600"
          >
            <ShoppingCart size={20} />
            <span className="text-xs">Quản lý Đơn hàng</span>
          </Link>

          <Link
            to="/admin/complaints"
            className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-primary-50 hover:border-primary-200 transition-all font-semibold text-slate-700 hover:text-primary-600"
          >
            <Scale size={20} />
            <span className="text-xs">Giải quyết Khiếu nại</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
