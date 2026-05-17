import { Pencil, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Product } from "@/types/product.ts";

interface ProductRowProps {
    product: Product;
}
export default function ProductRow({product,}: ProductRowProps) {
    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200">
            <td className="py-5 px-6">
                <div className="flex items-center gap-4">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                        <h3 className="font-bold text-slate-800 leading-5 max-w-[180px]">
                            {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            SKU: {product.sku}
                        </p>
                    </div>
                </div>
            </td>
            <td className="py-5 px-4">
        <span className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium">
          {product.category.name}
        </span>
            </td>
            <td className="py-5 px-4 font-bold text-slate-800">
                {product.price} đ
            </td>
            <td className="py-5 px-4">
                <div className="flex items-center gap-2 font-semibold">
          <span
              className={`w-2 h-2 rounded-full ${
                  product.stockQuantity === 0
                      ? "bg-red-500"
                      : "bg-emerald-500"
              }`}
          />
                    <span
                        className={
                            product.stockQuantity === 0
                                ? "text-red-500"
                                : "text-slate-700"
                        }
                    >
            {product.stockQuantity}
          </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                    đơn vị
                </p>
            </td>

            <td className="py-5 px-4">
                <StatusBadge status={product.status} />
            </td>

            <td className="py-5 px-4">
                <div className="flex items-center gap-4 text-slate-400">
                    <button className="hover:text-indigo-600 transition-all duration-200">
                        <Pencil size={18} />
                    </button>

                    <button className="hover:text-red-500 transition-all duration-200">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}