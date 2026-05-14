import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { type Order } from "@/types/orders";
import { orderService } from "@/services/orderService";
import OrderCard from "./OrderCard";
import StatsStrip from "./StatsStrip";

/* ─── Filter Tab ───────────────────────────────────────────── */
type FilterKey =
  | "ALL"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";
const FILTER_LABELS: Record<FilterKey, string> = {
  ALL: "Tất cả",
  AWAITING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

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
      return o.status === filter;
    })
    .filter((o) =>
      (o.productName ?? o.auctionTitle ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900">
            Đơn hàng của tôi
          </h1>
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
              <div
                key={i}
                className="bg-white rounded-2xl h-24 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-bold text-slate-400">Không có đơn hàng nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
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
