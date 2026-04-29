import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Clock,
  MoreHorizontal,
  CheckCircle,
  Send,
  RefreshCw,
  Users,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import type { Auction, Bid } from "@/types/auction";
import { formatCurrency, formatTimeAgo, useCountdown } from "@/utils/time";
import { auctionService } from "@/services/auctionService";
import { bidService } from "@/services/bidService";
import toast from "react-hot-toast";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_AUCTION: Auction = {
  id: 1,
  title: "RTX 4090 Founders Edition",
  description:
    "NVIDIA flagship GPU - Hàng mới 100% nguyên seal, yêu cầu bảo hành chính hãng tối thiểu 24 tháng.",
  categoryName: "GPU / GAMING",
  budgetMax: 45_500_000,
  quantity: 2,
  endDate: new Date(Date.now() + 4 * 3600_000 + 12 * 60_000 + 45_000).toISOString(),
  createdAt: new Date(Date.now() - 86400_000).toISOString(),
  status: "OPEN",
  lowestBid: 44_200_000,
  totalBids: 8,
  location: "Ho Chi Minh City",
  paymentMethod: "Chuyển khoản trước (100%)",
  images: [
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600",
  ],
};

const MOCK_BIDS: Bid[] = [
  {
    id: "b1",
    auctionId: "1",
    sellerId: "s1",
    sellerName: "Hanoi Computer",
    bidPrice: 44_800_000,
    createdAt: new Date(Date.now() - 60_000).toISOString(),
    note: "Bảo hành 36 tháng + Free ship",
  },
  {
    id: "b_me",
    auctionId: "1",
    sellerId: "me",
    sellerName: "Bạn (Bạn đang dẫn đầu)",
    bidPrice: 44_200_000,
    createdAt: new Date(Date.now() - 120_000).toISOString(),
    note: "Bảo hành 24 tháng chính hãng",
  },
  {
    id: "b3",
    auctionId: "1",
    sellerId: "s3",
    sellerName: "An Phat PC",
    bidPrice: 45_000_000,
    createdAt: new Date(Date.now() - 300_000).toISOString(),
    note: "Sẵn hàng tại kho HCM",
  },
  {
    id: "b4",
    auctionId: "1",
    sellerId: "s4",
    sellerName: "GearVN",
    bidPrice: 45_200_000,
    createdAt: new Date(Date.now() - 480_000).toISOString(),
    note: "",
  },
];

const MOCK_SPECS = [
  { label: "Model", value: "Founder Edition Only" },
  { label: "VRAM", value: "24GB GDDR6X" },
  { label: "Condition", value: "New In Box (NIB)" },
  { label: "Delivery", value: "Within 24h" },
  { label: "Location", value: "Ho Chi Minh City" },
];

// ─── Bid Panel ────────────────────────────────────────────────────────────────
function BidPanel({
  auctionId,
  myBid,
  lowestBid,
  onBidSuccess,
}: {
  auctionId: number;
  myBid: Bid | null;
  lowestBid: number;
  onBidSuccess: (bid: Bid) => void;
}) {
  const [price, setPrice] = useState<string>(
    myBid ? String(myBid.bidPrice) : ""
  );
  const [note, setNote] = useState(myBid?.note ?? "");
  const [loading, setLoading] = useState(false);

  const numericPrice = Number(String(price).replace(/\D/g, ""));
  const isLeading = myBid ? myBid.bidPrice <= lowestBid : false;

  const formatInput = (val: string) => {
    const n = Number(val.replace(/\D/g, ""));
    return n ? n.toLocaleString("vi-VN") : "";
  };

  const adjustPrice = (delta: number) => {
    const current = numericPrice || (myBid?.bidPrice ?? lowestBid);
    const next = Math.max(0, current + delta);
    setPrice(formatInput(String(next)));
  };

  const handleSubmit = async () => {
    if (!numericPrice || numericPrice <= 0) {
      toast.error("Vui lòng nhập mức giá hợp lệ");
      return;
    }
    setLoading(true);
    try {
      let result: Bid;
      if (myBid) {
        result = await bidService.updateBid(myBid.id, {
          bidPrice: numericPrice,
          note,
        });
        toast.success("Đã cập nhật báo giá!");
      } else {
        result = await bidService.submitBid({
          auctionId,
          bidPrice: numericPrice,
          note,
        });
        toast.success("Đã gửi báo giá thành công!");
      }
      onBidSuccess(result);
    } catch {
      // Demo mode: create mock result
      const mockResult: Bid = {
        id: myBid?.id ?? "b_me",
        auctionId: String(auctionId),
        sellerId: "me",
        sellerName: "Bạn (Bạn đang dẫn đầu)",
        bidPrice: numericPrice,
        createdAt: new Date().toISOString(),
        note,
      };
      onBidSuccess(mockResult);
      toast.success(myBid ? "Đã cập nhật báo giá! (demo)" : "Đã gửi báo giá! (demo)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-black text-slate-900 mb-4">
        {myBid ? "Của bạn" : "Đề xuất của bạn"}
      </h3>

      {/* Leading badge */}
      {myBid && isLeading && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">Bạn đang dẫn đầu!</p>
            <p className="text-xs text-green-600">Mức giá của bạn là thấp nhất hiện tại.</p>
          </div>
        </div>
      )}

      {/* Price input */}
      <div className="mb-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
          {myBid ? "Nhập mức giá mới" : "Nhập mức giá mới"}
        </label>
        <div className="relative">
          <input
            id="bid-price-input"
            type="text"
            value={price}
            onChange={(e) => setPrice(formatInput(e.target.value))}
            placeholder={myBid ? formatInput(String(myBid.bidPrice)) : "0"}
            className="w-full pr-8 pl-4 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-2xl font-black text-slate-900 transition-all"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            đ
          </span>
        </div>
      </div>

      {/* Note textarea (only for new bid) */}
      {!myBid && (
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
            Lời nhắn (tuỳ chọn)
          </label>
          <textarea
            id="bid-note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập lời nhắn..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm resize-none transition-all"
          />
        </div>
      )}

      {/* Submit button */}
      <div className="flex items-center gap-2 mb-3">
        <button
          id="submit-bid-btn"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#375F97] hover:bg-[#2d4e7e] text-white font-bold text-sm transition-all disabled:opacity-60 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : myBid ? (
            <RefreshCw className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {myBid ? "Cập nhật giá" : "Gửi báo giá"}
        </button>
        <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Quick adjust buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => adjustPrice(-500_000)}
          className="py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          - 500.000đ
        </button>
        <button
          onClick={() => adjustPrice(-1_000_000)}
          className="py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          - 1.000.000đ
        </button>
      </div>
    </div>
  );
}

