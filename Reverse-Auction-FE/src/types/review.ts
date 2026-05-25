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
export interface Review {
    id: string;
    name: string;
    content: string;
    rating: number;
    createdAt: string;
}