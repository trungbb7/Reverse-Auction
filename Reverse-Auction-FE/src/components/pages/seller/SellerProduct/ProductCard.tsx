import { Pencil, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Product } from "@/types/product.ts";
import { useConfirm } from "@/context/ConfirmContext";



interface ProductRowProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}
export default function ProductRow({product, onEdit, onDelete}: ProductRowProps) {
    const { confirm } = useConfirm();
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
                            {product.sku}
                        </p>
                    </div>
                </div>
            </td>
            <td className="py-5 px-4">
        <span className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium">
          {product.categoryName}
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
                    <button className="hover:text-indigo-600 transition-all duration-200"
                            onClick={() => onEdit(product)}>
                        <Pencil size={18} />
                    </button>

                    <button
                        onClick={async () => {
                            const isConfirmed = await confirm({
                                title: "Xóa sản phẩm",
                                message: "Bạn có chắc muốn xóa sản phẩm này không?",
                                type: "danger",
                                confirmText: "Xóa",
                                cancelText: "Hủy",
                            });
                            if (isConfirmed) {
                                onDelete(product.id);
                            }
                        }}
                        className="hover:text-red-500 transition-all duration-200"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}