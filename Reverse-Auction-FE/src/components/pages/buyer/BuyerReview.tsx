import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Star } from "lucide-react";
import { reviewService } from "@/services/reviewService";
import type { ReviewContextResponse } from "@/types/review";

const ratingLabels = {
    1: "Rất tệ",
    2: "Tệ",
    3: "Bình thường",
    4: "Tốt",
    5: "Rất tốt",
};

export default function BuyerReview() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<ReviewContextResponse | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const data = await reviewService.getReviewContext(id);
                setOrder(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);


    const handleSubmit = async () => {
        if (!id || rating === 0) return;

        try {
            await reviewService.submitReview({
                orderId: Number(id),
                rating,
                comment,
            });

            navigate(-1);
        } catch (err) {
            console.error(err);
        }
    };


    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="text-center py-20 text-gray-500">
                    Đang tải...
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="text-center py-20 text-red-500">
                    Không tìm thấy dữ liệu đơn hàng
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">
                    Đánh giá đơn hàng
                </h1>

                <p className="text-gray-500 mt-2 text-sm">
                    Chia sẻ trải nghiệm của bạn về sản phẩm và quá trình mua hàng.
                </p>
            </div>


            {/* Seller */}
            {/* Order Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">

                <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                        {order.seller.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Người bán
                        </p>

                        <h2 className="font-semibold text-lg">
                            {order.seller.name}
                        </h2>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star
                                size={16}
                                className="fill-amber-400 text-amber-400"
                            />
                            <span>{Number(order.seller.rating ?? 0).toFixed(1)}</span>
                            <span>•</span>
                            <span>{order.seller.totalReviews} đánh giá</span>
                        </div>
                    </div>
                </div>
                {order.productName && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                        Sản phẩm:<span className="font-medium text-gray-900 ml-2">{order.productName}</span>
                    </div>
                )}
            </div>

            {/* Rating */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Bạn đánh giá đơn hàng này thế nào?</h3>
                <p className="text-sm text-gray-500 mb-5">
                    Đánh giá về sản phẩm, chất lượng giao hàng và trải nghiệm mua hàng.
                </p>
                <div className="flex justify-center gap-3 mb-4">
                    {[1,2,3,4,5].map((star)=>(
                        <button key={star} type="button" onClick={() => setRating(star)} className="transition hover:scale-110">
                            <Star
                                size={38}
                                className={
                                    star <= rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                }
                            />
                        </button>
                    ))}
                </div>
                <div className="h-6">
                    {rating > 0 ? (
                        <p className="font-medium text-blue-600">{rating}/5 - {ratingLabels[rating as keyof typeof ratingLabels]}</p>
                    ) : (
                        <p className="text-gray-400">Chọn số sao để đánh giá</p>
                    )}
                </div>
            </div>
            {/* Comment */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Chia sẻ trải nghiệm</h3>
                    <span className="text-xs text-gray-400">
                        {comment.length}/500
                    </span>
                </div>
                <textarea
                    value={comment}
                    onChange={(e)=>setComment(e.target.value)}
                    maxLength={500}
                    rows={5}
                    placeholder="Người bán có hỗ trợ tốt không? Giao hàng có đúng hẹn không?..."
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <button onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500
                to-indigo-600 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Gửi đánh giá
            </button>
        </div>
    );
}