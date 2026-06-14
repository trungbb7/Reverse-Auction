import {Building2, CheckCircle2} from "lucide-react";
import type {CartGroupedBySeller} from "@/types/cart.ts";
function formatCurrency(n: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(n);
}
export default function ShopSection({
                         shop,
                     }: {
    shop: CartGroupedBySeller;
}) {

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Shop header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-[#375F97] border-[#375F97]`}>
                        <CheckCircle2 className="w-3 h-3 text-white"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-[#375F97] to-blue-500 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white"/>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">
                                {shop.shopName}
                            </p>
                            <p className="text-[10px] text-slate-400">ID: #{shop.shopId}</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400">Tạm tính</p>
                    <p className="font-bold text-[#375F97] text-sm">
                        {formatCurrency(shop.subtotal)}
                    </p>
                </div>
            </div>

            {/* Shop items */}
            <div className="divide-y divide-slate-100">
                {shop.items.map((item) => (
                    <div key={item.id} className="p-4 flex gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-4 bg-[#375F97] border-[#375F97]`}>
                             <CheckCircle2 className="w-3 h-3 text-white"/>
                        </div>

                        {/* Product image */}
                        <div
                            className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200"/>
                            )}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm line-clamp-2">
                                {item.productName}
                            </p>
                            <p className="text-xs font-bold text-[#375F97] mt-1">
                                {formatCurrency(item.price)}
                            </p>
                            {/*<p className="text-[10px] text-slate-400 mt-0.5">*/}
                            {/*    Kho: {item.stock}*/}
                            {/*</p>*/}

                            {/* Quantity controls */}
                            <div className="flex items-center gap-2 mt-2">
                                {/*<button*/}
                                {/*    onClick={() =>*/}
                                {/*        onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))*/}
                                {/*    }*/}
                                {/*    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"*/}
                                {/*>*/}
                                {/*    <Minus className="w-3 h-3 text-slate-500"/>*/}
                                {/*</button>*/}
                                <span className="text-sm font-medium text-slate-700">
        Số lượng: {item.quantity}
    </span>
                                <p className="text-xs font-semibold text-slate-700 ml-auto">
                                    {formatCurrency(item.price * item.quantity)}
                                </p>
                                {/*<button*/}
                                {/*    onClick={() =>*/}
                                {/*        onUpdateQuantity(*/}
                                {/*            item.id,*/}
                                {/*            Math.min(item.stock, item.quantity + 1),*/}
                                {/*        )*/}
                                {/*    }*/}
                                {/*    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"*/}
                                {/*>*/}
                                {/*    <Plus className="w-3 h-3 text-slate-500"/>*/}
                                {/*</button>*/}
                                {/*<button*/}
                                {/*    onClick={() => onRemoveItem(item.id)}*/}
                                {/*    className="ml-auto text-red-400 hover:text-red-600 transition-all p-1"*/}
                                {/*>*/}
                                {/*    <Trash2 className="w-4 h-4"/>*/}
                                {/*</button>*/}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Shop footer - shipping */}
            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Phí vận chuyển</span>
                <span className="font-medium text-slate-700">
        {shop.shippingFee === 0
            ? "Miễn phí"
            : formatCurrency(shop.shippingFee)}
        </span>
            </div>
        </div>
    );
}