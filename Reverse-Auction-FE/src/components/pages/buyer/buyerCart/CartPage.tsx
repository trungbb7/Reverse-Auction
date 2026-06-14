import {useMemo, useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router";
import type {CartItem} from "@/types/cart.ts";
import {cartService} from "@/services/cartService";
import {ShoppingCart, ArrowLeft  } from "lucide-react";
import toast from "react-hot-toast";
import { useCartContext } from "@/context/CartContext";

export default function CartPage() {

    const [cart, setCart] = useState<CartItem[]>([]);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState<number[]>([]);
    const { refreshCart } = useCartContext();

    useEffect(() => {
        const loadCart = async () => {
            try {
                const data = await cartService.getCart();
                setCart(data);
            } catch (e) {
                console.error(e);
                toast.error("Không tải được giỏ hàng");
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, []);

    const grouped = useMemo(() => {
        return (cart ?? []).reduce((acc, item) => {

            if (!acc[item.shopId]) {
                acc[item.shopId] = {
                    shopId: item.shopId,
                    shopName: item.shopName,
                    items: [],
                };
            }

            acc[item.shopId].items.push(item);

            return acc;

        }, {} as Record<number, {
            shopId: number;
            shopName: string;
            items: CartItem[];
        }>);
    }, [cart]);
    console.log("isArray:", Array.isArray(cart));
    console.log("cart:", cart);
    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };
    const loadingRef = useRef<Record<number, boolean>>({});
    const updateQty = async (id: number, delta: number) => {
        if (loadingRef.current[id]) return; // chặn spam click

        const item = cart.find(i => i.id === id);
        if (!item) return;

        const newQty = Math.max(1, item.quantity + delta);

        loadingRef.current[id] = true;

        try {
            await cartService.updateQuantity(id, newQty);

            setCart(prev =>
                prev.map(i =>
                    i.id === id
                        ? { ...i, quantity: newQty }
                        : i
                )
            );
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                "Không thể chỉnh sửa";

            toast.error(message);
        } finally {
            setTimeout(() => {
                loadingRef.current[id] = false;
            }, 800);
        }
    };
    const removeItem = async (cartItemId: number) => {
        try {
            await cartService.removeItem(cartItemId);
            await refreshCart();
            setCart(prev =>
                prev.filter(i => i.id !== cartItemId)
            );

            toast.success("Đã xóa sản phẩm");

        } catch {
            toast.error("Không thể xóa sản phẩm");
        }
    };
    const items = cart ?? [];

    const selectedItems = items.filter((i) =>
        selected.includes(i.id)
    );

    const total = selectedItems.reduce(
        (s, i) => s + i.price * i.quantity,
        0
    );

    const getShopTotal = (items: CartItem[]) =>
        items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const isEmpty = !grouped || Object.keys(grouped).length === 0;
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast.error("Vui lòng chọn ít nhất một sản phẩm");
            return;
        }

        sessionStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
        navigate("/checkout");
    };
    if (loading) {
        return (
            <div className="p-6">
                Đang tải giỏ hàng...
            </div>
        );
    }

    return (
        <div className="w-full px-4 md:px-8 py-6 bg-gray-50">

            {/* BACK */}
            <div className="mb-4">
                <button onClick={() => window.history.back()}
                    className="text-blue-700 font-medium hover:text-blue-800 transition"> <ArrowLeft size={18} />
                    Quay lại
                </button>
            </div>

            {/* TITLE */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
                <p className="text-sm text-gray-500">Chọn sản phẩm bạn muốn thanh toán</p>
            </div>
            {/* EMPTY STATE */}
            {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Giỏ hàng trống</h2>
                    <p className="text-sm text-gray-500 mt-1">Bạn chưa có sản phẩm nào trong giỏ hàng</p>

                    <button onClick={() => window.location.href = "/"}
                        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Tiếp tục mua sắm
                    </button>
                </div>
            ) : (
                <>
                    {/* LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT */}
                        <div className="lg:col-span-2 space-y-5">
                            {Object.values(grouped).map((shop) => {

                                return (
                                    <div key={shop.shopId}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm">

                                        {/* SHOP HEADER */}
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                                            <div>
                                                <h2 className="font-semibold text-gray-800">
                                                    {shop.shopName}
                                                </h2>
                                                <p className="text-xs text-gray-500">
                                                    {shop.items.length} sản phẩm
                                                </p>
                                            </div>

                                            <p className="text-red-500 font-bold">
                                                {getShopTotal(shop.items).toLocaleString()}₫
                                            </p>
                                        </div>

                                        {/* ITEMS */}
                                        <div className="p-5 space-y-4">

                                            {shop.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">

                                                    {/* CHECKBOX */}
                                                    <input type="checkbox"
                                                        checked={selected.includes(item.id)}
                                                        onChange={() =>
                                                            toggleSelect(item.id)}
                                                        className="w-4 h-4"/>

                                                    {/* IMAGE */}
                                                    <img src={item.imageUrl} className="w-12 h-12 rounded-lg object-cover border"/>
                                                    {/* INFO */}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                                                        <p className="text-xs text-gray-500">{item.price.toLocaleString()}₫</p>
                                                        <p className="text-sm font-semibold text-blue-600">{(item.price * item.quantity).toLocaleString()}₫</p>
                                                    </div>

                                                    {/* QTY */}
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() =>
                                                                updateQty(item.id, -1)}
                                                            className="px-2 bg-gray-100 rounded">-
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() =>
                                                                updateQty(item.id, 1)}
                                                            className="px-2 bg-gray-100 rounded">+
                                                        </button>
                                                        <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm">Xóa </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* RIGHT SUMMARY */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border shadow-sm p-5">
                                <h3 className="font-semibold mb-4">Thanh toán</h3>
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Đã chọn</span>
                                    <span>{selectedItems.length} sản phẩm</span>
                                </div>

                                <div className="flex justify-between font-bold text-lg border-t pt-3">
                                    <span>Tổng</span><span className="text-blue-600">{total.toLocaleString()}₫</span>
                                </div>
                                <button onClick={handleCheckout}
                                    disabled={selected.length === 0}
                                    className={`mt-5 w-full py-3 rounded-xl font-semibold text-white transition ${
                                        selected.length === 0
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-600 to-indigo-500 hover:scale-[1.01]"
                                    }`}>Thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}