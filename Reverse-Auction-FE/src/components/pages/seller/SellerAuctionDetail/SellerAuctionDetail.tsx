import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Clock,
  Users,
  MapPin,
  Image as ImageIcon,
  Trophy,
  XCircle,
  ChevronRight,
} from "lucide-react";
import {
  auctionEmpty,
  auctionStatusMap,
  type Auction,
  type Bid,
} from "@/types/auction";
import { formatCurrency, useCountdown } from "@/utils/time";
import { auctionService } from "@/services/auctionService";
import { bidService } from "@/services/bidService";
import BidPanel from "./BidPanel";
import BidStream from "./BidStream";
import { useAppSelector } from "@/hooks/redux";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
export default function SellerAuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction>(auctionEmpty);
  const [bids, setBids] = useState<Bid[]>([]);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [mainImage, setMainImage] = useState(auction.images?.[0] ?? "");
  const countdown = useCountdown(auction.endDate || "");
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [stompClient, setStompClient] = useState<Client | null>(null);

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
        setBids(allBids);
        setMyBid(mine);
        if (auc.images?.[0]) setMainImage(auc.images[0]);
      } catch {
        toast.error("Đã xảy ra lỗi!");
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    let client: Client | null = null;
    function setupWSClient() {
      const accessToken = localStorage.getItem("accessToken");

      // Connect server
      const socket = new SockJS("http://localhost:8080/ws-auction");

      client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },

        debug: (str) => {
          console.log(str);
        },

        onConnect: () => {
          console.log("Connected");

          setStompClient(client);

          client?.subscribe(`/topic/auction/${id}`, (message) => {
            const responseBody = JSON.parse(message.body);
            const allBids = responseBody.bids as Bid[];
            const auctionWS = responseBody.auction as Auction;

            if (allBids) {
              setBids(allBids);
              const idx = allBids.findIndex((b) => b.sellerId === userId);
              // check if seller has bid
              if (idx !== -1) {
                setMyBid(allBids[idx]);
              }
            }
            if (auctionWS) {
              setAuction(auctionWS);
            }
          });
        },
        onStompError: (frame) => {
          console.error(frame);
        },
      });

      client.activate();
    }
    setupWSClient();

    return () => {
      client?.deactivate();
    };
  }, [id, userId]);

  const updateBid = (bidId: string, bidPrice: number, bidNote: string) => {
    bidService.updateSocketBid(
      bidId,
      { auctionId: id, bidPrice, note: bidNote },
      stompClient,
    );
  };

  const placeBid = (bidPrice: number, bidNote: string) => {
    bidService.placeSocketBid(
      { auctionId: id, bidPrice, note: bidNote },
      stompClient,
    );
  };

  const lowestBid = Math.min(...bids.map((b) => b.bidPrice));

  // Determine result state when auction is COMPLETED
  const isCompleted = auction.status === "COMPLETED";
  const iWon = isCompleted && myBid?.isWinner === true;
  const iLost = isCompleted && myBid != null && myBid.isWinner !== true;
  const winnerBid = bids.find((b) => b.isWinner === true);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 ${
              auction?.status === "OPEN"
                ? "bg-red-500 animate-pulse"
                : auction?.status === "COMPLETED"
                  ? "bg-green-500"
                  : "bg-slate-500"
            } text-white text-xs font-black px-3 py-1.5 rounded-full`}
          >
            <span className="w-2 h-2 bg-white rounded-full" />
            {auction?.status ? auctionStatusMap[auction?.status] : ""}
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

      {/* Winner / Loser result banner */}
      {iWon && (
        <div className="mb-6 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-lg flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-black mb-0.5">
              🎉 Chúc mừng! Bạn đã thắng phiên đấu giá!
            </p>
            <p className="text-sm text-emerald-100 mb-3">
              Giá thắng của bạn:{" "}
              <span className="font-black text-white">
                {formatCurrency(myBid?.bidPrice ?? 0)}
              </span>
              . Một đơn hàng đã được tạo và đang chờ người mua thanh toán.
            </p>
            <button
              onClick={() => navigate("/seller/orders")}
              className="inline-flex items-center gap-1 bg-white text-emerald-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              Xem đơn hàng <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {iLost && (
        <div className="mb-6 rounded-2xl bg-slate-100 border border-slate-200 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-slate-700 mb-0.5">
              Phiên đấu giá đã kết thúc
            </p>
            <p className="text-sm text-slate-500">
              {winnerBid
                ? `Người thắng là ${winnerBid.sellerName} với giá ${formatCurrency(winnerBid.bidPrice)}.`
                : "Người mua đã chọn một người thắng khác."}{" "}
              Cảm ơn bạn đã tham gia!
            </p>
          </div>
        </div>
      )}

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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 text-center min-w-35">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Thời gian còn lại
            </p>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 text-center min-w-35">
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
                  {auction.buyerName}
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
        <div className="w-[320px] xl:w-90 shrink-0 space-y-4">
          {/* Only show bid panel if auction is still open */}
          {auction.status === "OPEN" && (
            <BidPanel
              myBid={myBid}
              lowestBid={lowestBid}
              placeBid={placeBid}
              updateBid={updateBid}
            />
          )}
          <BidStream bids={bids} myId={userId} />
        </div>
      </div>
    </div>
  );
}
