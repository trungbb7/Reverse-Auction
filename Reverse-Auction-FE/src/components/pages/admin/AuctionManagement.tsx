import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { bidService } from "@/services/bidService";
import {
  Search,
  Calendar,
  Tag,
  User,
  DollarSign,
  Package,
  X,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/context/ConfirmContext";


export default function AuctionManagement() {
  const { confirm } = useConfirm();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // States for detailed view modal
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(
    null,
  );
  const [selectedAuction, setSelectedAuction] = useState<any | null>(null);
  const [selectedAuctionBids, setSelectedAuctionBids] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchAuctions = useCallback(async () => {
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
  }, [page]);

  const handleViewDetail = async (id: number) => {
    setSelectedAuctionId(id);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const [detail, bidsData] = await Promise.all([
        adminService.getAuctionDetail(id),
        bidService.getBidsForAuction(id),
      ]);
      setSelectedAuction(detail);
      setSelectedAuctionBids(bidsData);
    } catch (error) {
      console.error("Failed to fetch auction detail or bids", error);
      toast.error("Không thể tải chi tiết phiên đấu giá");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelAuction = async (auctionId: number) => {
    const isConfirmed = await confirm({
      title: "Hủy phiên đấu giá",
      message: "Bạn có chắc chắn muốn HỦY phiên đấu giá này không? Thao tác này sẽ dừng phiên đấu giá ngay lập tức và không thể khôi phục.",
      type: "danger",
      confirmText: "Hủy phiên đấu",
      cancelText: "Hủy bỏ",
    });

    if (!isConfirmed) return;
    try {
      await adminService.cancelAuction(auctionId);
      toast.success("Đã hủy phiên đấu giá thành công!");

      // Refresh details
      const detail = await adminService.getAuctionDetail(auctionId);
      setSelectedAuction(detail);

      // Refresh list
      fetchAuctions();
    } catch (error) {
      console.error("Failed to cancel auction", error);
      toast.error("Không thể hủy phiên đấu giá. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const filteredAuctions = auctions.filter(
    (auction) =>
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý phiên đấu giá
          </h1>
          <p className="text-slate-500">
            Giám sát và quản lý tất cả các yêu cầu đấu giá trong hệ thống
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
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
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAuctions.map((auction) => (
                <tr
                  key={auction.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">
                        {auction.title}
                      </div>
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
                        Min Bid:{" "}
                        {auction.lowestPrice
                          ? formatCurrency(auction.lowestPrice)
                          : "Chưa có thầu"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Tổng số thầu: {auction.totalBids}
                      </div>
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
                        auction.status,
                      )}`}
                    >
                      {auction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewDetail(auction.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAuctions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500"
                  >
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

      {/* Modal chi tiết đấu giá */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {selectedAuction ? selectedAuction.title : "Đang tải..."}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mã phiên đấu giá: #{selectedAuctionId}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedAuction(null);
                  setSelectedAuctionBids([]);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                  <p className="text-sm text-slate-500 font-medium">
                    Đang tải dữ liệu...
                  </p>
                </div>
              ) : selectedAuction ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột trái: Thông tin đấu giá */}
                  <div className="space-y-5">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Thông tin chi tiết
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Người tạo
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {selectedAuction.buyerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Danh mục
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {selectedAuction.categoryName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Số lượng
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {selectedAuction.quantity} chiếc
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Trạng thái
                          </p>
                          <span
                            className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(
                              selectedAuction.status,
                            )}`}
                          >
                            {selectedAuction.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Ngân sách tối đa
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {formatCurrency(selectedAuction.budgetMax)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Thời hạn kết thúc
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {new Date(selectedAuction.endDate).toLocaleString(
                              "vi-VN",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Mô tả chi tiết
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                        {selectedAuction.description ||
                          "Không có mô tả chi tiết."}
                      </p>
                    </div>

                    {/* Hình ảnh tham khảo */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Hình ảnh tham khảo
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAuction.imageUrls &&
                        selectedAuction.imageUrls.length > 0 ? (
                          selectedAuction.imageUrls.map(
                            (url: string, index: number) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 hover:border-primary-400 transition-colors"
                              >
                                <img
                                  src={url}
                                  alt={`ref-${index}`}
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            ),
                          )
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Không có hình ảnh tham khảo.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Đề xuất thầu & Hành động */}
                  <div className="space-y-5 flex flex-col justify-between">
                    <div className="space-y-4 flex-1">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Danh sách thầu ({selectedAuctionBids.length})
                      </h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {selectedAuctionBids.length > 0 ? (
                          selectedAuctionBids.map((bid: any) => (
                            <div
                              key={bid.id}
                              className={`p-3 rounded-xl border transition-all ${bid.isWinner ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200"}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xs font-black text-slate-800">
                                    {bid.sellerName}
                                  </p>
                                  {bid.note && (
                                    <p className="text-[11px] text-slate-500 mt-1 italic">
                                      "{bid.note}"
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-slate-900">
                                    {formatCurrency(bid.bidPrice)}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {new Date(bid.createdAt).toLocaleDateString(
                                      "vi-VN",
                                    )}
                                  </p>
                                </div>
                              </div>
                              {bid.isWinner && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100/50 px-2 py-0.5 rounded-md w-max">
                                  <CheckCircle2 size={10} /> Đã trúng thầu
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100">
                            Chưa có đề xuất thầu nào được gửi.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nút hủy phiên đấu giá */}
                    {(selectedAuction.status === "OPEN" ||
                      selectedAuction.status === "CLOSED") && (
                      <div className="pt-4 border-t border-slate-100">
                        <button
                          onClick={() =>
                            handleCancelAuction(selectedAuction.id)
                          }
                          className="w-full py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-98"
                        >
                          <ShieldAlert size={16} /> Hủy phiên đấu giá này
                          (Admin)
                        </button>
                        <p className="text-[10px] text-red-500 text-center mt-1.5 font-medium">
                          * Lưu ý: Thao tác này sẽ hủy vĩnh viễn phiên đấu giá.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedAuction(null);
                  setSelectedAuctionBids([]);
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
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
