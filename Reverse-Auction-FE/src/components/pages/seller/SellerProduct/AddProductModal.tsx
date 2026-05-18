import { useState, useEffect } from "react";
import type { Category } from "@/types/category";
import type { ProductRequest, Product } from "@/types/product";
import { productService } from "@/services/productService";
import toast from "react-hot-toast";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];

    mode: "create" | "edit";
    initialData?: Product | null;

    onSuccess: (product: Product) => void;
}

const emptyForm: ProductRequest = {
    name: "",
    description: "",
    specifications: "",
    brand: "",
    model: "",
    imageUrl: "",
    categoryId: 0,
    price: 0,
    stockQuantity: 0,
};

export default function AddProductModal({open, onClose, categories, mode, initialData, onSuccess,}: Props) {

    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>("");

    const [form, setForm] = useState<ProductRequest>(emptyForm);
    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({
                name: initialData.name ?? "",
                description: initialData.description ?? "",
                specifications: initialData.specifications ?? "",
                brand: initialData.brand ?? "",
                model: initialData.model ?? "",
                imageUrl: initialData.imageUrl ?? "",
                categoryId: initialData.categoryId ?? 0,
                price: Number(initialData.price ?? 0),
                stockQuantity: initialData.stockQuantity ?? 0,
            });

            setPreview(initialData.imageUrl ?? "");
        } else {
            setForm(emptyForm);
            setPreview("");
        }
    }, [open, mode]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]:
                name === "price" || name === "stockQuantity"
                    ? Math.max(0, Number(value))
                    : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload: ProductRequest = {
                ...form,
                imageUrl: preview,
            };

            let res;

            if (mode === "create") {
                res = await productService.createProduct(payload);
            } else {
                res = await productService.updateProduct(
                    initialData!.id,
                    payload
                );
            }

            toast.success(
                mode === "create"
                    ? "Tạo sản phẩm thành công"
                    : "Cập nhật sản phẩm thành công"
            );

            onSuccess(res);
            onClose();

        } catch (err) {
            console.error(err);
            toast.error("Thao tác thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

            <div className="bg-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">

                {/* HEADER */}
                <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                        {mode === "create" ? "Thêm sản phẩm" : "Cập nhật sản phẩm"}
                    </h2>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* FORM */}
                <div className="grid grid-cols-2 gap-5">

                    {/* NAME */}
                    <div>
                        <label className="text-sm font-medium">Tên sản phẩm *</label>
                        <input
                            name="name"
                            value={form.name}
                            placeholder="Tên sản phẩm"
                            className="border p-3 rounded-xl w-full mt-1"
                            onChange={handleChange}
                        />
                    </div>

                    {/* BRAND */}
                    <div>
                        <label className="text-sm font-medium">Thương hiệu</label>
                        <input
                            name="brand"
                            value={form.brand}
                            placeholder="Thương hiệu"
                            className="border p-3 rounded-xl w-full mt-1"
                            onChange={handleChange}
                        />
                    </div>

                    {/* MODEL */}
                    <div>
                        <label className="text-sm font-medium">Model</label>
                        <input
                            name="model"
                            value={form.model}
                            placeholder="VD: RTX 4070 / i7-12700K"
                            className="border p-3 rounded-xl w-full mt-1"
                            onChange={handleChange}
                        />
                    </div>

                    {/* PRICE */}
                    <div>
                        <label className="text-sm font-medium">Giá *</label>
                        <input
                            name="price"
                            type="number"
                            value={form.price}
                            className="border p-3 rounded-xl w-full mt-1"
                            onChange={handleChange}
                        />
                    </div>

                    {/* STOCK */}
                    <div>
                        <label className="text-sm font-medium">Tồn kho *</label>
                        <input
                            name="stockQuantity"
                            type="number"
                            value={form.stockQuantity}
                            className="border p-3 rounded-xl w-full mt-1"
                            onChange={handleChange}
                        />
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label className="text-sm font-medium">Danh mục *</label>
                        <select
                            name="categoryId"
                            value={form.categoryId}
                            className="border p-3 rounded-xl w-full mt-1"
                            onChange={handleChange}
                        >
                            <option value={0}>Chọn danh mục</option>

                            {categories.map((cate) => (
                                <option key={cate.id} value={cate.id}>
                                    {cate.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* IMAGE */}
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Hình ảnh</label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="border p-3 rounded-xl w-full mt-1"
                        />

                        {preview && (
                            <img
                                src={preview}
                                className="w-40 h-40 mt-3 object-cover rounded-xl"
                            />
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Mô tả</label>
                        <textarea
                            name="description"
                            value={form.description}
                            className="border p-3 rounded-xl w-full mt-1"
                            rows={3}
                            onChange={handleChange}
                        />
                    </div>

                    {/* SPECIFICATIONS */}
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Thông số kỹ thuật</label>
                        <textarea
                            name="specifications"
                            value={form.specifications}
                            className="border p-3 rounded-xl w-full mt-1"
                            rows={4}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 mt-8">

                    <button onClick={onClose}
                            className="px-5 py-3 bg-slate-100 rounded-xl">
                        Huỷ
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-900 text-white rounded-xl"
                    >
                        {loading
                            ? "Đang xử lý..."
                            : mode === "create"
                                ? "Thêm sản phẩm"
                                : "Cập nhật sản phẩm"}
                    </button>

                </div>
            </div>
        </div>
    );
}