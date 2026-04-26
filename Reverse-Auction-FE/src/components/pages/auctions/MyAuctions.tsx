import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Tag, Package } from "lucide-react";
import type { Auction } from "../../../types/auction";

// Mock Data
const MOCK_AUCTIONS: Auction[] = [
  {
    id: "1",
    title: "Cần mua RTX 3060 12GB hoặc RX 6600XT",
    category: "VGA",
    maxBudget: 6000000,
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    description: "Cần hàng 2nd, còn bảo hành ít nhất 3 tháng.",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lowestBid: 5500000,
    totalBids: 4,
    specifications: { quantity: "1" },
  },
  {
    id: "2",
    title: "Tìm kit RAM 32GB (2x16GB) DDR4 3200MHz",
    category: "RAM",
    maxBudget: 1500000,
    endDate: new Date(Date.now() + 3600000 * 5).toISOString(),
    description: "Cần kit RAM Corsair Vengeance hoặc Kingston Fury.",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lowestBid: 1400000,
    totalBids: 8,
    specifications: { quantity: "2" },
  },
  {
    id: "3",
    title: "Build nguyên bộ PC học tập + chơi LMHT",
    category: "PC Build",
    maxBudget: 10000000,
    endDate: new Date(Date.now() - 86400000).toISOString(),
    description: "Cần build 1 bộ PC đủ màn hình để học online.",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lowestBid: 9500000,
    totalBids: 12,
    specifications: { quantity: "1" },
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const MyAuctions = () => {
  const [filter, setFilter] = useState("ALL");

  const filteredAuctions = MOCK_AUCTIONS.filter((auction) =>
    filter === "ALL" ? true : auction.status === filter,
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 relative min-h-[80vh]">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Đấu giá của tôi</h1>
          <p className="text-slate-500 mt-1">
            Quản lý và theo dõi các yêu cầu mua linh kiện của bạn.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filter Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex items-center shrink-0">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === "ALL" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === "ACTIVE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Đang diễn ra
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((auction) => (
          <div
            key={auction.id}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col h-full group"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>

              {auction.status === "ACTIVE" ? (
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
                  <Tag className="w-3.5 h-3.5" /> {auction.category}
                </span>
                <span>
                  SL:{" "}
                  <strong className="text-slate-700">
                    {auction.specifications?.quantity || 1}
                  </strong>
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
                  {auction.lowestBid
                    ? formatCurrency(auction.lowestBid)
                    : "---"}
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
        ))}
      </div>

      {/* Floating Action Button (FAB) */}
      <Link
        to="/create-auction"
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgb(59,130,246,0.4)] flex items-center justify-center hover:-translate-y-1 transition-all group z-40"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </Link>
    </div>
  );
};

export default MyAuctions;
