import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Clock,
  Users,
  MapPin,
  TrendingDown,
  MoreHorizontal,
  CheckCircle,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import type { Auction, Bid } from "@/types/auction";
import BidCard from "./BidCard";
import { formatCurrency, formatTimeAgo, useCountdown } from "@/utils/time";
import api from "@/utils/axios";
import toast from "react-hot-toast";
import { bidService } from "@/services/bidService";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_AUCTION: Auction & {
  location?: string;
  paymentMethod?: string;
  images?: string[];
} = {
  id: 1,
  title: "RTX 4090 Founders Edition - 24GB GDDR6X",
  description: "Yêu cầu mới 100%, bảo hành chính hãng, giao hàng tại TP.HCM.",
  categoryName: "VGA",
  budgetMax: 215_000_000,
  quantity: 5,
  endDate: new Date(
    Date.now() + 4 * 3600_000 + 22 * 60_000 + 15_000,
  ).toISOString(),
  createdAt: new Date(Date.now() - 86400_000).toISOString(),
  status: "OPEN",
  lowestBid: 40_500_000,
  totalBids: 8,
  location: "Miền Nam",
  paymentMethod: "Chuyển khoản (Cọc 30%)",
  images: [
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
    "https://images.unsplash.com/photo-1562976540-1502c2145851?w=400",
    "https://images.unsplash.com/photo-1555617117-08c4bfc6b010?w=400",
  ],
};

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction>();
  const countdown = useCountdown(auction?.endDate ?? new Date().toISOString());
  const [bids, setBids] = useState<Bid[]>([]);
  const [lowestBid, setLowestBid] = useState<number>(0);
  const [lastOffer, setLastOffer] = useState<string | undefined>();
  const [selectedImages] = useState(MOCK_AUCTION.images ?? []);
  const [mainImage, setMainImage] = useState(selectedImages[0] ?? "");
  const [winner, setWinner] = useState<string | null>(null);

  const handleSelectWinner = (bidId: string) => {
    setWinner(bidId);
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const progressPct = Math.min(100, (bids.length / 20) * 100);

  const extraImagesCount = selectedImages.length - 3;

  useEffect(() => {
    async function fetchAuction() {
      try {
        const { data } = await api.get(`/auctions/${id}`);
        const auc = data as Auction;
        setAuction(auc);
      } catch (err) {
        toast.error("Đã xảy ra lỗi khi lấy dữ liệu phiên đấu giá");
        console.error(err);
      }
    }
    fetchAuction();
  }, [id]);

  useEffect(() => {
    async function fetchBidsForAuction() {
      try {
        const rsBids = await bidService.getBidsForAuction(id || -1);
        const min = rsBids.reduce(
          (prev, cur) => Math.min(prev, cur.bidPrice),
          Infinity,
        );
        const newLastOffer = rsBids.reduce(
          (prev, cur) => (cur.updatedAt > prev ? cur.updatedAt : prev),
          "1970-01-01",
        );
        let newBids = rsBids.map((bid) => ({
          ...bid,
          isTopBid: bid.bidPrice === min,
        }));

        newBids = newBids.sort((a, b) => a.bidPrice - b.bidPrice);

        setBids(newBids);
        setLowestBid(min);
        setLastOffer(newLastOffer);
      } catch (err) {
        toast.error("Đã xảy ra lỗi khi lấy giữ liệu đấu giá");
        console.error(err);
      }
    }
    fetchBidsForAuction();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full" />
            TRỰC TIẾP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Huỷ phiên đấu
          </button>
          <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="flex gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Product card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex gap-5 items-start">
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <img
                  src={mainImage || selectedImages[0]}
                  alt={auction?.title || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black text-slate-900 leading-snug mb-1">
                  {auction?.title || ""}
                </h1>
                <p className="text-sm text-slate-500 mb-3">
                  {auction?.description || ""}
                </p>
                <div className="flex items-center gap-5 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {bids.length || 0} Người bán tham gia
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Khu vực: {"HCM"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements detail */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-5">
              Chi tiết yêu cầu
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Số lượng
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {String(auction?.quantity).padStart(2, "0") || 0} chiếc
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Ngân sách dự kiến
                </p>
                <p className="text-base font-semibold text-slate-900">
                  ~ {formatCurrency(auction?.budgetMax ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Thời hạn giao hàng
                </p>
                <p className="text-base font-semibold text-slate-900">...</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Hình thức thanh toán
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {"Chuyển khoản trước (100%)"}
                </p>
              </div>
            </div>

            {/* Image gallery */}
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Hình ảnh tham khảo
              </p>
              <div className="flex gap-3">
                {selectedImages.slice(0, 3).map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(src)}
                    className={`relative w-44 h-32 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      mainImage === src
                        ? "border-blue-500 shadow-md"
                        : "border-transparent hover:border-slate-200"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`ref-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    {/* +N overlay on last visible */}
                    {idx === 2 && extraImagesCount > 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-black text-xl">
                          +{extraImagesCount}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
                {selectedImages.length === 0 && (
                  <div className="w-44 h-32 rounded-xl bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">
                  Giá thấp nhất hiện tại
                </p>
                <p className="text-xl font-black text-slate-900">
                  {formatCurrency(lowestBid)}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">
                  Lượt đề nghị cuối
                </p>
                <p className="text-xl font-black text-slate-900">
                  {lastOffer ? formatTimeAgo(lastOffer) : "---"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════════════ */}
        <div className="w-[320px] xl:w-[360px] shrink-0 space-y-4">
          {/* Countdown */}
          <div className="bg-[#375F97] rounded-2xl p-6 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3 text-center">
              Thời gian còn lại
            </p>
            <div className="text-center">
              <span className="text-5xl font-black tabular-nums tracking-tight">
                {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1.5 bg-blue-400/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Bid list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">
                Dòng đề nghị
              </h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {bids.length} OFFERS
              </span>
            </div>

            <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
              {bids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  onSelectWinner={handleSelectWinner}
                  winnerSelected={winner !== null}
                />
              ))}
            </div>

            {/* Loading more indicator */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Đang chờ đề nghị mới...
              </span>
            </div>
          </div>

          {/* Winner confirmation banner */}
          {winner && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 animate-bounce-once">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-800 text-sm">
                    Đã chọn người thắng!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {bids.find((b) => b.id === winner)?.sellerName} đã được
                    chọn. Phiên đấu giá sẽ kết thúc sớm.
                  </p>
                  <button className="mt-3 flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-900 transition-colors">
                    Xem hợp đồng <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
