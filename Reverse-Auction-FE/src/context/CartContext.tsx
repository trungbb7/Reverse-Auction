import {createContext, useContext, useState, useEffect} from "react";
import {cartService} from "@/services/cartService";

type CartContextType = {
    cartCount: number;
    refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({children}: { children: React.ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);

    const refreshCart = async () => {
        const data = await cartService.getCart();
        setCartCount(data.length);
    };

    useEffect(() => {
        refreshCart();
    }, []);

    return (
        <CartContext.Provider value={{cartCount, refreshCart}}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCartContext must be used inside CartProvider");
    return ctx;
};