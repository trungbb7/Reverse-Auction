import { useState, useEffect } from "react";
import type { Category } from "@/types/category";
import type { ProductRequest, Product } from "@/types/product";
import { sellerProductService } from "@/services/sellerProductService.ts";
import { cloudinaryService } from "@/services/cloudinaryService";
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

export default function AddProductModal({ open, onClose, categories, mode, initialData, onSuccess }: Props) {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<ProductRequest>(emptyForm);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
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

            const initialUrls = initialData.imageUrls && initialData.imageUrls.length > 0
                ? initialData.imageUrls
                : initialData.imageUrl
                    ? [initialData.imageUrl]
                    : [];
            setExistingImages(initialUrls);
            setImageFiles([]);
        } else {
            setForm(emptyForm);
            setExistingImages([]);
            setImageFiles([]);
        }
    }, [open, mode, initialData]);

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
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveExisting = (indexToRemove: number) => {
        setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleRemoveNew = (indexToRemove: number) => {
        setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            let uploadedUrls: string[] = [];
            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(file => cloudinaryService.uploadSingleImage(file));
                uploadedUrls = await Promise.all(uploadPromises);
            }

            const allImages = [...existingImages, ...uploadedUrls];
            const coverImage = allImages.length > 0 ? allImages[0] : "";

            const payload: ProductRequest = {
                ...form,
                imageUrl: coverImage,
                imageUrls: allImages,
            };

            let res;

            if (mode === "create") {
                res = await sellerProductService.createProduct(payload);
            } else {
                res = await sellerProductService.updateProduct(
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
                    <button className="text-slate-400 hover:text-slate-600 text-xl font-bold" onClick={onClose}>✕</button>
                </div>

                {/* FORM */}
                <div className="grid grid-cols-2 gap-5">
                    {/* NAME */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Tên sản phẩm *</label>
                        <input
                            name="name"
                            value={form.name}
                            placeholder="Tên sản phẩm"
                            className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    {/* BRAND */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Thương hiệu</label>
                        <input
                            name="brand"
                            value={form.brand}
                            placeholder="Thương hiệu"
                            className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    {/* MODEL */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Model</label>
                        <input
                            name="model"
                            value={form.model}
                            placeholder="VD: RTX 4070 / i7-12700K"
                            className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    {/* PRICE */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Giá *</label>
                        <input
                            name="price"
                            type="number"
                            value={form.price}
                            className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    {/* STOCK */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Tồn kho *</label>
                        <input
                            name="stockQuantity"
                            type="number"
                            value={form.stockQuantity}
                            className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Danh mục *</label>
                        <select
                            name="categoryId"
                            value={form.categoryId}
                            className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
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
                        <label className="text-sm font-medium text-slate-700">Hình ảnh sản phẩm</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="border border-slate-200 focus:border-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
                        />

                        {/* Image Previews */}
                        {(existingImages.length > 0 || imageFiles.length > 0) && (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
                                {/* Existing Images */}
                                {existingImages.map((url, index) => (
                                    <div key={`existing-${index}`} className="relative group aspect-square border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                        <img
                                            src={url}
                                            className="w-full h-full object-cover"
                                            alt={`existing-${index}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExisting(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow hover:bg-red-600 transition"
                                        >
                                            ✕
                                        </button>
                                        {index === 0 && (
                                            <span className="absolute bottom-1 left-1 bg-indigo-900 text-white text-[9px] px-1 rounded font-bold uppercase tracking-wider">
                                                Cover
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {/* New Selected Files */}
                                {imageFiles.map((file, index) => {
                                    const objectUrl = URL.createObjectURL(file);
                                    return (
                                        <div key={`new-${index}`} className="relative group aspect-square border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                            <img
                                                src={objectUrl}
                                                className="w-full h-full object-cover"
                                                alt={`new-${index}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNew(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow hover:bg-red-600 transition"
                                            >
                                                ✕
                                            </button>
                                            {existingImages.length === 0 && index === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-indigo-900 text-white text-[9px] px-1 rounded font-bold uppercase tracking-wider">
                                                    Cover
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="col-span-2">
                        <label className="text-sm font-medium text-slate-700">Mô tả</label>
                        <textarea
                            name="description"
                            value={form.description}
                            className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
                            rows={3}
                            onChange={handleChange}
                        />
                    </div>

                    {/* SPECIFICATIONS */}
                    <div className="col-span-2">
                        <label className="text-sm font-medium text-slate-700">Thông số kỹ thuật</label>
                        <textarea
                            name="specifications"
                            value={form.specifications}
                            className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl w-full mt-1 transition-all"
                            rows={4}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose}
                            className="px-5 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition">
                        Huỷ
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-900 text-white font-semibold rounded-xl hover:bg-indigo-800 transition"
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