import { Package2, Star } from "lucide-react";
import { useNavigate } from "react-router";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const rating = product.rating ?? 0;
  const price = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price ?? 0);
  const stockLabel = product.stock == null ? "Liên hệ" : (product.stock > 0 ? `${product.stock} tồn` : "Hết hàng");

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-square bg-slate-50 p-4 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Package2 className="w-24 h-24 text-slate-300 group-hover:text-primary-300 group-hover:scale-110 transition-all duration-500" />
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {product.brand || "Sản phẩm"}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-full">
            {stockLabel}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center space-x-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
          <span className="text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>
          <span className="text-sm text-slate-400">
            {product.sellerName ? `• ${product.sellerName}` : ""}
          </span>
        </div>

        <h3 className="font-medium text-slate-800 line-clamp-2 mb-3 flex-grow group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-slate-500">
          {product.description || "Chưa có mô tả chi tiết"}
        </p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-xs text-slate-500 mb-1">Giá tham khảo</p>
            <p className="text-lg font-bold text-primary-700">{price}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
