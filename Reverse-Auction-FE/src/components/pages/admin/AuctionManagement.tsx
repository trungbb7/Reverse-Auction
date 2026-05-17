import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Search, Calendar, Tag, User, DollarSign, Package } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AuctionManagement() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAuctions = async () => {
    try {
      const data = await adminService.getAllAuctions(page, 10);
      setAuctions(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch auctions", error);
      toast.error("Không thể tải danh sách phiên đấu giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [page]);

  const filteredAuctions = auctions.filter(
    (auction) =>
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CLOSED":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-slate-800">Quản lý phiên đấu giá</h1>
          <p className="text-slate-500">Giám sát và quản lý tất cả các yêu cầu đấu giá trong hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, người mua hoặc danh mục..."
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
                <th className="px-6 py-4">Thông tin đấu giá</th>
                <th className="px-6 py-4">Người mua</th>
                <th className="px-6 py-4">Ngân sách & Giá thấp nhất</th>
                <th className="px-6 py-4">Thời hạn</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAuctions.map((auction) => (
                <tr key={auction.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">{auction.title}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Tag size={12} />
                        {auction.categoryName}
                        <span className="mx-1">•</span>
                        <Package size={12} />
                        Số lượng: {auction.quantity}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User size={14} className="text-slate-400" />
                      {auction.buyerName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <DollarSign size={14} className="text-slate-400" />
                        Max: {formatCurrency(auction.budgetMax)}
                      </div>
                      <div className="text-xs text-emerald-600 font-medium">
                        Min Bid: {auction.lowestPrice ? formatCurrency(auction.lowestPrice) : "Chưa có thầu"}
                      </div>
                      <div className="text-[10px] text-slate-400">Tổng số thầu: {auction.totalBids}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(auction.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(
                        auction.status
                      )}`}
                    >
                      {auction.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAuctions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Không tìm thấy phiên đấu giá nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-all"
            >
              Trang trước
            </button>
            <span className="text-sm text-slate-500">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-all"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
