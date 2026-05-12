export interface ReviewContextResponse {
    orderId: number;
    productName: string;
    seller: {
        id: number;
        name: string;
        rating: number;
        totalReviews: number;
    };
    canReview: boolean;
    alreadyReviewed: boolean;
}
export interface ReviewRequest {
    orderId: number;
    rating: number;
    comment: string;
}