interface StatusBadgeProps {
    status: string;
}

const ProductStatusLabel: Record<string, string> = {
    ACTIVE: "Đang bán",
    HIDDEN: "Đã ẩn",
    OUT_OF_STOCK: "Hết hàng",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const isActive = status === "ACTIVE";

    return (
        <span
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide inline-flex items-center justify-center ${
                isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
            }`}
        >
            {ProductStatusLabel[status] || status}
        </span>
    );
}