import {
    CreditCard,
    AlertCircle,
    Banknote,
    Wallet,
    HandCoins ,
} from "lucide-react";

function formatCurrency(n: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(n);
}

export default function PaymentMethodSelector({
                                                  value,
                                                  onChange,
                                                  userBalance,
                                                  totalAmount,
                                              }: {
    value: "vnpay" | "balance" | "cod";
    onChange: (method: "vnpay" | "balance" | "cod") => void;
    userBalance: number;
    totalAmount: number;
}) {
    const hasSufficientBalance = userBalance >= totalAmount;

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#375F97]"/>
                Phương thức thanh toán
            </h3>

            <div className="space-y-3">
                {/* Balance payment */}
                <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        value === "balance"
                            ? "border-[#375F97] bg-blue-50/30"
                            : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                value === "balance"
                                    ? "border-[#375F97] bg-[#375F97]"
                                    : "border-slate-300"
                            }`}
                        >
                            {value === "balance" && (
                                <div className="w-2 h-2 rounded-full bg-white"/>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-slate-600"/>
                                <span className="font-semibold text-slate-700 text-sm">
                                    Số dư ví
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                Số dư hiện tại: {formatCurrency(userBalance)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        {!hasSufficientBalance && totalAmount > 0 && (
                            <span className="text-[10px] text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3"/>
                                Không đủ số dư
                            </span>
                        )}
                    </div>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="balance"
                        checked={value === "balance"}
                        onChange={() => onChange("balance")}
                        className="hidden"
                    />
                </label>

                {/* VNPay payment */}
                <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        value === "vnpay"
                            ? "border-[#375F97] bg-blue-50/30"
                            : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                    <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            value === "vnpay"
                                ? "border-[#375F97] bg-[#375F97]"
                                : "border-slate-300"
                        }`}
                    >
                        {value === "vnpay" && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-slate-600"/>
                            <span className="font-semibold text-slate-700 text-sm">
                                Cổng thanh toán VNPay
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            Thẻ ATM / Thẻ tín dụng / QR Code
                        </p>
                    </div>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="vnpay"
                        checked={value === "vnpay"}
                        onChange={() => onChange("vnpay")}
                        className="hidden"
                    />
                </label>

                {/* Cash on Delivery (COD) */}
                <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        value === "cod"
                            ? "border-[#375F97] bg-blue-50/30"
                            : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                    <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            value === "cod"
                                ? "border-[#375F97] bg-[#375F97]"
                                : "border-slate-300"
                        }`}
                    >
                        {value === "cod" && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <HandCoins className="w-4 h-4 text-slate-600"/>
                            <span className="font-semibold text-slate-700 text-sm">
                                Thanh toán khi nhận hàng (COD)
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            Trả tiền mặt khi nhận hàng
                        </p>
                    </div>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={value === "cod"}
                        onChange={() => onChange("cod")}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
}