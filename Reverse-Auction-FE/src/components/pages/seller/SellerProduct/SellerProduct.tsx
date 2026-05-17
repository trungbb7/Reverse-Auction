import { useEffect, useState } from "react";
import {Box, AlertTriangle, CircleCheck, TrendingUp, Plus,} from 'lucide-react'
import ProductCardStat from './ProductCardStat'
import ProductCard from './ProductCard'
import {productService} from "@/services/productService";
import type { Product } from "@/types/product.ts";
import toast from "react-hot-toast";

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await productService.fetchMyProducts();
                setProducts(data);
            } catch (err) {
                console.error(err);
                toast.error("Không tải được danh sách, đã có lỗi xảy ra !");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <p>Loading...</p>;
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 mb-2">
                            Quản lý sản phẩm
                        </h1>

                        <p className="text-slate-500 text-sm max-w-xl leading-6">
                            Quản lý danh mục linh kiện phần cứng theo thời gian thực với hệ
                            thống kiểm soát tồn kho thông minh.
                        </p>
                    </div>

                    <button className="bg-indigo-900 hover:bg-indigo-800 text-white px-6 py-4 rounded-2xl flex items-center gap-2 font-semibold shadow-lg shadow-indigo-900/20 transition-all duration-300">
                        <Plus size={18} />
                        Thêm sản phẩm mới
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <ProductCardStat
                        title="Tổng sản phẩm"
                        value={products.length.toString()}
                        valueColor="text-slate-800"
                        icon={<Box size={20} />}
                    />

                    <ProductCardStat
                        title="Hết hàng"
                        value={products.filter((p) => p.stockQuantity === 0).length.toString()}
                        valueColor="text-red-500"
                        icon={<AlertTriangle size={20} />}
                    />

                    <ProductCardStat
                        title="Đang bán"
                        value={products.filter((p) => p.status === "ACTIVE" &&
                            p.stockQuantity > 0).length.toString()}
                        valueColor="text-emerald-500"
                        icon={<CircleCheck size={20} />}
                    />

                    <ProductCardStat
                        title="Doanh thu tháng"
                        value="0 đ"
                        valueColor="text-slate-800"
                        icon={<TrendingUp size={20} />}
                    />
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold py-5 px-6">
                                    Thông tin sản phẩm
                                </th>

                                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold py-5 px-4">
                                    Danh mục
                                </th>

                                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold py-5 px-4">
                                    Giá niêm yết
                                </th>

                                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold py-5 px-4">

                                    Tồn kho
                                </th>

                                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold py-5 px-4">
                                    Trạng thái
                                </th>

                                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold py-5 px-4">
                                    Thao tác
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}