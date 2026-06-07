import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import type { Order } from "@/types/orders";
import { ORDER_STATUS_LABEL, orderStatusContent } from "@/types/orders";
import {
  Search,
  Eye,
  Filter,
  Calendar,
  DollarSign,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/utils/time";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const completedAmount = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingAmount = orders
    .filter(
      (o) =>
        o.status === "AWAITING_PAYMENT" ||
        o.status === "PAID" ||
        o.status === "PROCESSING" ||
        o.status === "SHIPPED" ||
        o.status === "DELIVERED",
    )
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý đơn hàng
          </h1>
          <p className="text-slate-500">
            Xem và giám sát tất cả hoạt động giao dịch trên sàn
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 rounded-lg font-medium transition-all shadow-sm"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Filter size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-slate-800">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Doanh thu hoàn tất</p>
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(completedAmount)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Đơn hàng đang xử lý</p>
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(pendingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm mã đơn, người mua, người bán..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-slate-500 whitespace-nowrap">
            Trạng thái:
          </span>
          <select
            className="w-full md:w-48 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Người mua</th>
                  <th className="px-6 py-4">Người bán</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredOrders.map((order) => {
                  const content = orderStatusContent[order.status] || {
                    title: order.status,
                    icon: Calendar,
                    color: "text-slate-500",
                  };
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        {order.code || `#${order.id}`}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="max-w-[200px] truncate font-medium text-slate-900"
                          title={order.productName}
                        >
                          {order.productName || "Đơn hàng đấu giá"}
                        </div>
                        <div className="text-xs text-slate-400 capitalize">
                          {order.type.toLowerCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {order.buyerName}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {order.sellerName}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 ${content.color}`}
                        >
                          <content.icon size={12} />
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Không tìm thấy đơn hàng nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Chi tiết đơn hàng:{" "}
                  {selectedOrder.code || `#${selectedOrder.id}`}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ngày tạo:{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
              {/* Product Info */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-4">
                {selectedOrder.imageUrl && (
                  <img
                    src={selectedOrder.imageUrl}
                    alt={selectedOrder.productName}
                    className="w-16 h-16 rounded-lg object-cover border bg-white"
                  />
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedOrder.productName || "Giao dịch từ đấu giá"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hãng sản xuất: {selectedOrder.brand || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Loại hình:{" "}
                    <span className="font-semibold text-primary-600 uppercase">
                      {selectedOrder.type}
                    </span>
                  </p>
                  {selectedOrder.auctionTitle && (
                    <p className="text-xs text-slate-500 mt-1">
                      Phiên đấu giá gốc:{" "}
                      <span className="font-semibold">
                        {selectedOrder.auctionTitle}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Transactions Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-4 border border-slate-100 rounded-lg">
                  <h4 className="font-bold text-slate-900 border-b pb-1.5 text-xs uppercase tracking-wider">
                    Thông tin người mua
                  </h4>
                  <div>
                    <p className="text-xs text-slate-400">Họ và tên</p>
                    <p className="font-medium">{selectedOrder.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Số điện thoại</p>
                    <p className="font-medium">
                      {selectedOrder.buyerPhone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Địa chỉ nhận hàng</p>
                    <p className="font-medium leading-relaxed">
                      {selectedOrder.shippingAddress || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-4 border border-slate-100 rounded-lg">
                  <h4 className="font-bold text-slate-900 border-b pb-1.5 text-xs uppercase tracking-wider">
                    Thông tin người bán
                  </h4>
                  <div>
                    <p className="text-xs text-slate-400">
                      Cửa hàng / Người bán
                    </p>
                    <p className="font-medium">{selectedOrder.sellerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">
                      ID tài khoản người bán
                    </p>
                    <p className="font-mono">#{selectedOrder.sellerId}</p>
                  </div>
                </div>
              </div>

              {/* Prices breakdown */}
              <div className="p-4 border border-slate-100 rounded-lg space-y-2">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 text-xs uppercase tracking-wider mb-2">
                  Chi tiết thanh toán
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá bán sản phẩm:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedOrder.finalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí giao hàng:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedOrder.shippingFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-base text-slate-900">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-primary-700">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
