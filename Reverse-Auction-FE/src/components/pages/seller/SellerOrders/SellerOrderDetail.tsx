import {useParams} from "react-router";
import {useState, useEffect } from "react";
import {useNavigate} from "react-router";
import {ArrowLeft, Phone, MapPin} from "lucide-react";
import { orderService } from "@/services/orderService";
import { type Order, type OrderStatus, ORDER_STEPS, ORDER_STATUS_INDEX, orderStatusContent, ORDER_TRANSITION_RULE, ORDER_STATUS_LABEL} from "@/types/orders";
import toast from "react-hot-toast";

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order) return;
        try {
            const updated = await orderService.updateStatus(order.id, newStatus);
            setOrder(updated);
            toast.success(`Đã cập nhật trạng thái đơn hàng: ${ORDER_STATUS_LABEL[newStatus]}`);
        } catch (err) {
            console.error(err);
            toast.error("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
        }
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (!id) return;
                const data = await orderService.getOrderDetail(Number(id));
                setOrder(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrder();
    }, [id]);

    if (!order) return <div className="p-5">Không tìm thấy đơn hàng</div>;
    const status = order.status;
    const steps = ORDER_STEPS;
    const currentIndex = ORDER_STATUS_INDEX[status];
    const statusInfo = orderStatusContent[order.status];
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Chi tiết đơn #{order.id}</h1>
                        <p className="text-gray-500">Quản lý và cập nhật tiến độ vận chuyển.</p>
                    </div>
                    <button onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 font-bold text-sm text-primary-800">
                        <ArrowLeft size={16}/> Quay lại
                    </button>
                </div>
                <div className="bg-gray-100 p-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            <div className="bg-white p-5 rounded-xl shadow flex gap-4">
                                <img src="https://via.placeholder.com/120" alt=""
                                     className="w-28 h-28 rounded-lg object-cover"/>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-600 font-medium">{order.status}</span>
                                        <span className="text-gray-500">#{order.id}</span>
                                    </div>
                                    <h2 className="font-semibold text-gray-500 text-lg">{order.productName}</h2>
                                    <p className="text-gray-500 text-sm">Thương hiệu: {order.brand}</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 p-5 rounded-xl shadow space-y-4">
                                <div className="mt-5">
                                    <p className="text-xs text-gray-400 mb-2">Lộ trình vận chuyển</p>
                                    <div className="relative flex items-center justify-between">
                                        <div
                                            className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2"/>
                                        <div
                                            className="absolute top-1/2 h-0.5 bg-primary-900 -translate-y-1/2 transition-all duration-300"
                                            style={{width: `${(currentIndex / (steps.length - 1)) * 100}%`,}}/>
                                        {steps.map((_, index) => {
                                            const isActive = index <= currentIndex;
                                            return (
                                                <div key={index} className="relative z-10 flex flex-col items-center">
                                                    <div
                                                        className={`w-3.5 h-3.5 rounded-full transition ${isActive ? "bg-primary-900" : "bg-gray-300"}`}/>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                        <span>Đã thanh toán</span>
                                        <span>Đang xử lý</span>
                                        <span>Đang giao</span>
                                        <span>Hoàn tất</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow space-y-2">
                                    <div className="flex items-start gap-2">
                                        <StatusIcon size={18} className={`${statusInfo.color} mt-0.5`}
                                        />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-medium text-gray-800">{statusInfo.title}</p>
                                                <span className="text-xs text-gray-400">Cập nhật: {new Date(order.updatedAt).toLocaleString("vi-VN")}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{statusInfo.description}</p>
                                        </div>
                                    </div>
                                </div>
                                {(() => {
                                    const allowedStatuses = ORDER_TRANSITION_RULE[order.status] || [];
                                    return allowedStatuses.length > 1 ? (
                                        <div className="flex flex-col gap-1 w-full mt-2">
                                            <label className="text-xs text-gray-400 font-semibold mb-1">Cập nhật trạng thái đơn hàng</label>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                                                className="bg-black text-center text-white px-4 py-2.5 rounded-full text-sm outline-none w-full font-bold cursor-pointer hover:bg-slate-900 transition-colors"
                                            >
                                                {allowedStatuses.map((s) => (
                                                    <option key={s} value={s}>
                                                        {ORDER_STATUS_LABEL[s]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2.5 text-sm font-bold text-gray-500 bg-gray-200 rounded-full w-full mt-2">
                                            Đơn hàng đã hoàn tất / hủy
                                        </div>
                                    );
                                })()}
                            </div>

                        </div>
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl shadow space-y-3">
                                <h2 className="text-base font-semibold text-gray-800">
                                    Thông tin người mua
                                </h2>
                                <div className="flex items-center gap-3">
                                    <img src="https://i.pravatar.cc/40" className="w-10 h-10 rounded-full"/>
                                    <div>
                                        <p className="font-medium">{order.buyerName}</p>
                                        <p className="text-sm text-gray-500">ID: {order.buyerId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-500"/>
                                    <span>{order.buyerPhone}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-gray-500 mt-0.5"/>
                                    <span>{order.shippingAddress}</span>
                                </div>
                                <button className="w-full mt-2 px-4 py-2 bg-gray-200 rounded-full text-sm ">
                                    Liên hệ
                                </button>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow space-y-3 text-sm">
                                <h2 className="text-base font-semibold text-gray-800">
                                    Tổng kết giá
                                </h2>
                                <div className="flex justify-between">
                                    <span>Sản phẩm</span>
                                    <span>{order.finalPrice}đ</span>
                                </div>

                                <div className="flex justify-between text-gray-500">
                                    <span>Giảm giá</span>
                                    <span>- 0đ</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{order.shippingFee}đ</span>
                                </div>
                                <hr/>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Tổng nhận</span>
                                    <span>{order.totalAmount}đ</span>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow space-y-2">
                                <p className="font-medium">Đơn vị vận chuyển</p>
                                <p className="text-sm text-gray-600">GHN Express</p>
                                <p className="text-sm text-gray-500">Mã vận đơn: GHN123456789</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}