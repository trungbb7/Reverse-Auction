import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  Receipt,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { orderService } from "@/services/orderService";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

type PaymentState = "loading" | "success" | "failed" | "error";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentState>("loading");
  const [transactionInfo, setTransactionInfo] = useState<{
    txnRef: string;
    type: string;
    amount: number;
    transactionNo: string;
    bankCode: string;
    payDate: string;
  } | null>(null);

  useEffect(() => {
    const processResult = async () => {
      const vnpResponseCode = searchParams.get("vnp_ResponseCode");
      const txnRef = searchParams.get("vnp_TxnRef");
      const vnpAmount = searchParams.get("vnp_Amount");
      const vnpTransactionNo = searchParams.get("vnp_TransactionNo");
      const vnpBankCode = searchParams.get("vnp_BankCode");
      const vnpPayDate = searchParams.get("vnp_PayDate");

      if (!txnRef) {
        setState("error");
        return;
      }
      const [type, idStr] = txnRef.split("_");

      // VNPay trả về amount * 100
      const amount = vnpAmount ? Number(vnpAmount) / 100 : 0;

      // Format pay date (yyyyMMddHHmmss → readable)
      let formattedDate = "";
      if (vnpPayDate && vnpPayDate.length === 14) {
        const y = vnpPayDate.slice(0, 4);
        const mo = vnpPayDate.slice(4, 6);
        const d = vnpPayDate.slice(6, 8);
        const h = vnpPayDate.slice(8, 10);
        const mi = vnpPayDate.slice(10, 12);
        const s = vnpPayDate.slice(12, 14);
        formattedDate = `${d}/${mo}/${y} ${h}:${mi}:${s}`;
      }

      setTransactionInfo({
        txnRef: idStr,
        type,
        amount,
        transactionNo: vnpTransactionNo ?? "—",
        bankCode: vnpBankCode ?? "—",
        payDate: formattedDate || new Date().toLocaleString("vi-VN"),
      });

        if (vnpResponseCode === "00") {
            try {
                if (type === "ORD") {
                    await orderService.confirmPayment(Number(idStr), "success");
                }
                if (type === "PS") {
                    await orderService.confirmPaymentSession(txnRef, "success");
                }
                setState("success");

            } catch (err) {
                console.error("Callback failed:", err);
                setState("success");
            }
        } else {
            setState("failed");
        }
    };

    processResult();
  }, [searchParams]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <p className="text-slate-600 font-semibold">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Lỗi xử lý</h1>
          <p className="text-slate-500 text-sm">Không xác định được đơn hàng. Vui lòng liên hệ hỗ trợ.</p>
          <button
            onClick={() => navigate("/buyer/orders")}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-700 transition-colors"
          >
            Về danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const isSuccess = state === "success";

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isSuccess
          ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"
          : "bg-gradient-to-br from-red-50 via-orange-50 to-amber-50"
      }`}
    >
      <div className="max-w-lg w-full space-y-5">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top banner */}
          <div
            className={`px-8 pt-10 pb-8 text-center ${
              isSuccess
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : "bg-gradient-to-br from-red-500 to-rose-600"
            }`}
          >
            {/* Animated icon */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
                isSuccess ? "bg-white/20" : "bg-white/20"
              }`}
              style={{ boxShadow: "0 0 0 12px rgba(255,255,255,0.1)" }}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
            </div>

            <h1 className="text-3xl font-black text-white mb-2">
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>
            <p className="text-white/80 text-sm">
              {isSuccess
                ? "Đơn hàng của bạn đã được xác nhận và đang được xử lý."
                : "Giao dịch không được hoàn tất. Vui lòng thử lại."}
            </p>

            {/* Amount */}
            {transactionInfo && transactionInfo.amount > 0 && (
              <div className="mt-6 bg-white/15 rounded-2xl px-6 py-4 inline-block">
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Số tiền</p>
                <p className="text-3xl font-black text-white">
                  {formatCurrency(transactionInfo.amount)}
                </p>
              </div>
            )}
          </div>

          {/* Transaction details */}
          {transactionInfo && isSuccess && (
            <div className="px-8 py-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Chi tiết giao dịch
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: BadgeCheck,
                    label: "Mã đơn hàng",
                    value: `#${transactionInfo.txnRef}`,
                    color: "text-emerald-600",
                  },
                  {
                    icon: Receipt,
                    label: "Mã giao dịch",
                    value: transactionInfo.transactionNo,
                    color: "text-slate-700",
                  },
                  {
                    icon: ShoppingBag,
                    label: "Ngân hàng",
                    value: transactionInfo.bankCode,
                    color: "text-slate-700",
                  },
                  {
                    icon: Clock,
                    label: "Thời gian",
                    value: transactionInfo.payDate,
                    color: "text-slate-700",
                  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-300" />
                      <span className="text-sm text-slate-500">{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed message */}
          {!isSuccess && transactionInfo && (
            <div className="px-8 py-6">
              <div className="bg-red-50 rounded-2xl p-5 space-y-2">
                <p className="text-sm font-bold text-red-800">Giao dịch không thành công</p>
                <p className="text-sm text-red-600">
                  Đơn hàng #{transactionInfo.txnRef} chưa được thanh toán. Bạn có thể thử lại
                  hoặc chọn phương thức thanh toán khác.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-8 pb-8 space-y-3">
            {isSuccess ? (
              <>
                <button
                  onClick={() => navigate(`/buyer/orders/${transactionInfo?.txnRef}`)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200"
                >
                  Xem chi tiết đơn hàng
                </button>
                <button
                  onClick={() => navigate("/buyer/orders")}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Về danh sách đơn hàng
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate(`/buyer/orders/${transactionInfo?.txnRef}`)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-sm hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-200"
                >
                  Thử thanh toán lại
                </button>
                <button
                  onClick={() => navigate("/buyer/orders")}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="inline w-4 h-4 mr-1" />
                  Về danh sách đơn hàng
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400">
          Thanh toán được bảo mật bởi{" "}
          <span className="font-bold text-[#e41e2b]">VNPay</span>
        </p>
      </div>
    </div>
  );
}
