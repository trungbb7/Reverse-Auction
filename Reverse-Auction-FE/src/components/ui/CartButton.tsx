import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface Props {
    productId: number;
    productName?: string;
}

export default function CartButton({productId, productName,}: Props) {

    const { addToCart } = useCart();

    return (
        <button
            onClick={() => addToCart(productId, productName)}
            className="flex items-center gap-1 p-2 rounded-full bg-slate-600 hover:bg-slate-700 text-white transition"
        >
            <span className="text-sm font-bold">+</span>
            <ShoppingCart size={18} />
        </button>
    );
}