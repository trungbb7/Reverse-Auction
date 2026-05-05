import {useEffect, useState} from "react";
import {type Order, type OrderStatus, ORDER_STATUS_LABEL} from "@/types/orders";
import {orderService} from "@/services/orderService.ts";

const statusColor: Record<OrderStatus, string> = {
    AWAITING_PAYMENT: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    DISPUTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
};

const statusLabel= ORDER_STATUS_LABEL

function Stats() {
    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500">Tổng đơn hàng</p>
                <p className="text-xl font-bold">24</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500">Đang xử lý</p>
                <p className="text-xl font-bold text-blue-600">03</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500">Chi tiêu tháng</p>
                <p className="text-xl font-bold">45,200,000đ</p>
            </div>
        </div>
    );
}

function Tabs({active, setActive,}: { active: string; setActive: (v: string) => void; }) {
    const tabs = ["Tất cả", "Đấu giá", "Đặt hàng"];
    return (
        <div className="flex gap-3">
            {tabs.map((t) => (
                <button key={t} onClick={() => setActive(t)} className={`px-3 py-1 rounded-full text-sm transition ${
                        active === t ? "bg-white shadow text-blue-600" : "text-gray-500"}`}>{t}
                </button>
            ))}
        </div>
    );
}

function OrderCard({order}: { order: Order }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition">
            <img src={order.imageUrl} className="w-full h-40 object-cover rounded-xl"/>
            <div className="mt-3 space-y-1">
                <h2 className="font-semibold text-sm">{order.productName}</h2>
                <p className="text-xs text-gray-400">ID: #{order.code}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
                <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Tổng cộng</span>
                    <span className="font-semibold">
            {order.totalAmount.toLocaleString()}đ
          </span>
                </div>
                <button className="w-full mt-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200">
                    Chi tiết
                </button>
            </div>
        </div>
    );
}

export default function OrderHistoryPage() {
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [orders, setOrders] = useState<Order[]>([]);
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await orderService.getMyOrders();
                setOrders(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchOrders();
    }, []);
    const filtered = [...orders]
        .filter((o) =>
            o.productName.toLowerCase().includes(search.toLowerCase())
        )
        .filter((o) => {
            if (activeTab === "Tất cả") return true;
            if (activeTab === "Đấu giá") return o.type === "AUCTION";
            if (activeTab === "Đặt hàng") return o.type === "NORMAL";
            return true;
        })
        .sort((a, b) => {
            if (sort === "newest") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
        });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">

                <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
                <p className="text-sm text-gray-500 mb-6">Quản lý các giao dịch đấu thầu và mua sắm của bạn.</p>
                <Stats/>
                <div className="flex justify-between items-center mt-6">
                    <Tabs active={activeTab} setActive={setActiveTab}/>
                    <div className="flex gap-3">

                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm đơn..." className="border px-3 py-2 rounded-lg text-sm"/>

                        <select value={sort} onChange={(e) => setSort(e.target.value)}
                            className="border px-3 py-2 rounded-lg text-sm">
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                        </select>

                    </div>
                </div>

                <div className="grid grid-cols-4 gap-5 mt-6">{filtered.map((order) => (<OrderCard key={order.id} order={order}/>))}</div>
            </div>
        </div>
    );
}