interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({status,}: StatusBadgeProps) {
    const isActive = status === "ĐANG BÁN";

    return (
        <span
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide inline-flex items-center justify-center ${
                isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
            }`}
        >
      {status}
    </span>
    );
}