import React from "react";
import { Cpu, Store, Package, Star } from "lucide-react";
import type { Product } from "@/types/product.ts";
import CartButton from "@/components/ui/CartButton.tsx";
import { Link } from "react-router";

type ProductCardProps = {
  product: Product;
};

const formatCurrency = (n: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    id,
    name,
    price,
    originalPrice,
    imageUrl,
    rating,
    status,
    brand,
    stockQuantity,
    sellerName,
    categoryName,
  } = product;

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${id}`} className="block h-full">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full relative">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 z-10 bg-red-500 text-white font-extrabold text-[10px] px-2 py-1 rounded-lg shadow-md animate-pulse">
            -{discountPercent}%
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-square bg-slate-50/50 p-4 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <Cpu className="w-20 h-20 text-slate-300 group-hover:scale-105 transition-transform duration-500" />
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shadow-sm ${
                status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {status === "ACTIVE" ? "Sẵn hàng" : "Hết hàng"}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Brand & Category */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-black tracking-widest text-[#375F97] uppercase truncate">
              {brand || "CHƯA RÕ BRAND"}
            </span>
            <span className="text-[10px] font-medium text-slate-400 truncate">
              {categoryName}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-snug flex-grow">
            {name}
          </h3>

          {/* Seller & Rating Row */}
          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-2 border-b border-slate-50 pb-2">
            <div className="flex items-center gap-1 min-w-0">
              <Store className="w-3.5 h-3.5 text-[#375F97] shrink-0" />
              <span className="truncate font-semibold text-slate-600">
                {sellerName || "Hệ thống"}
              </span>
            </div>
            <div className="flex items-center space-x-0.5 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 font-bold text-[10px]">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
              <span>{(rating ?? 5).toFixed(1)}</span>
            </div>
          </div>

          {/* Stock Availability */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3.5 bg-slate-50 p-2 rounded-lg">
            <span className="flex items-center gap-1 font-medium">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              Kho:
            </span>
            <span className={`font-bold ${stockQuantity > 0 ? "text-slate-700" : "text-rose-600"}`}>
              {stockQuantity > 0 ? `${stockQuantity} sản phẩm` : "Hết hàng"}
            </span>
          </div>

          {/* Price & Action Row */}
          <div className="flex items-center justify-between mt-auto pt-1 border-t border-slate-50">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-xs text-slate-400 line-through leading-none mb-1">
                    {formatCurrency(originalPrice!)}
                  </span>
                  <span className="text-base font-black text-rose-600 leading-none">
                    {formatCurrency(price)}
                  </span>
                </>
              ) : (
                <span className="text-base font-black text-[#375F97] leading-none">
                  {formatCurrency(price)}
                </span>
              )}
            </div>
            <CartButton productId={id} productName={name} />
          </div>
        </div>
      </div>
    </Link>
  );
};
