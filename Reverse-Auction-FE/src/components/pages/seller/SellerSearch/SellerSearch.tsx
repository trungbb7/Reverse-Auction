import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { Auction } from "@/types/auction";
import { auctionService } from "@/services/auctionService";
import AuctionSearchCard from "./AuctionSearchCard";
import AutoBidCard from "./AutoBidCard";
import toast from "react-hot-toast";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_AUCTIONS: Auction[] = [
  {
    id: 1,
    title: "Cung cấp 15x RTX 4070 Super cho Cyber Game",
    categoryName: "GPU / GAMING",
    budgetMax: 250_000_000,
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    description:
      "Yêu cầu hàng chính hãng, bảo hành 36 tháng, giao hàng trong vòng 48 giờ tại HCM. Ưu tiên đối tác đã cung cấp hàng loạt trước đây.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    lowestBid: 230_000_000,
    totalBids: 6,
    quantity: 15,
  },
  {
    id: 2,
    title: "64GB RAM DDR5 ECC cho hệ thống Workstation",
    categoryName: "RAM / SERVER",
    budgetMax: 120_000_000,
    endDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    description:
      "Số lượng 20 thanh, ưu tiên các hãng Samsung hoặc Micron. Yêu cầu ECC, tốc độ 4800MHz trở lên.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
    lowestBid: 105_000_000,
    totalBids: 9,
    quantity: 20,
  },
  {
    id: 3,
    title: "Dự án nâng cấp 50 CPU Intel Core i7-14700K",
    categoryName: "CPU / BUILD PC",
    budgetMax: 450_000_000,
    endDate: new Date(Date.now() + 2 * 86400_000).toISOString(),
    description:
      "Cần báo giá tốt nhất cho lô hàng 50 chiếc i7 thế hệ 14. Giao hàng tại Hà Nội. Bảo hành 12 tháng chính hãng.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
    lowestBid: 420_000_000,
    totalBids: 3,
    quantity: 50,
  },
  {
    id: 4,
    title: "Lô 100 ổ cứng SSD Samsung 980 Pro 1TB",
    categoryName: "STORAGE / SSD",
    budgetMax: 180_000_000,
    endDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    description:
      "Đấu giá cung cấp linh kiện cho dự án lắp ráp laptop văn phòng cao cấp. Yêu cầu hàng nguyên seal, có hoá đơn VAT.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600_000 * 3).toISOString(),
    lowestBid: 165_000_000,
    totalBids: 11,
    quantity: 100,
  },
  {
    id: 5,
    title: "Cung cấp trọn bộ 30 bộ máy tính văn phòng",
    categoryName: "COMBO / PC SET",
    budgetMax: 300_000_000,
    endDate: new Date(Date.now() + 4 * 86400_000).toISOString(),
    description:
      "Combo bao gồm Mainboard, CPU, RAM, SSD và Case. Không bao gồm màn hình. Giao tại Đà Nẵng.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
    lowestBid: 270_000_000,
    totalBids: 7,
    quantity: 30,
  },
];

interface Item {
  value: string;
  display: string;
}

const CATEGORIES: Item[] = [
  { value: "", display: "Tất cả linh kiện" },
  { value: "CPU", display: "CPU" },
  { value: "VGA", display: "VGA" },
  { value: "RAM", display: "RAM" },
  { value: "Ổ cứng", display: "Ổ cứng" },
  { value: "Mainboard", display: "Mainboard" },
  { value: "Nguồn", display: "Nguồn" },
  { value: "Khác", display: "Khác" },
];

const STATUS_OPTIONS: Item[] = [
  { value: "", display: "Tất cả" },
  { value: "OPEN", display: "Đang diễn ra" },
  { value: "CLOSED", display: "Đã đóng" },
  { value: "COMPLETED", display: "Hoàn thành" },
];

export default function SellerSearch() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Item>(CATEGORIES[0]);
  const [selectedStatus, setSelectedStatus] = useState<Item>(STATUS_OPTIONS[0]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 500]);
  const [auctions, setAuctions] = useState<Auction[]>(MOCK_AUCTIONS);
  const [totalResults, setTotalResults] = useState(MOCK_AUCTIONS.length);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    async function search() {
      try {
        const params = {
          keyword: keyword || undefined,
          status: selectedStatus.value || undefined,
          categoryName: selectedCategory.value || undefined,
          minBudget: budgetRange[0] * 1_000_000,
          maxBudget:
            budgetRange[1] === 500 ? undefined : budgetRange[1] * 1_000_000,
          page: currentPage - 1,
          size: 6,
        };
        const result = await auctionService.searchAuctions(params);
        setAuctions(result.content.length > 0 ? result.content : MOCK_AUCTIONS);
        setTotalResults(result.totalElements || MOCK_AUCTIONS.length);
      } catch {
        toast.error("Đã xảy ra lỗi khi lấy dữ liệu!");
        setAuctions([]);
        setTotalResults(0);
      }
    }
    search();
  }, [currentPage, keyword, selectedCategory, budgetRange, selectedStatus]);

  const handleViewBid = (id: number) => {
    navigate(`/seller/auctions/${id}`);
  };

  // Displayed grid: 5 auction cards + 1 auto-bid card in position 6
  const displayedAuctions = auctions.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Kết quả tìm kiếm
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Tìm thấy{" "}
              <span className="font-bold text-slate-700">{totalResults}</span>{" "}
              yêu cầu phù hợp với tiêu chí của bạn.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="seller-search-input"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm linh kiện hoặc cửa hàng uy tín..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                showFilters
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Lọc
            </button>
          </div>
        </div>

        {/* ── Filter Panel ───────────────────────────────────────────── */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
            {/* Budget slider */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Ngân sách (triệu đồng)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium w-8">
                  {budgetRange[0]}tr
                </span>
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={budgetRange[1]}
                  onChange={(e) =>
                    setBudgetRange([budgetRange[0], Number(e.target.value)])
                  }
                  className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-slate-500 font-medium w-10">
                  {budgetRange[1] >= 500 ? "50tr+" : `${budgetRange[1]}tr`}
                </span>
              </div>
            </div>

            {/* Category dropdown */}
            <div className="relative">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Danh mục
              </label>
              <button
                id="category-dropdown"
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-all"
              >
                <span className="font-medium">{selectedCategory.display}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                />
              </button>
              {categoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedCategory === cat
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {cat.display}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status dropdown */}
            <div className="relative">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Trạng thái
              </label>
              <button
                id="status-dropdown"
                onClick={() => setStatusOpen(!statusOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-all"
              >
                <span className="font-medium">{selectedStatus.display}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${statusOpen ? "rotate-180" : ""}`}
                />
              </button>
              {statusOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        setSelectedStatus(s);
                        setStatusOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedStatus === s
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {s.display}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedAuctions.map((auction) => (
          <AuctionSearchCard
            key={auction.id}
            auction={auction}
            onViewBid={handleViewBid}
          />
        ))}
        {/* Auto-bid CTA Card in last slot */}
        <AutoBidCard />
      </div>

      {/* ── Pagination ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 mt-10">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {[1, 2, 3].map((p) => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
              currentPage === p
                ? "bg-[#375F97] text-white shadow-md"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}

        <span className="text-slate-400 text-sm font-medium px-1">...</span>

        <button
          onClick={() => setCurrentPage(totalPages)}
          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
            currentPage === totalPages
              ? "bg-[#375F97] text-white shadow-md"
              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {totalPages}
        </button>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
