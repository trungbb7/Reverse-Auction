import { bidService } from "@/services/bidService";
import type { Bid } from "@/types/auction";
import type { ErrorResponse } from "@/types/errorResponse";
import { AxiosError } from "axios";
import { CheckCircle, MoreHorizontal, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function BidPanel({
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
    myBid ? String(myBid.bidPrice) : "",
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
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        const errorResponse = err.response?.data as ErrorResponse;
        toast.error(errorResponse.message || "Đã xảy ra lỗi khi cập nhật");
      } else {
        toast.error("Đã xảy ra lỗi khi cập nhật");
      }
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
            <p className="text-sm font-bold text-green-800">
              Bạn đang dẫn đầu!
            </p>
            <p className="text-xs text-green-600">
              Mức giá của bạn là thấp nhất hiện tại.
            </p>
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
