import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wallet,
  HandCoins,
} from "lucide-react";
import toast from "react-hot-toast";
import type { CartItem, CartGroupedBySeller } from "@/types/cart.ts";
import type { ShippingInfo, CheckoutRequest } from "@/types/orders.ts";
import { userService } from "@/services/userService.ts";
import type { User as UserType } from "@/types/user.ts";
import type { UserAddress } from "@/types/address.ts";
import ShopSection from "@/components/pages/buyer/buyerCheckout/ShopSection.tsx";
import PaymentMethodSelector from "@/components/pages/buyer/buyerCheckout/PaymentMethod.tsx";
import ShippingInfoForm from "@/components/pages/buyer/buyerCheckout/ShippingInfoForm.tsx";
import { orderService } from "@/services/orderService.ts";
import { useCartContext } from "@/context/CartContext.tsx";
function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

const BANKS = [
  { code: "NCB", name: "NCB Bank", color: "from-blue-600 to-blue-800" },
  { code: "VCB", name: "Vietcombank", color: "from-green-600 to-green-800" },
  { code: "TCB", name: "Techcombank", color: "from-red-500 to-red-700" },
  { code: "MB", name: "MB Bank", color: "from-purple-600 to-purple-800" },
  { code: "VPB", name: "VPBank", color: "from-orange-500 to-orange-700" },
  { code: "BIDV", name: "BIDV", color: "from-sky-600 to-sky-800" },
];
function BankSelector({
  selectedBank,
  onSelect,
}: {
  selectedBank: string;
  onSelect: (bankCode: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-[#375F97]" />
        Chọn ngân hàng thanh toán
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {BANKS.map((bank) => (
          <button
            key={bank.code}
            onClick={() => onSelect(bank.code)}
            className={`relative p-3 rounded-xl border-2 transition-all text-center ${
              selectedBank === bank.code
                ? "border-[#375F97] bg-blue-50"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div
              className={`w-8 h-5 rounded bg-linear-to-r ${bank.color} mx-auto mb-1.5`}
            />
            <p className="text-[10px] font-semibold text-slate-700">
              {bank.name}
            </p>
            {selectedBank === bank.code && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#375F97] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [groupedShops, setGroupedShops] = useState<CartGroupedBySeller[]>([]);
  const { refreshCart } = useCartContext();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "vnpay" | "balance" | "cod"
  >("balance");
  const [selectedBank, setSelectedBank] = useState("NCB");

  useEffect(() => {
    (async () => {
      try {
        const savedItems = sessionStorage.getItem("checkoutItems");

        if (!savedItems) {
          toast.error("Không có sản phẩm để thanh toán");
          navigate("/cart");
          return;
        }

        const items: CartItem[] = JSON.parse(savedItems);
        console.log(items);

        const itemsWithSelected = items.map((item) => ({
          ...item,
          selected: true,
        }));

        const user = await userService.fetchUser();
        setCurrentUser(user);

        let initialName = user.fullName || "";
        let initialPhone = user.phone || "";
        let initialAddress = user.address || "";

        try {
          const list = await userService.fetchAddresses();
          setUserAddresses(list);
          const defaultAddr = list.find((addr) => addr.isDefault) || list[0];
          if (defaultAddr) {
            initialName = defaultAddr.recipientName;
            initialPhone = defaultAddr.phone;
            initialAddress = defaultAddr.address;
          }
        } catch (err) {
          console.error("Failed to load user addresses", err);
        }

        setShippingInfo({
          fullName: initialName,
          phone: initialPhone,
          address: initialAddress,
          note: "",
        });

        setCartItems(itemsWithSelected);
      } catch (err) {
        console.error("Failed to load checkout data", err);
        toast.error("Không thể tải thông tin thanh toán");
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    const selectedItems = cartItems.filter((item) => item.selected);
    const grouped = new Map<number, CartGroupedBySeller>();

    selectedItems.forEach((item) => {
      if (!grouped.has(item.shopId)) {
        grouped.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shopName,
          items: [],
          subtotal: 0,
          shippingFee: 20000,
          totalAmount: 0,
        });
      }

      const group = grouped.get(item.shopId)!;
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
      group.totalAmount = group.subtotal + group.shippingFee;
    });

    setGroupedShops(Array.from(grouped.values()));
  }, [cartItems]);

  // Calculate totals
  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalShipping = groupedShops.reduce(
    (sum, shop) => sum + shop.shippingFee,
    0,
  );
  const totalAmount = subtotal + totalShipping;

  const hasSufficientBalance =
    currentUser && (currentUser.balance || 0) >= totalAmount;

  const handleSubmitOrder = async () => {
    if (!shippingInfo.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên người nhận");
      return;
    }
    if (!shippingInfo.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!shippingInfo.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Không có sản phẩm để thanh toán");
      return;
    }

    setSubmitting(true);

    try {
      const checkoutRequest: CheckoutRequest = {
        recipientName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        note: shippingInfo.note,

        paymentMethod:
          paymentMethod === "balance"
            ? "BALANCE"
            : paymentMethod === "vnpay"
              ? "VNPAY"
              : "COD",
        bankCode: paymentMethod === "vnpay" ? selectedBank : undefined,
        selectedCartItemIds: selectedItems.map((item) => item.id),
        shops: groupedShops.map((shop) => ({
          shopId: shop.shopId,
          shippingFee: shop.shippingFee,
        })),
      };
      console.log(checkoutRequest.selectedCartItemIds);

      const session = await orderService.createCheckout(checkoutRequest);

      if (paymentMethod === "cod") {
        toast.success("Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.");
        await refreshCart();
        sessionStorage.removeItem("checkoutItems");
        navigate("/buyer/orders");
        return;
      }

      if (paymentMethod === "balance") {
        if (!currentUser || (currentUser.balance || 0) < totalAmount) {
          toast.error("Số dư ví của bạn không đủ để thanh toán!");
          return;
        }

        await orderService.paySessionWithBalance(session.sessionCode);
        toast.success("Thanh toán thành công qua số dư ví!");
        return;
      }

      if (paymentMethod === "vnpay") {
        if (!session.paymentUrl) {
          toast.error("Không có link thanh toán");
          return;
        }

        // eslint-disable-next-line react-hooks/immutability
        window.location.href = session.paymentUrl;
        return;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Không thể đặt hàng. Vui lòng thử lại!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
          </button>
          <h1 className="text-xl font-black text-slate-900">Thanh toán</h1>
          <div className="w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT - Products and Shipping */}
          <div className="lg:col-span-2 space-y-5">
            {/* List of shops and products */}
            <div className="space-y-4">
              {groupedShops.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    Chưa có sản phẩm nào được chọn
                  </p>
                  <button
                    onClick={() => navigate("/cart")}
                    className="mt-3 text-sm text-[#375F97] font-semibold hover:underline"
                  >
                    Chọn sản phẩm ngay
                  </button>
                </div>
              ) : (
                groupedShops.map((shop) => (
                  <ShopSection key={shop.shopId} shop={shop} />
                ))
              )}
            </div>

            {/* Shipping Info Form */}
            <ShippingInfoForm
              value={shippingInfo}
              onChange={setShippingInfo}
              userAddresses={userAddresses}
            />
          </div>

          {/* RIGHT - Payment Summary */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-4">
                Tổng kết đơn hàng
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Tạm tính ({selectedItems.length} sản phẩm)
                  </span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phí vận chuyển</span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(totalShipping)}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">
                      Tổng thanh toán
                    </span>
                    <span className="font-black text-xl text-[#375F97]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right mt-1">
                    (Đã bao gồm VAT)
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              userBalance={currentUser?.balance || 0}
              totalAmount={totalAmount}
            />

            {paymentMethod === "vnpay" && (
              <BankSelector
                selectedBank={selectedBank}
                onSelect={setSelectedBank}
              />
            )}

            {paymentMethod === "balance" && !hasSufficientBalance && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Số dư không đủ
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Vui lòng nạp thêm tiền vào ví hoặc chọn phương thức thanh
                    toán khác.
                  </p>
                  <button
                    onClick={() => navigate("/profile/topup")}
                    className="text-xs font-semibold text-amber-700 underline mt-1"
                  >
                    Nạp tiền ngay →
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={
                submitting ||
                selectedItems.length === 0 ||
                (paymentMethod === "balance" && !hasSufficientBalance)
              }
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#375F97] to-blue-500 text-white font-black text-base flex items-center justify-center gap-2 hover:from-[#2d4f80] hover:to-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : paymentMethod === "balance" ? (
                <>
                  <Wallet className="w-5 h-5" />
                  Đặt hàng ({formatCurrency(totalAmount)})
                </>
              ) : paymentMethod === "vnpay" ? (
                <>
                  <CreditCard className="w-5 h-5" />
                  Thanh toán qua VNPay
                </>
              ) : (
                <>
                  <HandCoins className="w-5 h-5" />
                  Đặt hàng - COD
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-400">
              Bằng cách đặt hàng, bạn đồng ý với{" "}
              <button className="text-[#375F97] font-medium hover:underline">
                Điều khoản sử dụng
              </button>{" "}
              và{" "}
              <button className="text-[#375F97] font-medium hover:underline">
                Chính sách bảo mật
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
