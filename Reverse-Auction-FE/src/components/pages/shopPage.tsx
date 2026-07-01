import {useEffect, useState} from "react";
import {useParams, Link} from "react-router";
import {Star, MapPin, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import {shopService} from "@/services/shopService.ts";
import {reviewService} from "@/services/reviewService.ts";
import type {Product} from "@/types/product.ts";
import toast from "react-hot-toast";
import type {ShopDetail} from "@/types/shopDetail.ts";
import type {Review} from "@/types/review.ts";
import CartButton from "@/components/ui/CartButton.tsx";

export default function ShopPage() {
    const {id} = useParams();
    const [follow, setFollow] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [shop, setShop] = useState<ShopDetail | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("default");

    // Dynamic category list from products
    const storeCategories = Array.from(new Set(products.map(p => p.categoryName || "Khác")));

    // Filter and Sort products client-side
    const displayedProducts = products
        .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                 (p.model && p.model.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = selectedCategory === "all" || (p.categoryName || "Khác") === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === "priceAsc") return a.price - b.price;
            if (sortBy === "priceDesc") return b.price - a.price;
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return 0;
        });
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
                    {/* Header, Search & Filter Bar */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <h2 className="font-extrabold text-xl text-gray-900 self-start md:self-auto">Sản phẩm của Cửa hàng</h2>
                            
                            {/* Search and Sort controls */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <Search size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                    />
                                </div>

                                <div className="relative w-full sm:w-auto flex items-center gap-2">
                                    <ArrowUpDown size={16} className="text-gray-400 shrink-0" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full sm:w-auto bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                                    >
                                        <option value="default">Mặc định</option>
                                        <option value="priceAsc">Giá: Thấp đến Cao</option>
                                        <option value="priceDesc">Giá: Cao đến Thấp</option>
                                        <option value="name">Tên sản phẩm: A-Z</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Category filter pills */}
                        {storeCategories.length > 0 && (
                            <div className="border-t border-gray-50 pt-4">
                                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                    <SlidersHorizontal size={12} />
                                    <span>Lọc danh mục</span>
                                </div>
                                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                                    <button
                                        onClick={() => setSelectedCategory("all")}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                            selectedCategory === "all"
                                                ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        Tất cả ({products.length})
                                    </button>
                                    {storeCategories.map((cat) => {
                                        const count = products.filter(p => (p.categoryName || "Khác") === cat).length;
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                                    selectedCategory === cat
                                                        ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                {cat} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Products Grid */}
                    {displayedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {displayedProducts.map((p, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition duration-300 border border-gray-100 flex flex-col h-full"
                                >
                                    <Link to={`/products/${p.id}`} className="block">
                                        <div className="w-full h-44 bg-slate-50/50 flex items-center justify-center relative overflow-hidden group">
                                            <img
                                                src={p.imageUrl}
                                                className="max-h-full max-w-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                                alt={p.name}
                                            />
                                        </div>
                                    </Link>

                                    <div className="p-4 flex flex-col gap-2 flex-grow">
                                        <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                                            {p.categoryName || "Khác"}
                                        </span>

                                        <Link to={`/products/${p.id}`} className="hover:text-blue-600 transition flex-grow">
                                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                                                {p.name}
                                            </h3>
                                        </Link>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100/50">
                                            <span className="text-blue-900 font-extrabold text-base">
                                                {p.price ? p.price.toLocaleString("vi-VN") : 0} đ
                                            </span>
                                            <CartButton
                                                productId={p.id}
                                                productName={p.name}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
                            <SlidersHorizontal size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-semibold">Không tìm thấy sản phẩm phù hợp</p>
                            <p className="text-gray-400 text-sm mt-1">Hãy thử tìm kiếm với từ khoá hoặc bộ lọc khác.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}