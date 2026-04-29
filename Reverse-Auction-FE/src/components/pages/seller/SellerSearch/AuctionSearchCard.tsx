import type { Auction } from "@/types/auction";
import { formatCurrency } from "@/utils/time";
import { ChevronRight, Clock, Flame } from "lucide-react";

function getTimeLeft(endDate: string) {
  const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (diff === 0) return { label: "Đã kết thúc", urgent: false };
  if (hours === 0 && minutes <= 30)
    return { label: `${minutes} phút còn lại`, urgent: true };
  if (hours < 24) return { label: `${hours} giờ còn lại`, urgent: false };
  return {
    label: `${Math.floor(diff / 86_400_000)} ngày còn lại`,
    urgent: false,
  };
}

export default function AuctionSearchCard({
  auction,
  onViewBid,
}: {
  auction: Auction;
  onViewBid: (id: number) => void;
}) {
  const timeLeft = getTimeLeft(auction.endDate);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          {auction.categoryName}
        </span>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            timeLeft.urgent
              ? "text-red-600 bg-red-50"
              : "text-slate-500 bg-slate-50"
          }`}
        >
          {timeLeft.urgent ? (
            <Flame className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {timeLeft.label}
        </span>
      </div>

      {/* Card Body */}
      <div className="px-5 pb-4 flex-1 flex flex-col gap-2">
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
          {auction.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 flex-1">
          {auction.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Ngân sách tối đa
        </p>
        <p className="text-xl font-black text-slate-900 mb-4">
          {formatCurrency(auction.budgetMax ?? 0)}
        </p>
        <button
          id={`view-bid-btn-${auction.id}`}
          onClick={() => onViewBid(auction.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
        >
          Xem & Bid
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
