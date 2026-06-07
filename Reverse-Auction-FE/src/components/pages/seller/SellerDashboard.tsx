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
  Calendar,
  PieChart as PieIcon,
  ChevronDown,
} from "lucide-react";

interface SellerStats {
  totalBids: number;
  totalWonBids: number;
  totalOrders: number;
  totalRevenue: number;
  revenueByDay: Record<string, number>;
  revenueByMonth: Record<string, number>;
  revenueByYear: Record<string, number>;
  revenueByCategoryByMonth: Record<string, Record<string, number>>;
  ordersByStatus: Record<string, number>;
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeOption, setTimeOption] = useState<"day" | "month" | "year">(
    "month",
  );
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await orderService.getSellerStats();
        setStats(data);

        // Auto-select the latest month from category data
        if (data.revenueByCategoryByMonth) {
          const months = Object.keys(data.revenueByCategoryByMonth)
            .sort()
            .reverse();
          if (months.length > 0) {
            setSelectedMonth(months[0]);
          }
        }
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

  // Modern color palette for pie slices
  const PIE_COLORS = [
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#f43f5e", // Rose
    "#14b8a6", // Teal
  ];

  // Helper: Prepare column chart data based on timeOption
  const getColumnChartData = () => {
    if (!stats) return [];

    let rawData: Record<string, number> = {};
    if (timeOption === "day") {
      rawData = stats.revenueByDay || {};
    } else if (timeOption === "month") {
      rawData = stats.revenueByMonth || {};
    } else {
      rawData = stats.revenueByYear || {};
    }

    // Sort keys chronologically
    let sortedKeys = Object.keys(rawData).sort();

    // If day option, limit to last 15 days to avoid layout breakage
    if (timeOption === "day" && sortedKeys.length > 15) {
      sortedKeys = sortedKeys.slice(sortedKeys.length - 15);
    }

    return sortedKeys.map((key) => {
      let displayLabel = key;
      if (timeOption === "day") {
        // YYYY-MM-DD -> DD/MM
        const parts = key.split("-");
        if (parts.length === 3) {
          displayLabel = `${parts[2]}/${parts[1]}`;
        }
      } else if (timeOption === "month") {
        // YYYY-MM -> MM/YY
        const parts = key.split("-");
        if (parts.length === 2) {
          displayLabel = `Th ${parts[1]}/${parts[0].slice(2)}`;
        }
      }
      return {
        key,
        label: displayLabel,
        value: rawData[key] || 0,
      };
    });
  };

  const columnData = getColumnChartData();
  const maxRevenueValue = Math.max(...columnData.map((d) => d.value), 1);

  // Helper: Prepare pie chart category data for selectedMonth
  const getPieChartData = () => {
    if (!stats || !selectedMonth || !stats.revenueByCategoryByMonth) return [];
    const monthlyCategoryData =
      stats.revenueByCategoryByMonth[selectedMonth] || {};

    const entries = Object.entries(monthlyCategoryData);
    const total = entries.reduce((acc, [, val]) => acc + val, 0);

    if (total === 0) return [];

    let accumulatedPercentage = 0;
    return entries.map(([category, value], idx) => {
      const percentage = (value / total) * 100;
      const start = accumulatedPercentage;
      accumulatedPercentage += percentage;
      return {
        category,
        value,
        percentage,
        start,
        end: accumulatedPercentage,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      };
    });
  };

  const pieData = getPieChartData();

  // Create conic-gradient style string for dynamic custom CSS pie chart
  const getConicGradientStyle = () => {
    if (pieData.length === 0) return "conic-gradient(#cbd5e1 0% 100%)";
    const slices = pieData.map(
      (slice) =>
        `${slice.color} ${slice.start.toFixed(2)}% ${slice.end.toFixed(2)}%`,
    );
    return `conic-gradient(${slices.join(", ")})`;
  };

  // Get available months lists for category dropdown filter
  const getAvailableMonths = () => {
    if (!stats || !stats.revenueByCategoryByMonth) return [];
    return Object.keys(stats.revenueByCategoryByMonth).sort().reverse();
  };

  const availableMonths = getAvailableMonths();

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800">
          Doanh thu & Thống kê
        </h1>
        <p className="text-slate-500 mt-1">
          Theo dõi doanh số chi tiết, phân tích cơ cấu hàng hoá và tình hình
          kinh doanh tổng quan
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bids */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Số lượt báo giá (Bids)
            </p>
            <p className="text-3xl font-black text-slate-800">{totalBids}</p>
          </div>
          <div className="p-4 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-[#375F97] group-hover:text-white transition-all">
            <Gavel size={24} />
          </div>
        </div>

        {/* Won Bids / Win Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Lượt thắng thầu
            </p>
            <p className="text-3xl font-black text-slate-800">
              {totalWonBids}{" "}
              <span className="text-sm font-normal text-slate-400">
                ({winRate.toFixed(0)}% thắng)
              </span>
            </p>
          </div>
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-all">
            <Trophy size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Đơn hàng đã bán
            </p>
            <p className="text-3xl font-black text-slate-800">{totalOrders}</p>
          </div>
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Doanh thu bán hàng
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

      {/* Row 1: Interactive Column/Bar Chart for Revenue */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <TrendingUp className="text-[#375F97]" />
            Doanh số
          </h3>
          {/* Time Option Selector */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTimeOption("day")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeOption === "day"
                  ? "bg-white text-[#375F97] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Theo ngày
            </button>
            <button
              onClick={() => setTimeOption("month")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeOption === "month"
                  ? "bg-white text-[#375F97] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Theo tháng
            </button>
            <button
              onClick={() => setTimeOption("year")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeOption === "year"
                  ? "bg-white text-[#375F97] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Theo năm
            </button>
          </div>
        </div>

        {columnData.length > 0 ? (
          <div className="space-y-6">
            {/* Visual Bar Container */}
            <div className="relative h-64 flex items-end justify-between px-2 pt-8 border-b border-slate-200">
              {/* Custom SVG Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0.5">
                <div className="w-full border-t border-dashed border-slate-100 h-0 text-slate-350 text-[10px] pl-2 pt-1 font-semibold">
                  {formatCurrency(maxRevenueValue)}
                </div>
                <div className="w-full border-t border-dashed border-slate-100 h-0 text-slate-350 text-[10px] pl-2 pt-1 font-semibold">
                  {formatCurrency(maxRevenueValue * 0.5)}
                </div>
                <div className="w-full h-0"></div>
              </div>

              {columnData.map((d, index) => {
                const heightPercent = (d.value / maxRevenueValue) * 100;
                return (
                  <div
                    key={d.key}
                    className="relative flex flex-col items-center flex-1 group z-10"
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip */}
                    <div
                      className={`absolute -top-12 bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-30 transition-all duration-200 ${
                        hoveredBarIndex === index
                          ? "opacity-100 translate-y-0 scale-100"
                          : "opacity-0 translate-y-1 scale-95"
                      }`}
                    >
                      <span className="block text-slate-400 font-semibold text-[9px] uppercase tracking-wider">
                        {d.key}
                      </span>
                      {formatCurrency(d.value)}
                    </div>

                    {/* Bar Pillar */}
                    <div className="w-[45%] max-w-[40px] min-w-[12px] bg-slate-100 rounded-t-lg overflow-hidden h-64 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-[#375F97] to-blue-400 rounded-t-lg group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all duration-300 shadow-inner"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* X-Axis Label */}
                    <span className="text-[11px] font-bold text-slate-500 mt-2 truncate w-full text-center">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <TrendingUp size={36} className="text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm">
              Chưa có dữ liệu doanh số cho tùy chọn này
            </p>
          </div>
        )}
      </div>

      {/* Row 2: Pie Chart & Orders Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <PieIcon className="text-emerald-500" />
              Doanh thu theo danh mục
            </h3>

            {/* Dropdown selects month */}
            {availableMonths.length > 0 && (
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#375F97] focus:border-[#375F97] cursor-pointer"
                >
                  {availableMonths.map((m) => {
                    const parts = m.split("-");
                    return (
                      <option key={m} value={m}>
                        Tháng {parts[1]}/{parts[0]}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {pieData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4 flex-1">
              {/* Custom SVG / Gradient Pie Graphic */}
              <div className="relative w-44 h-44 rounded-full shadow-md flex items-center justify-center shrink-0 border border-slate-100 group transition-transform duration-500 hover:scale-[1.03]">
                {/* Dynamic conic gradient */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{ background: getConicGradientStyle() }}
                />
                {/* Center cutout for donut style */}
                <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center z-10 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tổng cộng
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {formatCurrency(
                      pieData.reduce((acc, slice) => acc + slice.value, 0),
                    )}
                  </span>
                </div>
              </div>

              {/* Pie Legends list */}
              <div className="space-y-3 flex-1 w-full">
                {pieData.map((slice) => (
                  <div
                    key={slice.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="font-bold text-slate-700 truncate">
                        {slice.category}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-slate-900 block">
                        {formatCurrency(slice.value)}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold block">
                        {slice.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center flex-1">
              <Calendar size={36} className="text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">
                Không có dữ liệu bán hàng trong tháng này
              </p>
            </div>
          )}
        </div>

        {/* Orders Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <ShoppingCart className="text-orange-500" />
            Tình trạng đơn hàng của bạn
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
              Bạn chưa bán đơn hàng nào
            </p>
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
