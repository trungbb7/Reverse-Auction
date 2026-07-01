import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
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
  Star,
  X,
} from "lucide-react";
import {
  type Order,
  ORDER_STATUS_LABEL,
  ORDER_STEPS,
  ORDER_STATUS_INDEX,
} from "@/types/orders";
import { orderService } from "@/services/orderService";
import { complaintService } from "@/services/complaintService";
import { cloudinaryService } from "@/services/cloudinaryService";
import toast from "react-hot-toast";
import { useConfirm } from "@/context/ConfirmContext";

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

import { userService } from "@/services/userService";
import type { User as UserType } from "@/types/user";
import type { UserAddress } from "@/types/address";

/* ─── Payment Panel ─────────────────────────────────────────── */
function PaymentPanel({
  order,
  onPaymentSuccess,
}: {
  order: Order;
  onPaymentSuccess: (updated: Order) => void;
}) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "balance">(
    "balance",
  );
  const [selectedBank, setSelectedBank] = useState("NCB");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await userService.fetchUser();
        setCurrentUser(data);

        let initialAddr = order.shippingAddress || data.address || "";
        let initialPhone = order.buyerPhone || data.phone || "";

        try {
          const list = await userService.fetchAddresses();
          setUserAddresses(list);
          if (!order.shippingAddress) {
            const defaultAddr = list.find((addr) => addr.isDefault) || list[0];
            if (defaultAddr) {
              initialAddr = defaultAddr.address;
              initialPhone = defaultAddr.phone;
            }
          }
        } catch (err) {
          console.error("Failed to load user addresses", err);
        }

        setShippingAddress(initialAddr);
        setBuyerPhone(initialPhone);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    })();
  }, [order]);

  const handlePay = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ nhận hàng!");
      return;
    }
    if (!buyerPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại nhận hàng!");
      return;
    }

    setLoading(true);
    try {
      // 1. Cập nhật thông tin giao hàng lên đơn hàng trước
      await orderService.updateShippingInfo(
        order.id,
        shippingAddress,
        buyerPhone,
      );

      // 2. Tiến hành thanh toán
      if (paymentMethod === "balance") {
        if (
          !currentUser ||
          (currentUser.balance || 0) < Number(order.totalAmount)
        ) {
          toast.error("Số dư ví của bạn không đủ để thanh toán!");
          setLoading(false);
          return;
        }
        const updated = await orderService.payWithBalance(order.id);
        toast.success("Thanh toán thành công qua số dư ví!");
        onPaymentSuccess(updated);
      } else {
        const amount = Math.round(Number(order.totalAmount)); // VNPay expects integer VND
        const result = await orderService.createPayment(
          order.id,
          amount,
          selectedBank,
        );
        // Redirect to VNPay
        window.location.href = result.paymentUrl;
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        "Không thể thanh toán. Vui lòng thử lại!";
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const hasSufficientBalance =
    currentUser && (currentUser.balance || 0) >= Number(order.totalAmount);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[#375F97]" />
        <h2 className="font-black text-slate-900 text-base">
          Xác nhận thông tin & Thanh toán
        </h2>
      </div>

      {/* Shipping details */}
      <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Thông tin giao hàng
        </p>

        {userAddresses.length > 0 && (
          <div className="mb-2.5 p-2 bg-white rounded-lg border border-slate-100 space-y-1.5">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Chọn nhanh từ địa chỉ đã lưu:
            </label>
            <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
              {userAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    setShippingAddress(addr.address);
                    setBuyerPhone(addr.phone);
                  }}
                  className="w-full text-left p-2 rounded-md border border-slate-200 hover:border-[#375F97] hover:bg-blue-50/20 transition-all text-[11px] flex justify-between items-center bg-white"
                >
                  <div className="min-w-0 pr-1.5">
                    <span className="font-semibold text-slate-700">
                      {addr.recipientName}
                    </span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-slate-600">{addr.phone}</span>
                    <p className="text-slate-500 truncate text-[10px] mt-0.5">
                      {addr.address}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-[#375F97] shrink-0">
                    Chọn
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">
              Số điện thoại nhận hàng
            </label>
            <input
              type="text"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">
              Địa chỉ giao hàng
            </label>
            <textarea
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Nhập địa chỉ cụ thể"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Tổng cộng cần thanh toán</p>
        <p className="text-3xl font-black text-[#375F97]">
          {formatCurrency(Number(order.totalAmount))}
        </p>
      </div>

      {/* Payment Method Select */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Phương thức thanh toán
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setPaymentMethod("balance")}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center ${
              paymentMethod === "balance"
                ? "border-[#375F97] bg-blue-50/50"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <span className="text-xs font-bold text-slate-700">Số dư ví</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {currentUser
                ? `Ví: ${formatCurrency(currentUser.balance || 0)}`
                : "Đang tải..."}
            </span>
          </button>
          <button
            onClick={() => setPaymentMethod("vnpay")}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center ${
              paymentMethod === "vnpay"
                ? "border-[#375F97] bg-blue-50/50"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <span className="text-xs font-bold text-slate-700">Cổng VNPay</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Thẻ ATM / QR
            </span>
          </button>
        </div>
      </div>

      {/* Balance payment checks */}
      {paymentMethod === "balance" && currentUser && (
        <div className="text-center">
          {!hasSufficientBalance ? (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
              Số dư tài khoản không đủ (
              {formatCurrency(currentUser.balance || 0)} &lt;{" "}
              {formatCurrency(Number(order.totalAmount))}). Vui lòng vào hồ sơ
              để nạp thêm tiền.
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium">
              Số dư hợp lệ. Bạn sẽ thanh toán trực tiếp từ ví.
            </div>
          )}
        </div>
      )}

      {/* VNPay bank selection */}
      {paymentMethod === "vnpay" && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Chọn ngân hàng
          </p>
          <div className="grid grid-cols-3 gap-2">
            {BANKS.map((bank) => (
              <button
                key={bank.code}
                onClick={() => setSelectedBank(bank.code)}
                className={`relative p-2.5 rounded-xl border-2 transition-all text-center ${
                  selectedBank === bank.code
                    ? "border-[#375F97] bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-7 h-4 rounded bg-gradient-to-r ${bank.color} mx-auto mb-1`}
                />
                <p className="text-[9px] font-bold text-slate-700">
                  {bank.name}
                </p>
                {selectedBank === bank.code && (
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#375F97] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={
          loading || (paymentMethod === "balance" && !hasSufficientBalance)
        }
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#375F97] to-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:from-[#2d4f80] hover:to-blue-600 transition-all disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang xử lý thanh toán...
          </>
        ) : paymentMethod === "balance" ? (
          <>
            <CreditCard className="w-4 h-4" />
            Thanh toán bằng Số dư ví
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            Thanh toán qua VNPay ({selectedBank})
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Bằng cách nhấn thanh toán, bạn đồng ý với các điều khoản giao dịch của
        sàn.
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
  const { confirm } = useConfirm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [complaintReason, setComplaintReason] = useState("");
  const [complaintImages, setComplaintImages] = useState<FileList | null>(null);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintReason.trim()) {
      toast.error("Vui lòng nhập lý do khiếu nại!");
      return;
    }
    setSubmittingComplaint(true);
    try {
      let evidenceUrls: string[] = [];
      if (complaintImages && complaintImages.length > 0) {
        toast.loading("Đang tải lên hình ảnh bằng chứng...", {
          id: "uploading",
        });
        evidenceUrls = (
          await cloudinaryService.uploadMultiMedia(complaintImages)
        ).map((item) => item.url);
        toast.dismiss("uploading");
      }

      await complaintService.createComplaint({
        orderId: order!.id,
        reason: complaintReason,
        evidenceUrls,
      });

      toast.success(
        "Gửi khiếu nại thành công! Đơn hàng đã chuyển sang trạng thái tranh chấp.",
      );
      setIsComplaintOpen(false);
      setComplaintReason("");
      setComplaintImages(null);

      // Reload order details
      const data = await orderService.getOrderDetail(order!.id);
      setOrder(data);
    } catch (err) {
      console.error(err);
      toast.dismiss("uploading");
      toast.error("Không thể gửi khiếu nại. Vui lòng thử lại!");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!order) return;
    const isConfirmed = await confirm({
      title: "Xác nhận nhận hàng",
      message:
        "Bạn xác nhận đã nhận được hàng đầy đủ và đúng mô tả? Thao tác này sẽ hoàn tất đơn hàng và không thể hoàn tác.",
      type: "success",
      confirmText: "Xác nhận nhận hàng",
      cancelText: "Hủy",
    });

    if (!isConfirmed) return;
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
              Chi tiết đơn #{order.id}
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
                  {order.type === "BID" ? (
                    <p className="font-black text-slate-900 text-base leading-snug">
                      {order.productName ?? "Sản phẩm"}
                    </p>
                  ) : (
                    order.items?.map((item, index) => (
                      <div key={item.id ?? index} className="mb-2">
                        <p className="font-black text-slate-900 text-base leading-snug">
                          {item.productName ?? "Sản phẩm"}
                        </p>
                        {item.brand && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Thương hiệu:{" "}
                            <span className="text-slate-600">{item.brand}</span>
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    ))
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
                  <Link to={`/shopPage/${order.sellerId}`}>
                    <p className="font-bold text-slate-900 text-sm">
                      {order.sellerName}
                    </p>
                  </Link>
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
                    {formatCurrency(Number(order.totalAmount))}
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
                    {formatCurrency(Number(order.finalPrice))}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment panel — only shown when AWAITING_PAYMENT */}
            {order.status === "AWAITING_PAYMENT" && (
              <PaymentPanel
                order={order}
                onPaymentSuccess={(updated) => setOrder(updated)}
              />
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
                    Cập nhật:{" "}
                    {new Date(order.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                {(order.status === "SHIPPED" ||
                  order.status === "DELIVERED") && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleConfirmReceipt}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-black text-sm transition-all shadow-sm hover:shadow active:scale-98"
                    >
                      Xác nhận đã nhận hàng
                    </button>
                    <button
                      onClick={() => setIsComplaintOpen(true)}
                      className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-black text-sm transition-all shadow-sm hover:shadow active:scale-98"
                    >
                      Khiếu nại / Hoàn tiền
                    </button>
                  </div>
                )}

                {order.status === "COMPLETED" &&
                  (!order.alreadyReviewed ? (
                    <button
                      onClick={() => navigate(`/review/order/${order.id}`)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#375F97] to-blue-500 text-white font-black text-sm"
                    >
                      Đánh giá dịch vụ
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          Đã đánh giá
                        </h3>
                        <span className="text-sm text-gray-500">
                          {order.review?.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={18}
                            className={
                              i <= (order.review?.rating ?? 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      {order.review?.content ? (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          "{order.review.content}"
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Không có nhận xét
                        </p>
                      )}
                      {order.review?.createdAt && (
                        <p className="text-xs text-gray-400 mt-3">
                          Đánh giá ngày:{" "}
                          {new Date(order.review.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaint Modal */}
      {isComplaintOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Khiếu nại đơn hàng
              </h2>
              <button
                onClick={() => setIsComplaintOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lý do khiếu nại / Tranh chấp
                </label>
                <textarea
                  required
                  rows={4}
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải với sản phẩm này (hỏng hóc, không giống mô tả, thiếu linh kiện...)"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hình ảnh / video bằng chứng (Nếu có)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => setComplaintImages(e.target.files)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#375F97] hover:file:bg-blue-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Bạn có thể chọn nhiều ảnh hoặc video cùng lúc.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComplaintOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold transition-all text-sm disabled:opacity-60"
                >
                  {submittingComplaint ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi khiếu nại"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
