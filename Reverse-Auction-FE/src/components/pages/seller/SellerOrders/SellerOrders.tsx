import {useState } from "react";
import { useNavigate } from "react-router";
import Pagination from "@/components/ui/Pagination";
import {Search, Printer } from "lucide-react";

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
type OrderStatus = | "AWAITING_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "DISPUTED" | "CANCELLED";

interface Order {
    id: string;
    name: string;
    price: number;
    shipping: number;
    buyer: string;
    address: string;
    status: OrderStatus;
}

const statusColor = {
    AWAITING_PAYMENT: "text-yellow-700",
    PAID: " text-blue-700",
    PROCESSING: "text-blue-700",
    SHIPPED: " text-indigo-700",
    DELIVERED: "text-green-700",
    COMPLETED: "text-emerald-700",
    DISPUTED: "text-red-700",
    CANCELLED: "text-gray-600",
};

function StatusBadge({status}: { status: OrderStatus }) {
    const map: Record<OrderStatus, string> = {
        AWAITING_PAYMENT: "Chờ thanh toán",
        PAID: "Đã thanh toán",
        PROCESSING: "Đang xử lý",
        SHIPPED: "Đang giao",
        DELIVERED: "Đã giao",
        COMPLETED: "Hoàn tất",
        DISPUTED: "Tranh chấp",
        CANCELLED: "Đã huỷ",
    };

    return (
        <span className={`text-xl font-bold ${statusColor[status]}`}>
            {map[status]}
        </span>
    );
}

function OrderCard({order}: { order: Order }) {

    const steps: OrderStatus[] = [
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "COMPLETED",
    ];

    const [status, setStatus] = useState<OrderStatus>(order.status);
    const navigate = useNavigate();
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
        <div className="bg-white rounded-2xl shadow p-6 mb-4 flex gap-6">
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">ID:</span>
                        <span className="text-xs font-medium bg-gray-100 p-1 rounded-md text-gray-400">{order.id}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-900">
                        ${order.price.toFixed(2)}
                    </p>
                </div>
                <div className="flex justify-between text-sm items-start">
                    <h2 className="font-semibold text-lg">
                        {order.name}
                    </h2>
                    <div className="text-right">
                        <div className="flex justify-end items-center gap-2">
                            <span className="text-xs ">Phí vận chuyển: </span>
                            <span className="font-medium">${order.shipping.toFixed(2)}</span>
                        </div>
                        {order.shipping === 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1">Freeship</p>
                        )}
                    </div>
                </div>

                <div className="mt-4 bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between text-sm">
                        <div>
                            <p className="text-xs text-gray-400">Người mua</p>
                            <p className="font-medium">{order.buyer}</p>
                        </div>

                        <div className="text-left">
                            <p className="text-xs text-gray-400">Địa chỉ</p>
                            <p className="text-sm text-gray-600">
                                {order.address}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <p className="text-xs text-gray-400 mb-2">
                        Lộ trình vận chuyển
                    </p>

                    <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2"/>

                        <div className="absolute top-1/2 h-0.5 bg-primary-900 -translate-y-1/2 transition-all duration-300"
                            style={{width: `${(currentIndex / (steps.length - 1)) * 100}%`,}}/>
                        {steps.map((_, index) => {
                            const isActive = index <= currentIndex;
                            return (
                                <div key={index} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-3.5 h-3.5 rounded-full transition ${isActive ? "bg-primary-900" : "bg-gray-300"}`}/>
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
            </div>

            <div className="w-72 bg-gray-50 rounded-xl p-5 flex flex-col gap-3">
                <p className="text-xs text-gray-400">Trạng thái</p>
                <StatusBadge status={status}/>
                <p className="text-xs text-gray-400">
                    Cập nhật: 30/04/2026 10:30
                </p>

                <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="bg-black text-center text-white px-3 py-2 rounded-lg text-sm outline-none">
                    <option value="AWAITING_PAYMENT">Chờ thanh toán</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="SHIPPED">Đang giao</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="COMPLETED">Hoàn tất</option>
                    <option value="DISPUTED">Tranh chấp</option>
                    <option value="CANCELLED">Đã huỷ</option>
                </select>
                <button  onClick={() => navigate(`/seller/orders-detail/${encodeURIComponent(order.id)}`)}
                         className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
                    Xem chi tiết
                </button>
                <button className="flex items-center justify-center gap-2 text-sm text-primary-800 hover:text-gray-900 transition">
                    <Printer className="w-4 h-4" />
                    <span>In hóa đơn</span>
                </button>
            </div>

        </div>
    );
}

export default function OrderManagement() {

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages] = useState(8);
    const [activeTab, setActiveTab] = useState<"orders" | "auction">("orders");
    const [filter, setFilter] = useState<"ALL" | "PROCESSING" | "SHIPPING" | "COMPLETED" | "CANCEL">("ALL");
    const [keyword, setKeyword] = useState("");
    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <div className="max-w-7xl">
                <h1 className="text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-gray-500 mb-6">Theo dõi và cập nhật trạng thái đơn hàng của bạn.</p>
                    </div>

                    <div className="bg-slate-200 p-1 rounded-xl flex items-center shrink-0">
                        <button onClick={() => setActiveTab("orders")}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === "orders" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
                            Danh sách đơn
                        </button>
                        <button onClick={() => setActiveTab("auction")}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === "auction" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
                            Lịch sử đấu giá
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-15 mb-6 text-sm">
                    <button onClick={() => setFilter("ALL")}
                        className={`pb-1 transition ${filter === "ALL" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                        Tất cả
                    </button>
                    <button onClick={() => setFilter("PROCESSING")}
                        className={`pb-1 transition ${filter === "PROCESSING" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                        Đang xử lý
                    </button>
                    <button onClick={() => setFilter("SHIPPING")}
                        className={`pb-1 transition ${filter === "SHIPPING" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                        Đang giao
                    </button>
                    <button onClick={() => setFilter("COMPLETED")}
                        className={`pb-1 transition ${filter === "COMPLETED" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                        Đã hoàn thành
                    </button>
                    <button onClick={() => setFilter("CANCEL")}
                        className={`pb-1 transition ${filter === "CANCEL" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                        Đã hủy
                    </button>
                    <div className="relative w-100 ml-auto">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Tìm kiếm đơn hàng..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm transition-all"
                        />
                    </div>
                </div>
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order}/>
                ))}
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        </div>
    );
}
