import React from "react";
import {Cpu} from "lucide-react";
import type {Product} from "@/types/product.ts";
import CartButton from "@/components/ui/CartButton.tsx";

type ProductCardProps = {
    product: Product;
};

export const ProductCard: React.FC<ProductCardProps> = ({product}) => {
    const {
        id,
        name,
        price,
        imageUrl,
        rating,
        status,
    } = product;

    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">

            <div className="relative aspect-square bg-slate-50 p-4 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <Cpu className="w-24 h-24 text-slate-300"/>
                )}

                <div className="absolute top-3 left-3">
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {status === "ACTIVE" ? "Sẵn hàng" : "Hết hàng"}
                </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center space-x-1 mb-2">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-medium text-slate-700">
            {(rating ?? 5).toFixed(1)}
          </span>
                </div>

                <h3 className="font-medium text-slate-800 line-clamp-2 mb-3 flex-grow">
                    {name}
                </h3>

                <div className="flex items-end justify-between mt-auto">
                    <p className="text-lg font-bold text-primary-700">
                        {price}
                    </p>
                    <CartButton
                        productId={id}
                        productName={name}
                    />
                </div>

            </div>
        </div>
    );
};
