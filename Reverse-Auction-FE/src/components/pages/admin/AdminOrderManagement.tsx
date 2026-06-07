import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Search, Eye, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router";

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
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

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.code && order.code.toLowerCase().includes(searchLower)) ||
      (order.buyerName && order.buyerName.toLowerCase().includes(searchLower)) ||
      (order.sellerName && order.sellerName.toLowerCase().includes(searchLower)) ||
      (order.productName && order.productName.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AWAITING_PAYMENT":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case "PAID":
      case "PROCESSING":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Đang xử lý</span>;
      case "SHIPPED":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">Đang giao</span>;
      case "DELIVERED":
      case "COMPLETED":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      case "DISPUTED":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Đang tranh chấp</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="text-primary-600" /> Quản lý đơn hàng
          </h1>
          <p className="text-slate-500">Giám sát tất cả các giao dịch trên hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm mã đơn, người mua, người bán..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Mã đơn hàng</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Người mua</th>
                <th className="px-6 py-4">Người bán</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                    {order.code || `#${order.id}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {order.imageUrl ? (
                        <img src={order.imageUrl} alt={order.productName} className="w-10 h-10 rounded-md object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-slate-100 border flex items-center justify-center">
                          <ShoppingCart className="text-slate-400" size={16} />
                        </div>
                      )}
                      <div className="font-medium text-slate-900 max-w-[150px] truncate" title={order.productName || order.auctionTitle}>
                        {order.productName || order.auctionTitle || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                    {order.buyerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                    {order.sellerName}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                    {order.totalAmount?.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Không tìm thấy đơn hàng nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
