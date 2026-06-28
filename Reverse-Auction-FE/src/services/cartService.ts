import api from "@/utils/axios";

export interface AddToCartRequest {
    productId: number;
    quantity: number;
}

export const cartService = {
    addToCart: async (data: AddToCartRequest) => {
        const response = await api.post(
            "/cart/add",
            data
        );

        return response.data;
    },

    getCart: async () => {
        const response = await api.get("/cart");
        console.log(response.data)
        return response.data;
    },

    updateQuantity: async (
        cartItemId: number,
        quantity: number
    ) => {
        const response = await api.put(
            `/cart/items/${cartItemId}`,
            { quantity }
        );

        return response.data;
    },

    removeItem: async (cartItemId: number) => {
        const response = await api.delete(
            `/cart/items/${cartItemId}`
        );

        return response.data;
    },

    clearCart: async () => {
        const response = await api.delete(
            "/cart/clear"
        );

        return response.data;
    },
};