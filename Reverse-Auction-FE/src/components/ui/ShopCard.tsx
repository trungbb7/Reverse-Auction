import {Cpu, MapPin, Star} from "lucide-react";
import {useNavigate} from "react-router";
import type {ShopDetail} from "@/types/shopDetail.ts";

type Props = {
    shop: ShopDetail;
};

export const ShopCard = ({shop}: Props) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col gap-3">

            <div className="flex items-stretch gap-3">
                {/* Avatar */}
                {shop.avatar ? (
                    <img
                        src={shop.avatar}
                        alt={shop.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                ) : (
                    <Cpu className="w-12 h-12 text-slate-300 flex-shrink-0"/>
                )}

                <div className="flex flex-col justify-between flex-1 min-h-12">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 leading-5">
                        {shop.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                        <span>{shop.rating?.toFixed(1) ?? 0}</span>
                        <span className="text-slate-400">({shop.totalReviews ?? 0} đánh giá)</span>
                    </div>

                </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-slate-500">
                <MapPin size={14} className="mt-0.5"/>
                <span className="line-clamp-2">{shop.location}</span>
            </div>
            <button
                onClick={() => navigate(`/shopPage/${shop.id}`)}
                className="mt-auto w-full py-2 rounded-lg bg-gray-400 text-white text-sm font-medium hover:bg-blue-400 transition"
            >
                Xem cửa hàng
            </button>
        </div>
    );
};