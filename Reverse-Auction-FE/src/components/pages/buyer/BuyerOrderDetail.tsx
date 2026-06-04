import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Package,
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  User,
  MapPin,
  Phone,
  Gavel,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  type Order,
  ORDER_STATUS_LABEL,
  ORDER_STEPS,
  ORDER_STATUS_INDEX,
} from "@/types/orders";
import { orderService } from "@/services/orderService";
import toast from "react-hot-toast";

/* ─── helpers ─────────────────────────────────────────────────── */
function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

const BANKS = [
  { code: "NCB", name: "NCB Bank", color: "from-blue-600 to-blue-800" },
  { code: "VCB", name: "Vietcombank", color: "from-green-600 to-green-800" },
  { code: "TCB", name: "Techcombank", color: "from-red-500 to-red-700" },
  { code: "MB", name: "MB Bank", color: "from-purple-600 to-purple-800" },
  { code: "VPB", name: "VPBank", color: "from-orange-500 to-orange-700" },
  { code: "BIDV", name: "BIDV", color: "from-sky-600 to-sky-800" },
];

const STEP_ICONS = [CreditCard, CheckCircle2, Clock, Truck, Package];

/* ─── Payment Panel ─────────────────────────────────────────── */
function PaymentPanel({ order }: { order: Order }) {
  const [selectedBank, setSelectedBank] = useState("NCB");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const amount = Math.round(Number(order.totalAmount)); // VNPay expects integer VND
      const result = await orderService.createPayment(
        order.id,
        amount,
        selectedBank,
      );

      console.log(result);

      // Redirect to VNPay — VNPay will redirect back to /payment/result?orderId=X
      window.location.href = result.paymentUrl;
    } catch (err) {
      console.error(err);
      toast.error("Không thể tạo phiên thanh toán. Vui lòng thử lại!");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[#375F97]" />
        <h2 className="font-black text-slate-900 text-base">
          Thanh toán đơn hàng
        </h2>
      </div>

      {/* Amount */}
      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Số tiền cần thanh toán</p>
        <p className="text-3xl font-black text-[#375F97]">
          {formatCurrency(Number(order.totalAmount))}
        </p>
      </div>

      {/* Bank selection */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Chọn ngân hàng
        </p>
        <div className="grid grid-cols-3 gap-2">
          {BANKS.map((bank) => (
            <button
              key={bank.code}
              onClick={() => setSelectedBank(bank.code)}
              className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                selectedBank === bank.code
                  ? "border-[#375F97] bg-blue-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div
                className={`w-8 h-5 rounded bg-gradient-to-r ${bank.color} mx-auto mb-1.5`}
              />
              <p className="text-[10px] font-bold text-slate-700">
                {bank.name}
              </p>
              {selectedBank === bank.code && (
                <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-[#375F97] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#375F97] to-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:from-[#2d4f80] hover:to-blue-600 transition-all disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang chuyển đến VNPay...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            Thanh toán qua VNPay ({selectedBank})
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Bạn sẽ được chuyển đến trang thanh toán VNPay an toàn
      </p>
    </div>
  );
}

/* ─── Progress Timeline ─────────────────────────────────────── */
function OrderTimeline({ status }: { status: Order["status"] }) {
  const steps = ORDER_STEPS;
  const currentIdx = ORDER_STATUS_INDEX[status];
  const labels = ["Đã thanh toán", "Đang xử lý", "Đang giao", "Hoàn tất"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-black text-slate-900 text-sm mb-5">
        Tiến độ đơn hàng
      </h3>
      <div className="relative flex items-center justify-between">
        {/* Base track */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
        {/* Progress fill */}
        <div
          className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-[#375F97] to-blue-400 -translate-y-1/2 rounded-full transition-all duration-700"
          style={{
            width:
              currentIdx < 0
                ? "0%"
                : `${(currentIdx / (steps.length - 1)) * 100}%`,
          }}
        />
        {steps.map((_, idx) => {
          const StepIcon = STEP_ICONS[idx + 1] ?? CheckCircle2;
          const active = idx <= currentIdx;
          return (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  active
                    ? "bg-[#375F97] border-[#375F97] shadow-md"
                    : "bg-white border-slate-200"
                }`}
              >
                <StepIcon
                  className={`w-4 h-4 ${active ? "text-white" : "text-slate-300"}`}
                />
              </div>
              <span
                className={`text-[10px] font-bold ${active ? "text-[#375F97]" : "text-slate-300"}`}
              >
                {labels[idx]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function BuyerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const handleConfirmReceipt = async () => {
    if (!order) return;
    if (
      !window.confirm(
        "Bạn xác nhận đã nhận được hàng đầy đủ và đúng mô tả? Thao tác này sẽ hoàn tất đơn hàng và không thể hoàn tác.",
      )
    )
      return;
    try {
      const updatedOrder = await orderService.updateStatus(
        order.id,
        "COMPLETED",
      );
      setOrder(updatedOrder);
      toast.success("Đã hoàn tất đơn hàng thành công!");
    } catch (err) {
      toast.error("Không thể xác nhận nhận hàng. Vui lòng thử lại!");
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const data = await orderService.getOrderDetail(Number(id));
        setOrder(data);
      } catch (err) {
        console.error(err);
        toast.error("Không tìm thấy đơn hàng.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Package className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-semibold">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate("/buyer/orders")}
          className="text-sm text-[#375F97] font-semibold hover:underline"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const isAuction = order.type === "BID";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/buyer/orders")}
              className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold hover:text-slate-700 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <h1 className="text-2xl font-black text-slate-900">
              Chi tiết đơn #{order.code ?? order.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {isAuction ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                  <Gavel className="w-3 h-3" /> Đấu giá
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Đặt hàng
                </span>
              )}
              <span className="text-xs text-slate-400">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT — main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Product / Auction card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {order.imageUrl ? (
                    <img
                      src={order.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-base leading-snug">
                    {order.productName ??
                      order.auctionTitle ??
                      "Đơn hàng đấu giá"}
                  </p>
                  {order.brand && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Thương hiệu:{" "}
                      <span className="text-slate-600">{order.brand}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <OrderTimeline status={order.status} />

            {/* Seller info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm mb-4">
                Thông tin người bán
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#375F97] flex items-center justify-center text-white font-black text-sm shrink-0">
                  {order.sellerName?.charAt(0) ?? "S"}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {order.sellerName}
                  </p>
                  <p className="text-xs text-slate-400">
                    ID: #{order.sellerId}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping info */}
            {(order.shippingAddress || order.buyerPhone) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                <h3 className="font-black text-slate-900 text-sm">
                  Địa chỉ giao hàng
                </h3>
                {order.buyerPhone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    {order.buyerPhone}
                  </div>
                )}
                {order.shippingAddress && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    {order.shippingAddress}
                  </div>
                )}
                {!order.shippingAddress && !order.buyerPhone && (
                  <p className="text-xs text-slate-400 italic">
                    Chưa có thông tin giao hàng
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — price summary + payment */}
          <div className="space-y-5">
            {/* Price summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="font-black text-slate-900 text-sm">
                Tổng kết đơn hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá sản phẩm</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(Number(order.finalPrice))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí vận chuyển</span>
                  <span
                    className={
                      Number(order.shippingFee) === 0
                        ? "text-emerald-600 font-semibold"
                        : "font-semibold text-slate-900"
                    }
                  >
                    {Number(order.shippingFee) === 0
                      ? "Miễn phí"
                      : formatCurrency(Number(order.shippingFee))}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between">
                  <span className="font-black text-slate-900">Tổng cộng</span>
                  <span className="font-black text-lg text-[#375F97]">
                    {formatCurrency(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment panel — only shown when AWAITING_PAYMENT */}
            {order.status === "AWAITING_PAYMENT" && (
              <PaymentPanel order={order} />
            )}

            {/* Status info for non-payment states */}
            {order.status !== "AWAITING_PAYMENT" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <h3 className="font-black text-slate-900 text-sm">
                      Trạng thái
                    </h3>
                  </div>
                  <p className="text-sm font-bold text-slate-700 mt-2">
                    {ORDER_STATUS_LABEL[order.status]}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cập nhật: {new Date(order.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                  <button
                    onClick={handleConfirmReceipt}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-black text-sm transition-all shadow-sm hover:shadow active:scale-98"
                  >
                    Xác nhận đã nhận hàng
                  </button>
                )}

                {order.status === "COMPLETED" && !order.alreadyReviewed && (
                  <button
                    onClick={() => navigate(`/review/order/${order.id}`)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#375F97] to-blue-500 hover:from-[#2d4f80] hover:to-blue-600 text-white font-black text-sm transition-all shadow-sm hover:shadow active:scale-98"
                  >
                    Đánh giá dịch vụ
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
