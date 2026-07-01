import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { Star, ShoppingCart, CreditCard, ShieldCheck, Truck, ArrowLeft, MessageSquare, Store, Info } from "lucide-react";
import { productService } from "@/services/productsService";
import { reviewService } from "@/services/reviewService";
import { useCartContext } from "@/context/CartContext";
import { cartService } from "@/services/cartService";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshCart } = useCartContext();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");

    useEffect(() => {
        if (!id) return;
        const loadProductData = async () => {
            setLoading(true);
            try {
                const [productData, reviewData] = await Promise.all([
                    productService.getProductById(id),
                    reviewService.getProductReviews(id)
                ]);
                setProduct(productData);
                setReviews(reviewData);
                if (productData.imageUrl) {
                    setActiveImage(productData.imageUrl);
                } else if (productData.imageUrls && productData.imageUrls.length > 0) {
                    setActiveImage(productData.imageUrls[0]);
                }
            } catch (err) {
                console.error(err);
                toast.error("Không tải được thông tin sản phẩm!");
            } finally {
                setLoading(false);
            }
        };

        loadProductData();
    }, [id]);

    const handleQuantityChange = (type: "inc" | "dec") => {
        if (!product) return;
        if (type === "dec") {
            setQuantity(prev => (prev > 1 ? prev - 1 : 1));
        } else {
            setQuantity(prev => (prev < product.stockQuantity ? prev + 1 : prev));
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await cartService.addToCart({
                productId: product.id,
                quantity: quantity
            });
            await refreshCart();
            toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Không thể thêm vào giỏ hàng");
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;
        try {
            await cartService.addToCart({
                productId: product.id,
                quantity: quantity
            });
            await refreshCart();
            navigate("/cart");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi xử lý mua ngay");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Đang tải chi tiết sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <Info size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-500 mb-6">Sản phẩm này không tồn tại hoặc đã bị ẩn.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                >
                    <ArrowLeft size={16} /> Quay lại
                </button>
            </div>
        );
    }

    const allImages = [
        product.imageUrl,
        ...(product.imageUrls || [])
    ].filter((img): img is string => !!img);

    // Filter unique image urls
    const uniqueImages = Array.from(new Set(allImages));

    const totalReviews = reviews.length;
    const ratingStats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            ratingStats[r.rating as 1 | 2 | 3 | 4 | 5]++;
        }
    });

    const getPercent = (count: number) =>
        totalReviews ? Math.round((count / totalReviews) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 pb-16">
            <div className="max-w-6xl mx-auto px-4 py-6">
                
                {/* BREADCRUMB */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-blue-600 transition">Trang chủ</Link>
                    <span>/</span>
                    <span className="font-semibold text-gray-700">{product.categoryName}</span>
                </nav>

                {/* MAIN GRID */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    
                    {/* LEFT COLUMN: IMAGES */}
                    <div className="flex flex-col gap-4">
                        <div className="w-full h-96 lg:h-[450px] bg-slate-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                            {activeImage ? (
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="max-h-full max-w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="text-gray-400">Không có hình ảnh</div>
                            )}
                        </div>

                        {/* THUMBNAILS */}
                        {uniqueImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto py-2">
                                {uniqueImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-20 h-20 bg-slate-50 border-2 rounded-xl overflow-hidden flex items-center justify-center p-1 transition-all ${
                                            activeImage === img ? "border-blue-600 shadow-sm" : "border-transparent hover:border-gray-300"
                                        }`}
                                    >
                                        <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: DETAILS */}
                    <div className="flex flex-col">
                        {/* CATEGORY & BRAND */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                {product.categoryName}
                            </span>
                            {product.brand && (
                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    Thương hiệu: {product.brand}
                                </span>
                            )}
                            {product.model && (
                                <span className="text-sm text-gray-400">Model: {product.model}</span>
                            )}
                        </div>

                        {/* PRODUCT TITLE */}
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug mb-4">
                            {product.name}
                        </h1>

                        {/* RATINGS SUMMARY */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-gray-900">
                                    {product.rating ? product.rating.toFixed(1) : "0.0"}
                                </span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => setActiveTab("reviews")}
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                {totalReviews} đánh giá
                            </button>
                            <span className="text-gray-300">|</span>
                            <span className={`text-sm font-semibold ${product.stockQuantity > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity} sản phẩm)` : "Hết hàng"}
                            </span>
                        </div>

                        {/* PRICE BLOCK */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-5 mb-6">
                            <span className="text-xs text-blue-600 uppercase font-bold tracking-wider">Giá bán sản phẩm</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-extrabold text-blue-900">
                                    {product.price ? product.price.toLocaleString("vi-VN") : "0"} đ
                                </span>
                            </div>
                        </div>

                        {/* PURCHASE CONTROL */}
                        {product.stockQuantity > 0 ? (
                            <div className="space-y-6">
                                {/* QUANTITY SELECTOR */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-gray-700">Số lượng</span>
                                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
                                        <button
                                            onClick={() => handleQuantityChange("dec")}
                                            className="px-3 py-1.5 font-bold hover:bg-gray-100 transition"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange("inc")}
                                            className="px-3 py-1.5 font-bold hover:bg-gray-100 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 py-3 px-5 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition"
                                    >
                                        <ShoppingCart size={20} />
                                        Thêm vào giỏ hàng
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-md shadow-blue-200"
                                    >
                                        <CreditCard size={20} />
                                        Mua ngay
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 px-6 bg-red-50 text-red-700 rounded-2xl font-semibold text-center border border-red-100">
                                Sản phẩm hiện đang hết hàng. Vui lòng quay lại sau!
                            </div>
                        )}

                        {/* QUALITY ASSURANCES */}
                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                <ShieldCheck className="text-emerald-500" size={18} />
                                <span>Chính hãng 100%</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                <Truck className="text-blue-500" size={18} />
                                <span>Giao hàng tận nơi</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* SELLER BLOCK */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 font-extrabold flex items-center justify-center text-xl shadow-inner">
                            {product.sellerName ? product.sellerName.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Cung cấp bởi</div>
                            <h3 className="text-lg font-bold text-gray-900">{product.sellerName}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                <Store size={14} className="text-slate-400" /> Shop đối tác uy tín của Reverse Auction
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Link
                            to={`/shopPage/${product.sellerId}`}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
                        >
                            <Store size={16} />
                            Xem Cửa Hàng
                        </Link>
                        <button
                            onClick={() => {
                                // Navigate to chat context
                                navigate(`/seller/chat?sellerId=${product.sellerId}`);
                            }}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={16} />
                            Nhắn tin
                        </button>
                    </div>
                </div>

                {/* BOTTOM TABS */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* TAB LIST */}
                    <div className="flex border-b border-gray-100 bg-slate-50">
                        <button
                            onClick={() => setActiveTab("desc")}
                            className={`px-6 py-4 font-bold text-sm transition relative ${
                                activeTab === "desc" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Mô tả sản phẩm
                            {activeTab === "desc" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("specs")}
                            className={`px-6 py-4 font-bold text-sm transition relative ${
                                activeTab === "specs" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Thông số kỹ thuật
                            {activeTab === "specs" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`px-6 py-4 font-bold text-sm transition relative ${
                                activeTab === "reviews" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Đánh giá ({totalReviews})
                            {activeTab === "reviews" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
                        </button>
                    </div>

                    {/* TAB CONTENT */}
                    <div className="p-6 lg:p-8">
                        {/* DESCRIPTION */}
                        {activeTab === "desc" && (
                            <div className="prose max-w-none text-gray-600 leading-relaxed space-y-4">
                                {product.description ? (
                                    product.description.split("\n").map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                                )}
                            </div>
                        )}

                        {/* SPECIFICATIONS */}
                        {activeTab === "specs" && (
                            <div className="max-w-2xl">
                                {product.specifications ? (
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <tbody>
                                                <tr className="border-b border-gray-50 bg-slate-50/50">
                                                    <td className="px-6 py-4 font-bold text-gray-700 w-1/3">Thương hiệu</td>
                                                    <td className="px-6 py-4 text-gray-600">{product.brand || "—"}</td>
                                                </tr>
                                                <tr className="border-b border-gray-50">
                                                    <td className="px-6 py-4 font-bold text-gray-700">Model / Dòng máy</td>
                                                    <td className="px-6 py-4 text-gray-600">{product.model || "—"}</td>
                                                </tr>
                                                <tr className="border-b border-gray-50 bg-slate-50/50">
                                                    <td className="px-6 py-4 font-bold text-gray-700">Danh mục</td>
                                                    <td className="px-6 py-4 text-gray-600">{product.categoryName}</td>
                                                </tr>
                                                {/* Parse specifications string (assuming format Key: Value or Key:Value) */}
                                                {product.specifications.split("\n").filter(line => line.trim()).map((specLine, idx) => {
                                                    const parts = specLine.split(/[:：]/);
                                                    const key = parts[0]?.trim();
                                                    const val = parts.slice(1).join(":")?.trim();
                                                    
                                                    if (!key) return null;
                                                    return (
                                                        <tr key={idx} className={`border-b border-gray-50 ${idx % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                                                            <td className="px-6 py-4 font-bold text-gray-700">{key}</td>
                                                            <td className="px-6 py-4 text-gray-600">{val || "—"}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <tbody>
                                                <tr className="border-b border-gray-50 bg-slate-50/50">
                                                    <td className="px-6 py-4 font-bold text-gray-700 w-1/3">Thương hiệu</td>
                                                    <td className="px-6 py-4 text-gray-600">{product.brand || "—"}</td>
                                                </tr>
                                                <tr className="border-b border-gray-50">
                                                    <td className="px-6 py-4 font-bold text-gray-700">Model</td>
                                                    <td className="px-6 py-4 text-gray-600">{product.model || "—"}</td>
                                                </tr>
                                                <tr className="bg-slate-50/50">
                                                    <td className="px-6 py-4 font-bold text-gray-700">Danh mục</td>
                                                    <td className="px-6 py-4 text-gray-600">{product.categoryName}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* REVIEWS */}
                        {activeTab === "reviews" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                {/* STATS CARD */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100/50">
                                    <h4 className="font-bold text-gray-900 mb-4 text-base">Tổng điểm đánh giá</h4>
                                    
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-4xl font-extrabold text-gray-900">
                                            {product.rating ? product.rating.toFixed(1) : "0.0"}
                                        </span>
                                        <span className="text-sm text-gray-400">trên 5</span>
                                    </div>

                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => (
                                            <div key={star} className="flex items-center gap-3 text-sm">
                                                <span className="flex items-center gap-1 w-8 font-bold text-gray-600">
                                                    {star} <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                </span>
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400 rounded-full"
                                                        style={{ width: `${getPercent(ratingStats[star as 1|2|3|4|5])}%` }}
                                                    />
                                                </div>
                                                <span className="w-10 text-right text-gray-400 text-xs">
                                                    {getPercent(ratingStats[star as 1|2|3|4|5])}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* REVIEWS LIST */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h4 className="font-bold text-gray-900 mb-4 text-base">Nhận xét từ người mua ({totalReviews})</h4>
                                    
                                    {reviews.length > 0 ? (
                                        reviews.map((r) => (
                                            <div key={r.id} className="border border-gray-100 rounded-2xl p-5 hover:bg-slate-50/50 transition">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 font-bold text-xs text-slate-700 flex items-center justify-center">
                                                            {r.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-sm text-gray-900">{r.name}</span>
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                                <span>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star
                                                                key={s}
                                                                size={14}
                                                                className={s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 text-sm leading-relaxed pl-10">
                                                    “{r.content || "Không có bình luận chi tiết."}”
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                                            Sản phẩm chưa có đánh giá nào từ khách hàng.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
