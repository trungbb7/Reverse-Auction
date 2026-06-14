import {
    Truck,
    MapPin,
    Phone,
} from "lucide-react";
interface ShippingInfo {
    fullName: string;
    phone: string;
    address: string;
    note?: string;
}
export default function ShippingInfoForm({
                              value,
                              onChange,
                          }: {
    value: ShippingInfo;
    onChange: (info: ShippingInfo) => void;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#375F97]"/>
                Thông tin giao hàng
            </h3>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Họ và tên người nhận
                    </label>
                    <input
                        type="text"
                        value={value.fullName}
                        onChange={(e) => onChange({...value, fullName: e.target.value})}
                        placeholder="Nhập họ tên người nhận"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#375F97]/20 focus:border-[#375F97]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Số điện thoại
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                        <input
                            type="tel"
                            value={value.phone}
                            onChange={(e) => onChange({...value, phone: e.target.value})}
                            placeholder="Nhập số điện thoại"
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#375F97]/20 focus:border-[#375F97]"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Địa chỉ giao hàng
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
                        <textarea
                            rows={2}
                            value={value.address}
                            onChange={(e) => onChange({...value, address: e.target.value})}
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#375F97]/20 focus:border-[#375F97] resize-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Ghi chú (không bắt buộc)
                    </label>
                    <textarea
                        rows={1}
                        value={value.note || ""}
                        onChange={(e) => onChange({...value, note: e.target.value})}
                        placeholder="Ghi chú cho người bán hoặc shipper..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#375F97]/20 focus:border-[#375F97] resize-none"
                    />
                </div>
            </div>
        </div>
    );
}