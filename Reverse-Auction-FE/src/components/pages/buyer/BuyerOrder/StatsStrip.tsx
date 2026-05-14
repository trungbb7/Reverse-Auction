import type { Order } from "@/types/orders";

export default function StatsStrip({ orders }: { orders: Order[] }) {
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "AWAITING_PAYMENT").length;
  const processing = orders.filter(
    (o) =>
      o.status === "PROCESSING" ||
      o.status === "SHIPPED" ||
      o.status === "PAID" ||
      o.status === "DELIVERED",
  ).length;
  const done = orders.filter((o) => o.status === "COMPLETED").length;

  const stats = [
    {
      label: "Tổng đơn hàng",
      value: total,
      color: "text-slate-900",
      bg: "bg-slate-50",
    },
    {
      label: "Chờ thanh toán",
      value: pending,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Đã thanh toán/ Đang xử lý / giao",
      value: processing,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Đã hoàn thành",
      value: done,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}
        >
          <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
          <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
