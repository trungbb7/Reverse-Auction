import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Package,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ChevronRight,
  ShoppingBag,
  Gavel,
} from "lucide-react";
import {
  type Order,
  type OrderStatus,
  ORDER_STATUS_LABEL,
} from "@/types/orders";
import { orderService } from "@/services/orderService";

/* ─── helpers ─────────────────────────────────────────────── */
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

function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

/* ─── Filter Tab ───────────────────────────────────────────── */
type FilterKey = "ALL" | "AWAITING_PAYMENT" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
const FILTER_LABELS: Record<FilterKey, string> = {
  ALL: "Tất cả",
  AWAITING_PAYMENT: "Chờ thanh toán",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

/* ─── Order Card ───────────────────────────────────────────── */
function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const Icon = STATUS_ICON[order.status];
  const isAuction = order.type === "AUCTION";

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
          <span className={`font-semibold ${isAuction ? "text-violet-600" : "text-blue-600"}`}>
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
            <img src={order.imageUrl} alt="" className="w-full h-full object-cover" />
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
            Người bán: <span className="text-slate-600 font-medium">{order.sellerName}</span>
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

/* ─── Stats Strip ──────────────────────────────────────────── */
function StatsStrip({ orders }: { orders: Order[] }) {
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "AWAITING_PAYMENT").length;
  const processing = orders.filter(
    (o) => o.status === "PROCESSING" || o.status === "SHIPPED"
  ).length;
  const done = orders.filter((o) => o.status === "COMPLETED").length;

  const stats = [
    { label: "Tổng đơn hàng", value: total, color: "text-slate-900", bg: "bg-slate-50" },
    { label: "Chờ thanh toán", value: pending, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Đang xử lý / giao", value: processing, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Đã hoàn thành", value: done, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
          <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
          <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function BuyerOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = orders
    .filter((o) => {
      if (filter === "ALL") return true;
      if (filter === "PROCESSING") return o.status === "PROCESSING" || o.status === "PAID";
      if (filter === "SHIPPED") return o.status === "SHIPPED" || o.status === "DELIVERED";
      return o.status === filter;
    })
    .filter((o) =>
      (o.productName ?? o.auctionTitle ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900">Đơn hàng của tôi</h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi trạng thái và thanh toán các đơn hàng của bạn.
          </p>
        </div>

        {/* Stats */}
        {!loading && <StatsStrip orders={orders} />}

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filter === key
                    ? "bg-[#375F97] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {FILTER_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm đơn hàng..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-bold text-slate-400">Không có đơn hàng nào</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}