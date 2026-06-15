import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {Star, MapPin, ShoppingCart } from "lucide-react";
import {shopService} from "@/services/shopService.ts";
import {reviewService} from "@/services/reviewService.ts";
import type {Product} from "@/types/product.ts";
import toast from "react-hot-toast";
import type {ShopDetail} from "@/types/shopDetail.ts";
import type {Review} from "@/types/review.ts";

export default function ShopPage() {
    const {id} = useParams();
    const [follow, setFollow] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [shop, setShop] = useState<ShopDetail | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            setLoading(true);

            try {
                const [shopData, productsData, reviewData] = await Promise.all([
                    shopService.getShopDetail(id),
                    shopService.getShopProducts(id),
                    reviewService.getShopReviews(id),
                ]);
                setShop(shopData);
                setProducts(productsData);
                setReviews(reviewData);
            } catch (err) {
                console.error(err);
                toast.error("Không tải được dữ liệu!");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);
    const ratingStats = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    };

    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            ratingStats[r.rating as 1 | 2 | 3 | 4 | 5]++;
        }
    });

    const totalReviews = shop?.totalReviews ?? 0;

    const getPercent = (count: number) =>
        totalReviews ? Math.round((count / totalReviews) * 100) : 0;
    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            {/* HEADER */}
            <div className="bg-white shadow-sm rounded-2xl">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {shop?.avatar ? (
                            <img
                                src={shop.avatar}
                                className="w-14 h-14 rounded-lg object-cover"
                            />
                        ) : (
                            <div
                                className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                M
                            </div>
                        )}

                        <div>
                            <h1 className="text-xl font-bold">
                                {shop?.name}
                            </h1>

                            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                                <Star
                                    size={16}
                                    className="fill-yellow-400 text-yellow-400"
                                />
                                <span className="font-bold text-slate-700">{shop?.rating?.toFixed(1) ?? 0}</span>
                                <span>({shop?.totalReviews ?? 0} đánh giá)</span>
                                <span>•</span>
                                <span>{shop?.totalOrders ?? 0} đơn hàng</span>
                                <span>•</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">
                                    Tỷ lệ hoàn thành: {shop?.completionRate ? `${shop.completionRate.toFixed(1)}%` : "0%"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setFollow(!follow)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                                follow
                                    ? "bg-gray-300 text-gray-900"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                            }`}
                        >
                            {follow ? "Đang theo dõi" : "Theo dõi"}
                        </button>

                        <button
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition">
                            Nhắn tin
                        </button>
                    </div>
                </div>
            </div>

            <div className="py-6 space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="bg-slate-200 p-5 rounded-xl lg:col-span-1">
                        <h2 className="font-semibold mb-3">Tổng quan</h2>

                        <p className="text-sm text-gray-600 leading-relaxed">
                            Premium hardware provider specializing in high-end GPUs and CPUs.
                            Chúng tôi cam kết cung cấp linh kiện máy tính chính hãng với hiệu năng tốt nhất.
                        </p>

                        <p className="text-sm text-gray-600 leading-relaxed">
                            {shop?.description}
                        </p>

                        <div className="mt-4 text-sm text-gray-600 space-y-2 border-t border-slate-300 pt-3">
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-700">Tham gia:</span>
                                <span>{shop?.createdAt || "Chưa rõ"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-700">Địa chỉ:</span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} className="text-slate-400"/>
                                    {shop?.location}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-700">Tổng số đơn hàng:</span>
                                <span>{shop?.totalOrders ?? 0} đơn</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-700">Tỷ lệ hoàn thành:</span>
                                <span>{shop?.completionRate ? `${shop.completionRate.toFixed(1)}%` : "0%"}</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white p-5 shadow-sm rounded-2xl lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                        <div className="h-full">
                            <h2 className="font-semibold mb-3">Rating</h2>

                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star}>
                                        <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                        {star}
                    </span><span>{getPercent(ratingStats[star as keyof typeof ratingStats])}%</span>
                                        </div>

                                        <div className="h-2 bg-gray-100 rounded">
                                            <div
                                                className="h-2 bg-yellow-400 rounded"
                                                style={{
                                                    width: `${getPercent(
                                                        ratingStats[star as keyof typeof ratingStats]
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-full flex flex-col">
                            <div className="flex justify-end mb-3">
                                <h4 className="text-sm font-semibold text-slate-700">
                                    Xem chi tiết
                                </h4>
                            </div>

                            <div className="space-y-3">
                                {reviews.slice(0, 2).map((r) => (
                                    <div key={r.id} className="text-sm p-3 bg-slate-200 rounded-lg">
                                        “{r.content}”
                                        <div className="text-xs text-gray-500 mt-1">
                                            — {r.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3 ">
                        <h2 className="font-semibold">Sản phẩm nổi bật</h2>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {products.map((p, i) => (
                            <div
                                key={i}
                                className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition border border-gray-100"
                            >
                                <div className="w-full h-44 bg-gray-50 flex items-center justify-center">
                                    <img
                                        src={p.imageUrl}
                                        className="max-h-full max-w-full object-contain p-3"
                                    />
                                </div>

                                <div className="p-4 flex flex-col gap-2">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {p.categoryName || "Uncategorized"}
                </span>

                                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                                        {p.name}
                                    </h3>
                                    <div className="mt-auto flex items-center justify-between pt-3">
                                        <span className="text-blue-900 font-bold text-lg">
                        {p.price} đ
                    </span>
                                        <button className="p-2 rounded-full bg-slate-600 hover:bg-slate-700 text-white transition">
                                            <ShoppingCart  size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}