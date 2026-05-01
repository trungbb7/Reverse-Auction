import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Clock, Users, MapPin, Image as ImageIcon } from "lucide-react";
import type { Auction, Bid } from "@/types/auction";
import { formatCurrency, useCountdown } from "@/utils/time";
import { auctionService } from "@/services/auctionService";
import { bidService } from "@/services/bidService";
import BidPanel from "./BidPanel";
import BidStream from "./BidStream";
import { useAppSelector } from "@/hooks/redux";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_AUCTION: Auction = {
  id: 1,
  title: "RTX 4090 Founders Edition",
  description:
    "NVIDIA flagship GPU - Hàng mới 100% nguyên seal, yêu cầu bảo hành chính hãng tối thiểu 24 tháng.",
  categoryName: "GPU / GAMING",
  budgetMax: 45_500_000,
  quantity: 2,
  endDate: new Date(
    Date.now() + 4 * 3600_000 + 12 * 60_000 + 45_000,
  ).toISOString(),
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

export default function SellerAuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction>(MOCK_AUCTION);
  const [bids, setBids] = useState<Bid[]>(MOCK_BIDS);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [mainImage, setMainImage] = useState(MOCK_AUCTION.images?.[0] ?? "");
  const countdown = useCountdown(auction.endDate);
  const userId = useAppSelector((state) => state.auth.user?.id);

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
                <p className="text-lg font-black text-slate-900">
                  {bids.length}
                </p>
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
          <BidStream bids={bids} myId={userId} />
        </div>
      </div>
    </div>
  );
}
