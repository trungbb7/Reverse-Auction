import {useParams} from "react-router";
import {useNavigate} from "react-router";
import {ArrowLeft, Phone, MapPin, AlertCircle} from "lucide-react";

type Order = {
    id: string;
    name: string;
    price: number;
    shipping: number;
    buyer: string;
    address: string;
    status: OrderStatus;
};

const orders: Order[] = [
    {
        id: "#ORD-8921-X",
        name: "NVIDIA GeForce RTX 4090 Founders Edition",
        price: 1599,
        shipping: 25,
        buyer: "James Nguyen",
        address: "789 Tech Boulevard, Quận 1, TP.HCM",
        status: "DELIVERED",
    },
    {
        id: "#ORD-8812-A",
        name: "AMD Ryzen 9 7950X Desktop Processor",
        price: 699,
        shipping: 0,
        buyer: "Alice Trương",
        address: "124 Khu Công Nghệ Cao, Quận 9",
        status: "COMPLETED",
    },
    {
        id: "#ORD-7754-C",
        name: "Logitech G Pro X Superlight 2",
        price: 159,
        shipping: 5,
        buyer: "Kevin Vu",
        address: "45 Gaming House, Cầu Giấy, Hà Nội",
        status: "SHIPPED",
    },
];
type OrderStatus =
    | "AWAITING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "DISPUTED"
    | "CANCELLED";
export default function OrderDetail() {
    const {id} = useParams();
    const decodedId = decodeURIComponent(id || "");
    const navigate = useNavigate();
    const order = orders.find(o => o.id === decodedId);
    if (!order) {
        return <div className="p-5">Không tìm thấy đơn hàng</div>;
    }
    const steps: OrderStatus[] = [
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "COMPLETED",
    ];
    const status: OrderStatus = order.status;
    const currentIndex = {
        AWAITING_PAYMENT: 0,
        PAID: 0,
        PROCESSING: 1,
        SHIPPED: 2,
        DELIVERED: 3,
        COMPLETED: 3,
        DISPUTED: -1,
        CANCELLED: -1,
    }[status];

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Chi tiết đơn {order.id}</h1>
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
                                        <span className="text-gray-500">{order.id}</span>
                                    </div>
                                    <h2 className="font-semibold text-lg">{order.name}</h2>
                                    <p className="text-gray-500 text-sm">NVIDIA</p>
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
                                        <AlertCircle size={18} className="text-blue-600 mt-0.5" />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-medium text-gray-800">Đang vận chuyển</p>
                                                <span className="text-xs text-gray-400">Cập nhật: 14:32 30/04</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Đơn hàng đang được giao đến khách hàng</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="w-full px-4 rounded-full py-2 text-sm text-white bg-gradient-to-r from-primary-900 to-primary-400">
                                    Cập nhật trạng thái
                                </button>
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
                                        <p className="font-medium">{order.buyer}</p>
                                        <p className="text-sm text-gray-500">ID: KH001</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-500"/>
                                    <span>0909 123 456</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-gray-500 mt-0.5"/>
                                    <span>{order.address}</span>
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
                                    <span>{order.price}đ</span>
                                </div>

                                <div className="flex justify-between text-gray-500">
                                    <span>Giảm giá</span>
                                    <span>- 0đ</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{order.shipping}đ</span>
                                </div>
                                <hr/>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Tổng nhận</span>
                                    <span>{order.price + order.shipping}đ</span>
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