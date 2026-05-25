import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import {
  Plus,
  PencilLine,
  Trash2,
  X,
  Package,
  Image as ImageIcon,
  Star,
  CircleSlash2,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { productService } from "@/services/productService";
import type { PageResponse, Product, ProductRequest } from "@/types/product";

type ProductFormState = {
  name: string;
  imageUrl: string;
  brand: string;
  description: string;
  stock: string;
  price: string;
};

const emptyForm = (): ProductFormState => ({
  name: "",
  imageUrl: "",
  brand: "",
  description: "",
  stock: "0",
  price: "",
});

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function toFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    imageUrl: product.imageUrl ?? "",
    brand: product.brand ?? "",
    description: product.description ?? "",
    stock: String(product.stock ?? 0),
    price: String(product.price ?? ""),
  };
}

function parseNumericValue(value: string): number | null {
  const normalized = value.replace(/[^\d-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toPayload(form: ProductFormState): ProductRequest {
  const stock = parseNumericValue(form.stock);
  const price = parseNumericValue(form.price);

  if (stock === null || price === null) {
    throw new Error("Giá hoặc tồn kho không hợp lệ");
  }

  return {
    name: form.name.trim(),
    imageUrl: form.imageUrl.trim() || null,
    brand: form.brand.trim() || null,
    description: form.description.trim() || null,
    stock,
    price,
  };
}

function SaleTable({
  data,
  loading,
  onEdit,
  onDelete,
  onView,
  currentPage,
  setCurrentPage,
}: {
  data: PageResponse<Product> | null;
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}) {
  const products = data?.content ?? [];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Sản phẩm đăng bán</h3>
            <p className="mt-1 text-sm text-slate-500">Chỉ hiển thị sản phẩm có stock và price.</p>
          </div>
          <div className="text-sm text-slate-500">
            {data ? `${data.totalElements} sản phẩm` : ""}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-600 text-sm font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4">Thương hiệu</th>
              <th className="px-6 py-4">Giá</th>
              <th className="px-6 py-4">Kho</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Không có sản phẩm đăng bán nào
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => onView(product)}
                          className="font-semibold text-left text-slate-900 hover:text-primary-600 transition-colors"
                        >
                          {product.name}
                        </button>
                        <div className="text-xs text-slate-500">ID #{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {product.brand || "Không có"}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {currencyFormatter.format(product.price ?? 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{product.stock ?? "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-xs">
                    <p className="line-clamp-2 text-slate-600">{product.description || "Không có"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-slate-700">{(product.rating ?? 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Sửa"
                      >
                        <PencilLine size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data && data.totalPages > 1 && (
        <div className="border-t border-slate-200 bg-slate-50/30 px-4 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            setCurrentPage={setCurrentPage}
          />
          <p className="mt-3 text-center text-xs text-slate-500">
            Trang {data.pageNo + 1} / {data.totalPages}
          </p>
        </div>
      )}
    </div>
  );
}

function AuctionTable({
  data,
  loading,
  onView,
  currentPage,
  setCurrentPage,
}: {
  data: PageResponse<Product> | null;
  loading: boolean;
  onView: (product: Product) => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}) {
  const products = data?.content ?? [];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Sản phẩm đấu giá</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tách riêng khỏi sản phẩm đăng bán. Không hiển thị ở trang mua hàng.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
            <CircleSlash2 size={14} />
            Riêng biệt
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-600 text-sm font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4">Thương hiệu</th>
              <th className="px-6 py-4">Giá</th>
              <th className="px-6 py-4">Kho</th>
              <th className="px-6 py-4">Mô tả</th>
              <th className="px-6 py-4">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Chưa có sản phẩm đấu giá
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => onView(product)}
                          className="font-semibold text-left text-slate-900 hover:text-primary-600 transition-colors"
                        >
                          {product.name}
                        </button>
                        <div className="text-xs text-slate-500">ID #{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {product.brand || "Không có"}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {currencyFormatter.format(product.price ?? 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{product.stock ?? "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-xs">
                    <p className="line-clamp-2 text-slate-600">{product.description || "Không có"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-slate-700">{(product.rating ?? 0).toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data && data.totalPages > 1 && (
        <div className="border-t border-slate-200 bg-slate-50/30 px-4 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            setCurrentPage={setCurrentPage}
          />
          <p className="mt-3 text-center text-xs text-slate-500">
            Trang {data.pageNo + 1} / {data.totalPages}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SellerProducts() {
  const navigate = useNavigate();
  const [saleData, setSaleData] = useState<PageResponse<Product> | null>(null);
  const [auctionData, setAuctionData] = useState<PageResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [salePage, setSalePage] = useState(1);
  const [auctionPage, setAuctionPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const fetchSaleProducts = async (page = salePage) => {
    const data = await productService.getMyProducts(true, page - 1, 10);
    setSaleData(data);
    setSalePage(data.pageNo + 1);
  };

  const fetchAuctionProducts = async (page = auctionPage) => {
    const data = await productService.getMyProducts(false, page - 1, 10);
    setAuctionData(data);
    setAuctionPage(data.pageNo + 1);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSaleProducts(salePage), fetchAuctionProducts(auctionPage)]);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [salePage, auctionPage]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setIsOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(toFormState(product));
    setIsOpen(true);
  };

  const viewProduct = (product: Product) => {
    navigate(`/seller/products/${product.id}`);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Tên sản phẩm không được để trống");
      return;
    }
    const stock = parseNumericValue(form.stock);
    const price = parseNumericValue(form.price);

    if (stock === null || stock < 0) {
      toast.error("Số lượng tồn kho không hợp lệ");
      return;
    }
    if (price === null || price <= 0) {
      toast.error("Giá bán phải lớn hơn 0");
      return;
    }

    setSubmitting(true);
    try {
      const payload = toPayload(form);
      if (editing) {
        await productService.updateProduct(editing.id, payload);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await productService.createProduct(payload);
        toast.success("Đã tạo sản phẩm mới");
      }
      closeModal();
      await fetchSaleProducts(salePage);
    } catch (error) {
      console.error(error);
      const response = (error as { response?: { data?: { message?: string; fieldErrors?: Record<string, string> } } })?.response?.data;
      if (response?.fieldErrors) {
        console.error("Validation errors:", response.fieldErrors);
      }
      toast.error(response?.message || "Không thể lưu sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Xóa sản phẩm "${product.name}"?`);
    if (!confirmed) return;

    try {
      await productService.deleteProduct(product.id);
      toast.success("Đã xóa sản phẩm");
      await fetchSaleProducts(salePage);
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 px-6 py-8 text-white shadow-2xl sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
              <Package size={16} />
              Quản lý sản phẩm
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Tách riêng sản phẩm đăng bán và sản phẩm đấu giá
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                Sản phẩm đăng bán có stock và price sẽ được gắn `listedForSale = true`. Sản phẩm đấu giá hiển thị ở bảng riêng và không xuất hiện trong trang mua hàng.
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-100"
          >
            <Plus size={18} />
            Thêm sản phẩm đăng bán
          </button>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-500">
          Đang tải danh sách sản phẩm...
        </div>
      ) : (
        <div className="space-y-6">
          <SaleTable
            data={saleData}
            loading={loading}
            onEdit={openEdit}
            onDelete={handleDelete}
            onView={viewProduct}
            currentPage={salePage}
            setCurrentPage={setSalePage}
          />

          <AuctionTable
            data={auctionData}
            loading={loading}
            onView={viewProduct}
            currentPage={auctionPage}
            setCurrentPage={setAuctionPage}
          />
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm đăng bán"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Rating được hệ thống tự xử lý, không nhập thủ công.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Tên sản phẩm</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="VD: RTX 4070 Super"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Thương hiệu</span>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="VD: ASUS"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-slate-700">Đường dẫn ảnh</span>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="https://..."
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Tồn kho</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Giá bán</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="VD: 18500000"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-slate-700">Mô tả sản phẩm</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-32 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Mô tả chi tiết cho sản phẩm..."
                />
              </label>

              {form.imageUrl && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
                    <ImageIcon size={16} />
                    Xem trước ảnh
                  </div>
                  <div className="flex items-center justify-center bg-white p-4">
                    <img
                      src={form.imageUrl}
                      alt="preview"
                      className="max-h-56 rounded-xl object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
