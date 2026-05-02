import { formatCurrency, formatTimeAgo } from "@/utils/time";
import SellerAvatar from "./SellerAvatar";
import { Crown } from "lucide-react";
import type { Bid } from "@/types/auction";

interface BidCardProps {
  bid: Bid;
  onSelectWinner: (id: number) => void;
  winnerSelected: boolean;
  canSelectWinner: boolean;
}

export default function BidCard({
  bid,
  onSelectWinner,
  winnerSelected,
  canSelectWinner,
}: BidCardProps) {
  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        bid.isWinner
          ? "border-green-400 bg-green-50 shadow-md"
          : bid.isTopBid
            ? "border-blue-200 bg-blue-50/50"
            : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      {/* Seller row */}
      <div className="flex items-center gap-3 mb-2">
        <SellerAvatar name={bid.sellerName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm truncate">
              {bid.sellerName}
            </span>
            {bid.isWinner && (
              <span className="text-[10px] font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                THẮNG CUỘC
              </span>
            )}
            {bid.isTopBid && !bid.isWinner && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> TOP BID
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {formatTimeAgo(bid.updatedAt)}
          </span>
        </div>
        <span className="font-black text-lg text-slate-900 shrink-0">
          {formatCurrency(bid.bidPrice)}
        </span>
      </div>

      {/* Note */}
      {bid.note && (
        <p className="text-xs text-slate-500 italic mb-3 pl-[52px] leading-relaxed">
          "{bid.note}"
        </p>
      )}

      {/* Select winner button */}
      {canSelectWinner && !bid.isWinner && (
        <button
          onClick={() => onSelectWinner(bid.id)}
          disabled={winnerSelected}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all mt-2 ${
            bid.isTopBid && !winnerSelected
              ? "bg-[#375F97] hover:bg-[#2d4f80] text-white shadow-sm hover:shadow-md"
              : "bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          Chọn người thắng
        </button>
      )}
    </div>
  );
}
