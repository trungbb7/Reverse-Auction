import toast from "react-hot-toast";
import { cartService } from "@/services/cartService";
import { useRef } from "react";
import { useCartContext } from "@/context/CartContext";

export const useCart = () => {
    const { refreshCart } = useCartContext();
    const loadingRef = useRef(false);

    const addToCart = async (productId: number, productName?: string) => {
        if (loadingRef.current) return;

        loadingRef.current = true;

        try {
            await cartService.addToCart({
                productId,
                quantity: 1,
            });

            await refreshCart();

            toast.success(
                productName
                    ? `Đã thêm "${productName}" vào giỏ hàng`
                    : "Đã thêm vào giỏ hàng"
            );
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                "Không thể thêm vào giỏ hàng";

            toast.error(message);
        } finally {
            setTimeout(() => {
                loadingRef.current = false;
            }, 1000);
        }
    };

    return { addToCart };
};