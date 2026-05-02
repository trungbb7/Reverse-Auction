import type { Auction } from "@/types/auction";
import { Package, Tag } from "lucide-react";
import { Link } from "react-router";

interface UserAuctionCardProps {
  auction: Auction;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function UserAuctionCard({ auction }: UserAuctionCardProps) {
  return (
    <div
      key={auction.id}
      className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col h-full group"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>

        {auction.status === "OPEN" ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-wide">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            LIVE
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold tracking-wide">
            {auction.status === "COMPLETED" ? "HOÀN THÀNH" : "ĐÃ HỦY"}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {auction.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> {auction.categoryName}
          </span>
          <span>
            SL:{" "}
            <strong className="text-slate-700">{auction.quantity || 1}</strong>
          </span>
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">
            Số lượng chào giá
          </span>
          <span className="text-xl font-black text-slate-800">
            {auction.totalBids || 0}
          </span>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">
            Giá tốt nhất
          </span>
          <span className="text-lg font-black text-green-600">
            {auction.lowestPrice ? formatCurrency(auction.lowestPrice) : "---"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <Link
        to={`/auctions/${auction.id}`}
        className="w-full block text-center py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-2xl transition-colors"
      >
        Xem chi tiết
      </Link>
    </div>
  );
}
