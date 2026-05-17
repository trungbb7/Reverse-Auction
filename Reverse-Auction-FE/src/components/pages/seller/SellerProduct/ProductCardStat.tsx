import type { ReactNode } from "react";

interface ProductCardStatProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    valueColor?: string;
}

export default function ProductCardStat({title, value, icon, valueColor = "text-slate-900",}: ProductCardStatProps) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-h-[120px] flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                {icon}
            </div>

            <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">
                    {title}
                </p>

                <h2 className={`text-3xl font-bold ${valueColor}`}>
                    {value}
                </h2>
            </div>
        </div>
    );
}