// ─── Bid Stream ────────────────────────────────────────────────────────────────
function BidStream({ bids, myId = "me" }: { bids: Bid[]; myId?: string }) {
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
          return (
            <div
              key={bid.id}
              className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${isMe ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                  isMe
                    ? "bg-[#375F97] text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {bid.sellerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-bold truncate ${isMe ? "text-[#375F97]" : "text-slate-900"}`}
                  >
                    {bid.sellerName}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTimeAgo(bid.createdAt)}
                  </span>
                </div>
                <p className="text-base font-black text-slate-900">
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SellerAuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction>(MOCK_AUCTION);
  const [bids, setBids] = useState<Bid[]>(MOCK_BIDS);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [mainImage, setMainImage] = useState(MOCK_AUCTION.images?.[0] ?? "");
  const countdown = useCountdown(auction.endDate);

  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    async function load() {
      try {
        const [auc, allBids, mine] = await Promise.all([
          auctionService.getAuctionById(id!),
          bidService.getBidsForAuction(id!),
          bidService.getMyBidForAuction(id!),
        ]);
        setAuction(auc);
        setBids(allBids.length > 0 ? allBids : MOCK_BIDS);
        setMyBid(mine);
        if (auc.images?.[0]) setMainImage(auc.images[0]);
      } catch {
        // Use mock data in demo
      }
    }
    load();
  }, [id]);

  const handleBidSuccess = (bid: Bid) => {
    setMyBid(bid);
    setBids((prev) => {
      const existing = prev.findIndex((b) => b.id === bid.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = bid;
        return next;
      }
      return [bid, ...prev];
    });
  };

  const lowestBid = Math.min(...bids.map((b) => b.bidPrice));

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full" />
            LIVE
          </span>
          <span className="text-sm text-slate-500 font-medium">
            Phiên đấu thầu #{id?.padStart(5, "0")}
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          ← Quay lại
        </button>
      </div>

      {/* Title + Countdown row */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {auction.title}
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            {auction.description}
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 text-center min-w-[140px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Thời gian còn lại
            </p>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 text-center min-w-[140px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Giá trần đề xuất
            </p>
            <p className="text-2xl font-black text-[#375F97] tabular-nums">
              {formatCurrency(auction.budgetMax ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* LEFT: Product detail */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Buyer card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">
                  Công ty TNHH TechNova
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Người mua xác thực • 142 giao dịch
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                Priority Buyer
              </span>
            </div>

            {/* Image gallery */}
            <div className="flex gap-3 mb-5">
              {(auction.images ?? []).map((src, idx) => (
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
                    alt={`img-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {(auction.images ?? []).length === 0 && (
                <div className="w-44 h-32 rounded-xl bg-slate-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>

            {/* Tech specs */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#375F97] mb-3">
              Thông số kỹ thuật yêu cầu
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {MOCK_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                >
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">
                    {spec.label}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Additional description */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Mô tả thêm
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed">
                "Chúng tôi đang cần gấp 2 unit RTX 4090 Founders Edition để
                nâng cấp hệ thống render. Yêu cầu hàng sẵn có tại kho, không
                chấp nhận pre-order. Ưu tiên các đối tác đã từng cung cấp linh
                kiện cho hệ thống Workstation."
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Giá thấp nhất hiện tại</p>
                <p className="text-lg font-black text-slate-900">
                  {formatCurrency(lowestBid)}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Nhà bán tham gia</p>
                <p className="text-lg font-black text-slate-900">{bids.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Bid panel + stream */}
        <div className="w-[320px] xl:w-[360px] shrink-0 space-y-4">
          <BidPanel
            auctionId={auction.id}
            myBid={myBid}
            lowestBid={lowestBid}
            onBidSuccess={handleBidSuccess}
          />
          <BidStream bids={bids} myId="me" />
        </div>
      </div>
    </div>
  );
}
