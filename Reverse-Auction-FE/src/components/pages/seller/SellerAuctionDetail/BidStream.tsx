import type { Bid } from "@/types/auction";
import { formatCurrency, formatTimeAgo } from "@/utils/time";
import { Trophy } from "lucide-react";

export default function BidStream({
  bids,
  myId = -1,
}: {
  bids: Bid[];
  myId?: number;
}) {
  const sorted = [...bids].sort((a, b) => a.bidPrice - b.bidPrice);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-black text-slate-900 text-sm">Luồng báo giá</h3>
        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {bids.length} nhà bán hàng online
        </span>
      </div>
      <div className="divide-y divide-slate-50 max-h-[340px] overflow-y-auto">
        {sorted.map((bid) => {
          const isMe = bid.sellerId === myId;
          const isWinner = bid.isWinner === true;
          return (
            <div
              key={bid.id}
              className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                isWinner
                  ? "bg-emerald-50 border-l-4 border-emerald-400"
                  : isMe
                    ? "bg-blue-50/60"
                    : "hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                  isWinner
                    ? "bg-emerald-500 text-white"
                    : isMe
                      ? "bg-[#375F97] text-white"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {isWinner ? (
                  <Trophy className="w-4 h-4" />
                ) : (
                  bid.sellerName.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p
                      className={`text-sm font-bold truncate ${
                        isWinner
                          ? "text-emerald-700"
                          : isMe
                            ? "text-[#375F97]"
                            : "text-slate-900"
                      }`}
                    >
                      {isMe ? "Bạn" : bid.sellerName}
                    </p>
                    {isWinner && (
                      <span className="shrink-0 text-[10px] font-black text-white bg-emerald-500 px-2 py-0.5 rounded-full">
                        🏆 Người thắng
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTimeAgo(bid.updatedAt)}
                  </span>
                </div>
                <p className={`text-base font-black ${isWinner ? "text-emerald-800" : "text-slate-900"}`}>
                  {formatCurrency(bid.bidPrice)}
                </p>
                {bid.note && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {bid.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
