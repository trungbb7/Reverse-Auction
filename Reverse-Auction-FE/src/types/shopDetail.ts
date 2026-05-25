export interface ShopDetail {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalReviews: number;
    description: string;
    location: string;
    createdAt: string;

    ratingBreakdown: {
        five: number;
        four: number;
        three: number;
        two: number;
        one: number;
    };
}