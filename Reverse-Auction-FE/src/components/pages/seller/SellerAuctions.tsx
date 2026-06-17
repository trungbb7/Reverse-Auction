import { useState, useEffect } from "react";
import { Link } from "react-router";
import { bidService } from "@/services/bidService";
import type { Bid } from "@/types/auction";
import { formatCurrency, formatTimeAgo } from "@/utils/time";
import Pagination from "@/components/ui/Pagination";
import {
  Gavel,
  Calendar,
  Search,
  ArrowRight,
  Tag,
  DollarSign,
} from "lucide-react";

export default function SellerAuctions() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      try {
        const response = await bidService.getSellerBids(currentPage - 1, 10);
        setBids(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Failed to load seller bids", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [currentPage]);

  const getBiddingStatus = (bid: Bid) => {
    if (bid.isWinner) {
      return {
        label: "Thắng thầu",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    const status = bid.auctionStatus;
    if (status === "OPEN") {
      return {
        label: "Đang đấu giá",
        classes: "bg-blue-50 text-[#375F97] border-blue-200",
      };
    } else if (status === "CLOSED" || status === "COMPLETED") {
      return {
        label: "Không trúng thầu",
        classes: "bg-rose-50 text-rose-700 border-rose-200",
      };
    } else if (status === "CANCELLED") {
      return {
        label: "Đã hủy",
        classes: "bg-slate-100 text-slate-600 border-slate-200",
      };
    }

    return {
      label: "Không xác định",
      classes: "bg-slate-50 text-slate-400 border-slate-100",
    };
  };

  const getAuctionStatusBadge = (status?: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-50 text-sky-700 border border-sky-100">
            Đang mở
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200">
            Đã đóng
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-50 text-rose-600 border border-rose-100">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Gavel className="text-[#375F97] w-8 h-8" />
            Lịch sử đấu giá của bạn
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý các lượt báo giá của bạn và theo dõi trạng thái trúng thầu
            các phiên đấu giá ngược.
          </p>
        </div>
        <Link
          to="/seller/search"
          className="inline-flex items-center justify-center gap-2 bg-[#375F97] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#2e507f] transition-all shadow-sm shadow-blue-500/10 hover:shadow-md"
        >
          <Search size={18} />
          Tìm phòng đấu giá mới
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#375F97]"></div>
            <p className="text-slate-400 text-sm">
              Đang tải lịch sử báo giá...
            </p>
          </div>
        ) : bids.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Phòng đấu giá</th>
                  <th className="py-4 px-6">Danh mục / Ngân sách</th>
                  <th className="py-4 px-6">Báo giá của bạn</th>
                  <th className="py-4 px-6">Ngày tham gia</th>
                  <th className="py-4 px-6 text-center">Trạng thái phòng</th>
                  <th className="py-4 px-6 text-center">Kết quả</th>
                  <th className="py-4 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700">
                {bids.map((bid) => {
                  const bidStatus = getBiddingStatus(bid);
                  return (
                    <tr
                      key={bid.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-4 px-6 max-w-xs">
                        <div className="space-y-1">
                          <Link
                            to={`/seller/auctions/${bid.auctionId}`}
                            className="font-bold text-slate-800 hover:text-[#375F97] line-clamp-1 group-hover:underline transition-all"
                          >
                            {bid.auctionTitle || `Đấu giá #${bid.auctionId}`}
                          </Link>
                          {bid.note && (
                            <p className="text-xs text-slate-400 italic line-clamp-1">
                              "{bid.note}"
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            <Tag size={10} />
                            {bid.categoryName || "Chưa phân loại"}
                          </span>
                          <div className="text-sm font-semibold text-slate-500">
                            Tối đa: {formatCurrency(bid.auctionBudget || 0)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-base font-extrabold text-slate-900 flex items-center">
                          <DollarSign
                            size={14}
                            className="text-slate-400 mr-0.5"
                          />
                          {formatCurrency(bid.bidPrice)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {formatTimeAgo(bid.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getAuctionStatusBadge(bid.auctionStatus)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${bidStatus.classes}`}
                        >
                          {bidStatus.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/seller/auctions/${bid.auctionId}`}
                          className="inline-flex items-center gap-1 text-sm font-bold text-[#375F97] hover:text-[#2a4975] transition-all"
                        >
                          Chi tiết
                          <ArrowRight
                            size={14}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
              <Gavel size={40} />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="font-bold text-slate-800 text-lg">
                Chưa có lượt đấu giá nào
              </h3>
              <p className="text-slate-500 text-sm">
                Bạn chưa tham gia đấu giá sản phẩm nào. Hãy tìm kiếm các phòng
                đấu giá phù hợp với nguồn hàng của bạn và đưa ra mức giá thầu
                cạnh tranh nhất!
              </p>
            </div>
            <Link
              to="/seller/search"
              className="inline-flex items-center gap-2 bg-[#375F97] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#2e507f] transition-all shadow-sm"
            >
              Đặt giá thầu đầu tiên
            </Link>
          </div>
        )}

        {/* Pagination */}
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
