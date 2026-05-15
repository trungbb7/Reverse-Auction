import {
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/types/orders";
import { formatCurrency } from "@/utils/time";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Gavel,
  Package,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router";

const STATUS_ICON: Record<OrderStatus, React.ElementType> = {
  AWAITING_PAYMENT: CreditCard,
  PAID: CheckCircle2,
  PROCESSING: Clock,
  SHIPPED: Package,
  DELIVERED: Package,
  COMPLETED: CheckCircle2,
  DISPUTED: XCircle,
  CANCELLED: XCircle,
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "bg-amber-100 text-amber-700 border-amber-200",
  PAID: "bg-blue-100 text-blue-700 border-blue-200",
  PROCESSING: "bg-indigo-100 text-indigo-700 border-indigo-200",
  SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
  DELIVERED: "bg-teal-100 text-teal-700 border-teal-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DISPUTED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const Icon = STATUS_ICON[order.status];
  const isAuction = order.type === "BID";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Top strip */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {isAuction ? (
            <Gavel className="w-3.5 h-3.5 text-violet-500" />
          ) : (
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
          )}
          <span
            className={`font-semibold ${isAuction ? "text-violet-600" : "text-blue-600"}`}
          >
            {isAuction ? "Đấu giá" : "Đặt hàng"}
          </span>
          <span className="text-slate-300">•</span>
          <span>#{order.code ?? order.id}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[order.status]}`}
        >
          <Icon className="w-3 h-3" />
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Body */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Thumbnail placeholder */}
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
          {order.imageUrl ? (
            <img
              src={order.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-7 h-7 text-slate-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">
            {order.productName ?? order.auctionTitle ?? "Đơn hàng đấu giá"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Người bán:{" "}
            <span className="text-slate-600 font-medium">
              {order.sellerName}
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Price + actions */}
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-slate-900">
            {formatCurrency(Number(order.totalAmount))}
          </p>
          <div className="flex items-center gap-2 mt-2 justify-end">
            {order.status === "AWAITING_PAYMENT" && (
              <button
                onClick={() => navigate(`/buyer/orders/${order.id}`)}
                className="px-3 py-1.5 rounded-xl bg-[#375F97] text-white text-xs font-bold hover:bg-[#2d4f80] transition-colors flex items-center gap-1"
              >
                <CreditCard className="w-3 h-3" />
                Thanh toán
              </button>
            )}
            <button
              onClick={() => navigate(`/buyer/orders/${order.id}`)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              Chi tiết <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
