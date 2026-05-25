import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, BadgeInfo, Package2, ShoppingBag, Star, User } from "lucide-react";
import toast from "react-hot-toast";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";

type ProductDetailProps = {
  scope: "public" | "seller";
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function ProductDetail({ scope }: ProductDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id || Number.isNaN(Number(id))) {
        toast.error("ID sản phẩm không hợp lệ");
        navigate(-1);
        return;
      }

      setLoading(true);
      try {
        const productData =
          scope === "public"
            ? await productService.getPublicProduct(Number(id))
            : await productService.getMyProduct(Number(id));
        setProduct(productData);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải chi tiết sản phẩm");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate, scope]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[520px] rounded-[2rem] bg-white animate-pulse border border-slate-200" />
        <div className="space-y-4">
          <div className="h-40 rounded-[2rem] bg-white animate-pulse border border-slate-200" />
          <div className="h-72 rounded-[2rem] bg-white animate-pulse border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const isListed = Boolean(product.listedForSale);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 via-white to-amber-50">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-6" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300">
                <Package2 size={96} />
              </div>
            )}
            <div className="absolute left-5 top-5 flex gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                {product.brand || "Không có thương hiệu"}
              </span>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isListed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {isListed ? "Đăng bán" : "Đấu giá"}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">{product.name}</h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <User size={16} />
                  <span>{product.sellerName || "Không rõ người bán"}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900">
                  {currencyFormatter.format(product.price ?? 0)}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1 text-amber-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-medium text-slate-600">
                    {(product.rating ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kho</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{product.stock ?? "-"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Loại</p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {isListed ? "Sản phẩm đăng bán" : "Sản phẩm đấu giá"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mã</p>
                <p className="mt-2 text-xl font-bold text-slate-900">#{product.id}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              <BadgeInfo size={16} />
              Mô tả
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
              {product.description || "Không có mô tả cho sản phẩm này."}
            </p>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
            <h2 className="text-lg font-bold">Hành động</h2>
            <p className="mt-2 text-sm text-white/70">
              {scope === "public"
                ? "Xem chi tiết sản phẩm đăng bán từ shop."
                : "Thông tin chi tiết dành cho người bán quản lý sản phẩm."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
            >
              <ShoppingBag size={16} />
              Quay lại danh sách
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
