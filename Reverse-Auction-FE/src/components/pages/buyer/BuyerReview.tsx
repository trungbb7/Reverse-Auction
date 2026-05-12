import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Star } from "lucide-react";
import {reviewService} from "@/services/reviewService";
import type {ReviewContextResponse} from "@/types/review.ts";

export default function BuyerReview() {
    const navigate = useNavigate();
    const {id} = useParams();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [order, setOrder] = useState<ReviewContextResponse | null>(null);

    useEffect(() => {
        console.log(id);
        if (!id) return;

        const fetchData = async () => {
            try {
                const data = await reviewService.getReviewContext(id);
                setOrder(data);
                console.log(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [id]);
    const handleSubmit = async () => {
        if (!id) return;
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
    if (!order) return <div>Loading...</div>;
    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mt-2">Đánh giá người bán</h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Phản hồi của bạn giúp xây dựng một thương mại an toàn và chất lượng hơn
                </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div>
                        <h2 className="font-semibold">{order.seller.name}</h2>
                        <p className="text-sm text-gray-500">
                            ⭐ {order.seller.rating} ({order.seller.totalReviews} đánh giá)
                        </p>
                    </div>
                </div>

                <div className="text-sm text-blue-500 font-medium">
                    {order.productName}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-6 text-center">
                <h3 className="font-semibold mb-4">
                    Trải nghiệm tổng thể của bạn?
                </h3>

                <div className="flex justify-center gap-2 text-3xl mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} className="transition">
                            <Star size={28} className={star <= rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                }
                            />
                        </button>
                    ))}
                </div>

                <p className="text-sm text-gray-400">
                    Vui lòng chọn sao để đánh giá
                </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h3 className="font-semibold mb-3">Chia sẻ chi tiết</h3>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="Chia sẻ trải nghiệm của bạn về người bán này..."
                    className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold disabled:opacity-50"
            >
                Gửi đánh giá
            </button>
        </div>
    );
}