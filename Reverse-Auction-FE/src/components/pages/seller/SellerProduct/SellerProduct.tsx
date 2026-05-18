import { useEffect, useState } from "react";
import {Box, AlertTriangle, CircleCheck, TrendingUp, Plus,} from 'lucide-react'
import ProductCardStat from './ProductCardStat'
import ProductCard from './ProductCard'
import {productService} from "@/services/productService";
import type { Product } from "@/types/product.ts";
import toast from "react-hot-toast";
import AddProductModal from "./AddProductModal";
import type {Category} from "@/types/category.ts";

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const handleSuccess = (product: Product) => {
        setProducts(prev => {
            const exists = prev.find(p => p.id === product.id);

            if (exists) {
                return prev.map(p =>
                    p.id === product.id ? product : p
                );
            }

            return [product, ...prev];
        });
    };
    const handleDelete = async (id: number) => {
        try {
            await productService.deleteProduct(id);

            setProducts(prev =>
                prev.filter(p => p.id !== id)
            );

            toast.success("Xóa sản phẩm thành công");
        } catch (err) {
            console.log(err)
            toast.error("Xóa thất bại");
        }
    };
    const [openModal, setOpenModal] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleCreate = () => {
        setMode("create");
        setSelectedProduct(null);
        setOpenModal(true);
    };
    const handleEdit = (product: Product) => {
        setMode("edit");
        setSelectedProduct(product);
        setOpenModal(true);
    };
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            try {
                const [productsData, categoriesData] = await Promise.all([
                    productService.fetchMyProducts(),
                    productService.getAllCategories(),
                ]);

                setProducts(productsData);
                setCategories(categoriesData);
            } catch (err) {
                console.error(err);
                toast.error("Không tải được dữ liệu!");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading && products.length === 0) return <p>Loading...</p>;
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

                    <button
                        onClick={handleCreate}
                        className="bg-indigo-900 hover:bg-indigo-800 text-white px-6 py-4 rounded-2xl flex items-center gap-2 font-semibold shadow-lg shadow-indigo-900/20 transition-all duration-300"
                    >
                        <Plus size={18} />
                        Thêm sản phẩm mới
                    </button>
                    <AddProductModal
                        open={openModal}
                        mode={mode}
                        initialData={selectedProduct}
                        categories={categories}
                        onClose={() => setOpenModal(false)}
                        onSuccess={handleSuccess}
                    />
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
                                <ProductCard key={product.id} product={product}
                                             onEdit={handleEdit}
                                             onDelete={handleDelete}/>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}