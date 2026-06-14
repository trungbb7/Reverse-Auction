import {useParams} from "react-router";
import {useState, useEffect } from "react";
import {useNavigate} from "react-router";
import {ArrowLeft, Phone, MapPin, X, Package} from "lucide-react";
import { orderService } from "@/services/orderService";

import { type Order, type OrderItem,  ORDER_STEPS, ORDER_STATUS_INDEX, orderStatusContent, type OrderStatus, ORDER_TRANSITION_RULE, ORDER_STATUS_LABEL } from "@/types/orders";
import toast from "react-hot-toast";

function ConfirmModal({isOpen, onClose, onConfirm, title, message, loading}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    loading: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition disabled:opacity-50"
                    >
                        {loading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function OrderItemCard({ item }: { item: OrderItem  }) {
    return (
        <div className="flex gap-4 py-4 border-b last:border-b-0">
            <img
                src={item.productImage || "https://via.placeholder.com/80"}
                alt={item.productName}
                className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
                <div className="flex justify-between">
                    <div>
                        <h4 className="font-medium text-gray-800">{item.productName}</h4>
                        <p className="text-sm text-gray-500">{item.brand} {item.model}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-primary-900">
                            {item.unitPrice?.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-sm text-gray-500">x {item.quantity}</p>
                    </div>
                </div>
                <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-400">
                        Thành tiền: <span className="font-medium">{item.subtotal?.toLocaleString('vi-VN')}đ</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [updating, setUpdating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

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

    const canCancel = () => {
        if (!order) return false;
        const cancelableStatuses: OrderStatus[] = ['AWAITING_PAYMENT', 'PAID', 'PROCESSING'];
        return cancelableStatuses.includes(order.status);
    };

    const handleStatusSelect = (newStatus: OrderStatus) => {
        setPendingStatus(newStatus);
        setShowConfirmModal(true);
    };

    const confirmStatusUpdate = async () => {
        if (!order || !pendingStatus) return;

        const oldStatus = order.status;
        setUpdating(true);
        setShowConfirmModal(false);

        setOrder({ ...order, status: pendingStatus });

        try {
            const updated = await orderService.updateStatus(order.id, pendingStatus);
            setOrder(updated);
            toast.success(`Đã cập nhật trạng thái: ${ORDER_STATUS_LABEL[updated.status]}`);
        } catch (err) {
            console.error(err);
            setOrder({ ...order, status: oldStatus });
            toast.error("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
        } finally {
            setUpdating(false);
            setPendingStatus(null);
        }
    };

    const handleCancelOrder = () => {
        setIsCancelling(true);
        setShowConfirmModal(true);
    };

    const confirmCancelOrder = async () => {
        if (!order) return;

        const oldStatus = order.status;
        setIsCancelling(false);
        setShowConfirmModal(false);
        setUpdating(true);

        setOrder({ ...order, status: 'CANCELLED' });

        try {
            const updated = await orderService.updateStatus(order.id, 'CANCELLED');
            setOrder(updated);
            toast.success("Đã hủy đơn hàng thành công!");
        } catch (err) {
            console.error(err);
            setOrder({ ...order, status: oldStatus });
            toast.error("Hủy đơn hàng thất bại. Vui lòng thử lại!");
        } finally {
            setUpdating(false);
        }
    };

    const handleModalConfirm = () => {
        if (isCancelling) {
            confirmCancelOrder();
        } else if (pendingStatus) {
            confirmStatusUpdate();
        }
    };

    const handleModalClose = () => {
        setShowConfirmModal(false);
        setPendingStatus(null);
        setIsCancelling(false);
    };

    if (!order) return <div className="p-5">Không tìm thấy đơn hàng</div>;

    const status = order.status;
    const steps = ORDER_STEPS;
    const currentIndex = ORDER_STATUS_INDEX[status];
    const statusInfo = orderStatusContent[order.status];
    const StatusIcon = statusInfo.icon;
    const allowedStatuses = ORDER_TRANSITION_RULE[status];

    const getModalMessage = () => {
        if (isCancelling) {
            return "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác!";
        }
        if (pendingStatus) {
            return `Bạn có chắc chắn muốn chuyển trạng thái từ "${ORDER_STATUS_LABEL[status]}" sang "${ORDER_STATUS_LABEL[pendingStatus]}" không?`;
        }
        return "";
    };

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Chi tiết đơn #{order.code || order.id}</h1>
                        <p className="text-gray-500">Quản lý và cập nhật tiến độ vận chuyển.</p>
                    </div>
                    <button onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 font-bold text-sm text-primary-800">
                        <ArrowLeft size={16}/> Quay lại
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Cột trái - Danh sách sản phẩm và timeline */}
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow p-5">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package size={20} />
                                Sản phẩm ({order.items?.length || 0})
                            </h2>

                            {order.items && order.items.length > 0 ? (
                                <div className="divide-y">
                                    {order.items.map((item) => (
                                        <OrderItemCard key={item.id} item={item} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">Không có sản phẩm</p>
                            )}
                        </div>

                        {/* Timeline và cập nhật trạng thái */}
                        <div className="bg-white p-5 rounded-xl shadow space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Lộ trình vận chuyển</p>
                                <div className="relative flex items-center justify-between">
                                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2"/>
                                    <div
                                        className="absolute top-1/2 h-0.5 bg-primary-900 -translate-y-1/2 transition-all duration-300"
                                        style={{width: `${(currentIndex / (steps.length - 1)) * 100}%`}}/>
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

                            {/* Status info */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <StatusIcon size={18} className={`${statusInfo.color} mt-0.5`}/>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-gray-800">{statusInfo.title}</p>
                                            <span className="text-xs text-gray-400">
                                                {new Date(order.updatedAt).toLocaleString("vi-VN")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{statusInfo.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cập nhật trạng thái */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Cập nhật trạng thái</label>
                                <select
                                    value=""
                                    onChange={(e) => handleStatusSelect(e.target.value as OrderStatus)}
                                    disabled={updating}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    <option value="">-- Chọn trạng thái mới --</option>
                                    {allowedStatuses.map((s) => (
                                        <option key={s} value={s}>
                                            {ORDER_STATUS_LABEL[s]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nút hủy đơn hàng */}
                            {canCancel() && (
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={updating}
                                    className="w-full px-4 rounded-lg py-2 text-sm text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    Hủy đơn hàng
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cột phải - Thông tin người mua và tổng kết */}
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl shadow">
                            <h2 className="text-base font-semibold text-gray-800 mb-3">
                                Thông tin người mua
                            </h2>
                            <div className="space-y-3">
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
                                    <span className="text-sm">{order.shippingAddress}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tổng kết giá */}
                        <div className="bg-white p-5 rounded-xl shadow">
                            <h2 className="text-base font-semibold text-gray-800 mb-3">
                                Tổng kết đơn hàng
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tạm tính</span>
                                    <span>{order.subtotal?.toLocaleString('vi-VN') || 0}đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phí vận chuyển</span>
                                    <span>{order.shippingFee?.toLocaleString('vi-VN') || 0}đ</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Tổng cộng</span>
                                        <span className="text-primary-900">{order.totalAmount?.toLocaleString('vi-VN') || 0}đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                title={isCancelling ? "Xác nhận hủy đơn" : "Xác nhận chuyển trạng thái"}
                message={getModalMessage()}
                loading={updating}
            />
        </div>
    );
}