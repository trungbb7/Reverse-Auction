import type {Review, ReviewContextResponse, ReviewRequest} from "@/types/review";
import api from "@/utils/axios";

export const reviewService = {

    getReviewContext: async (
        orderId: number | string
    ): Promise<ReviewContextResponse> => {
        const res = await api.get(`/reviews/order/${orderId}`);
        return res.data;
    },

    submitReview: async (
        data: ReviewRequest
    ): Promise<void> => {
        await api.post("/reviews", data);
    },
    getShopReviews: async (shopId: string) : Promise<Review[]> => {
        const res = await api.get(`/reviews/shop/${shopId}`);
        return res.data;
    },


};