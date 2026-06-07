import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { formatCurrency, formatTimeAgo } from "@/utils/time";
import Pagination from "@/components/ui/Pagination";
import type { Order } from "@/types/orders";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Percent,
  ShoppingCart,
  DollarSign,
  PieChart as PieIcon,
  Search,
  CheckCircle,
  Tag,
  Settings,
  XCircle,
  AlertCircle,
  Activity,
  Edit2,
  Check,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalAuctions: number;
  totalRevenue: number;
  revenueByDay: Record<string, number>;
  revenueByMonth: Record<string, number>;
  revenueByYear: Record<string, number>;
  revenueByCategory: Record<string, number>;
  ordersByStatus: Record<string, number>;
}

export default function AdminRevenue() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState<number>(10);

  const [timeOption, setTimeOption] = useState<"day" | "month" | "year">(
    "month",
  );
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsData = await adminService.getAdminStats();
        setStats(statsData);

        const ordersData = await adminService.getAllOrders();
        setOrders(ordersData);

        const rate = await adminService.getCommissionRate();
        setCommissionRate(rate);
        setTempRate(rate);
      } catch (error) {
        console.error("Failed to load admin revenue details", error);
        toast.error("Không thể tải thông tin doanh thu sàn");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateCommissionRate = async () => {
    if (tempRate < 0 || tempRate > 100) {
      toast.error("Tỷ lệ hoa hồng phải nằm trong khoảng từ 0% đến 100%");
      return;
    }
    try {
      const updatedRate = await adminService.updateCommissionRate(tempRate);
      setCommissionRate(updatedRate);
      setIsEditingRate(false);
      toast.success(
        `Cập nhật tỷ lệ hoa hồng thành ${updatedRate}% thành công!`,
      );
    } catch (error) {
      console.error("Failed to update commission rate", error);
      toast.error("Không thể cập nhật tỷ lệ hoa hồng");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#375F97]"></div>
      </div>
    );
  }

  // Visual Palette
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

    let sortedKeys = Object.keys(rawData).sort();

    // Limit days to last 15
    if (timeOption === "day" && sortedKeys.length > 15) {
      sortedKeys = sortedKeys.slice(sortedKeys.length - 15);
    }

    return sortedKeys.map((key) => {
      let displayLabel = key;
      if (timeOption === "day") {
        const parts = key.split("-");
        if (parts.length === 3) {
          displayLabel = `${parts[2]}/${parts[1]}`;
        }
      } else if (timeOption === "month") {
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

  // Helper: Prepare pie chart category data
  const getPieChartData = () => {
    if (!stats || !stats.revenueByCategory) return [];
    const monthlyCategoryData = stats.revenueByCategory || {};

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

  const getConicGradientStyle = () => {
    if (pieData.length === 0) return "conic-gradient(#cbd5e1 0% 100%)";
    const slices = pieData.map(
      (slice) =>
        `${slice.color} ${slice.start.toFixed(2)}% ${slice.end.toFixed(2)}%`,
    );
    return `conic-gradient(${slices.join(", ")})`;
  };

  // Filter & Paginate Orders Table
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === "COMPLETED";
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalCommissionRevenue = stats?.totalRevenue || 0;
  const totalOrdersCount = stats?.totalOrders || 0;
  const completedOrdersCount = stats?.ordersByStatus?.COMPLETED || 0;

  const getOrderStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 w-fit">
            <CheckCircle size={12} /> Hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1 w-fit">
            <XCircle size={12} /> Đã hủy
          </span>
        );
      case "AWAITING_PAYMENT":
      case "PROCESSING":
      case "PAID":
      case "SHIPPED":
      case "DELIVERED":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1 w-fit">
            <Activity size={12} /> Đang xử lý
          </span>
        );
      case "DISPUTED":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-150 flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> Khiếu nại
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Doanh thu hoa hồng sàn
        </h1>
        <p className="text-slate-500 mt-1">
          Theo dõi tổng doanh số dịch vụ từ chiết khấu sàn, quản lý phí giao
          dịch và các giao dịch.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Admin Commission Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Doanh thu sàn thu được
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {formatCurrency(totalCommissionRevenue)}
            </p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Current Floor Commission Rate Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2 w-full pr-2">
            <p className="text-sm font-semibold text-slate-500">
              Tỷ lệ phí chiết khấu sàn
            </p>
            {isEditingRate ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={tempRate}
                  onChange={(e) => setTempRate(Number(e.target.value))}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-[#375F97]"
                  min="0"
                  max="100"
                />
                <span className="text-sm font-bold text-slate-700">%</span>
                <button
                  onClick={handleUpdateCommissionRate}
                  className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setTempRate(commissionRate);
                    setIsEditingRate(false);
                  }}
                  className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-350"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-3xl font-black text-slate-800">
                  {commissionRate}%
                </p>
                <button
                  onClick={() => setIsEditingRate(true)}
                  className="p-1 text-slate-400 hover:text-[#375F97] hover:bg-slate-50 rounded"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="p-4 bg-blue-50 text-[#375F97] rounded-xl group-hover:bg-[#375F97] group-hover:text-white transition-all">
            <Percent size={24} />
          </div>
        </div>

        {/* Total Orders count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Tổng số đơn hàng
            </p>
            <p className="text-3xl font-black text-slate-800">
              {totalOrdersCount}
            </p>
          </div>
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Completed count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">
              Số đơn hoàn tất
            </p>
            <p className="text-3xl font-black text-slate-800">
              {completedOrdersCount}{" "}
              <span className="text-sm font-normal text-slate-400">
                (
                {totalOrdersCount > 0
                  ? ((completedOrdersCount / totalOrdersCount) * 100).toFixed(0)
                  : 0}
                % tỉ lệ)
              </span>
            </p>
          </div>
          <div className="p-4 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Row 1: Columns Bar Chart for Revenue Over Time */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <TrendingUp className="text-[#375F97]" />
            Doanh số hoa hồng theo thời gian
          </h3>
          {/* Time Selector Selector */}
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
            <div className="relative h-64 flex items-end justify-between px-2 pt-8 border-b border-slate-200">
              {/* Background Grid Lines */}
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
                      className={`absolute -top-12 bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-35 transition-all duration-200 ${
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

      {/* Row 2: Category breakdown (Pie Chart) & Commission Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category breakdown (Pie Chart) - Takes 2 cols */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-slate-100 pb-4">
            <PieIcon className="text-emerald-500" />
            Cơ cấu doanh thu theo danh mục sản phẩm
          </h3>

          {pieData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-4 flex-1">
              {/* Donut circle */}
              <div className="relative w-48 h-48 rounded-full shadow-md flex items-center justify-center shrink-0 border border-slate-100 group transition-transform duration-500 hover:scale-[1.03]">
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{ background: getConicGradientStyle() }}
                />
                <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center z-10 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tổng doanh thu
                  </span>
                  <span className="text-base font-extrabold text-slate-800">
                    {formatCurrency(
                      pieData.reduce((acc, slice) => acc + slice.value, 0),
                    )}
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                {pieData.map((slice) => (
                  <div
                    key={slice.category}
                    className="flex items-center justify-between text-sm border-b border-slate-50 pb-2"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
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
              <Tag size={36} className="text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">
                Không có dữ liệu phân loại danh mục
              </p>
            </div>
          )}
        </div>

        {/* Commission settings overview info card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-slate-100 pb-4">
            <Settings className="text-slate-500 animate-spin-slow" />
            Cấu hình phí dịch vụ
          </h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Thuật toán tính phí:</span>
                <span className="text-[#375F97]">Đơn hàng hoàn tất</span>
              </div>
              <div className="text-xs space-y-1">
                <span className="block text-slate-400">
                  Công thức thu nhập sàn:
                </span>
                <span className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded block">
                  CommissionAmount = TotalAmount * CommissionRate / 100
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              * Thay đổi tỷ lệ phí sẽ chỉ áp dụng cho các đơn hàng mới được tạo
              sau khi cập nhật cấu hình. Các đơn hàng cũ vẫn giữ nguyên tỷ lệ
              cũ.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Transactions details list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter / Search tools */}
        <div className="p-6 border-b border-slate-150 space-y-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="font-bold text-slate-800 text-lg">
              Chi tiết giao dịch phát sinh doanh thu
            </h3>
            {/* Search filter input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#375F97] focus:border-[#375F97]"
                />
                <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
              </div>
              {/* Type toggle */}
              <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 shrink-0">
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === "ALL"
                      ? "bg-[#375F97] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Tất cả đơn
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("COMPLETED");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === "COMPLETED"
                      ? "bg-[#375F97] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Có doanh thu
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Mã đơn hàng</th>
                  <th className="py-4 px-6">Khách mua / Cửa hàng</th>
                  <th className="py-4 px-6 text-right">Tổng giá trị</th>
                  <th className="py-4 px-6 text-center">Phí sàn (%)</th>
                  <th className="py-4 px-6 text-right">Thu nhập sàn</th>
                  <th className="py-4 px-6">Ngày tạo</th>
                  <th className="py-4 px-6">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700">
                {paginatedOrders.map((order) => {
                  const rate =
                    order.commissionRate !== undefined
                      ? order.commissionRate
                      : 10;
                  const revenue =
                    order.commissionAmount !== undefined
                      ? order.commissionAmount
                      : order.status === "COMPLETED"
                        ? (order.totalAmount * rate) / 100
                        : 0;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {order.code}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-slate-800">
                            Mua:{" "}
                            <span className="font-normal text-slate-500">
                              {order.buyerName}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800">
                            Bán:{" "}
                            <span className="font-normal text-slate-500">
                              {order.sellerName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-500">
                        {rate}%
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-extrabold ${revenue > 0 ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {revenue > 0
                          ? `+${formatCurrency(revenue)}`
                          : formatCurrency(0)}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">
                        {formatTimeAgo(order.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        {getOrderStatusBadge(order.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-3">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
              <ShoppingCart size={40} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">
                Không tìm thấy giao dịch nào
              </h4>
              <p className="text-slate-500 text-xs">
                Không tìm thấy giao dịch khớp với điều kiện tìm kiếm hoặc bộ lọc
                hiện tại.
              </p>
            </div>
          </div>
        )}

        {/* Pagination control */}
        {!loading && totalPages > 1 && (
          <div className="py-6 border-t border-slate-150">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
