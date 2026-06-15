import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { SlidersHorizontal, ArrowUpDown, Cpu, MapPin } from "lucide-react";
import { productService } from "@/services/productsService";
import { shopService } from "@/services/shopService";
import { ProductCard } from "@/components/ui/ProductCard";
import { ShopCard } from "@/components/ui/ShopCard";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { ShopDetail } from "@/types/shopDetail";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [activeTab, setActiveTab] = useState<"products" | "shops">("products");
  const [categories, setCategories] = useState<Category[]>([]);

  // Product Search State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [productSortBy, setProductSortBy] = useState<string>("id");
  const [productSortDir, setProductSortDir] = useState<string>("asc");
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotalElements, setProductTotalElements] = useState(0);

  // Shop Search State
  const [shops, setShops] = useState<ShopDetail[]>([]);
  const [shopSortBy, setShopSortBy] = useState<string>("id");
  const [shopSortDir, setShopSortDir] = useState<string>("asc");
  const [shopPage, setShopPage] = useState(1);
  const [shopTotalPages, setShopTotalPages] = useState(1);
  const [shopTotalElements, setShopTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);

  // Load categories once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  // Product search query
  useEffect(() => {
    if (activeTab !== "products") return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          keyword: keyword || undefined,
          categoryId: selectedCategoryId || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          page: productPage - 1,
          size: 12,
          sortBy: productSortBy,
          sortDir: productSortDir,
        };
        const res = await productService.searchProducts(params);
        setProducts(res.content);
        setProductTotalPages(res.totalPages || 1);
        setProductTotalElements(res.totalElements || 0);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được kết quả tìm kiếm sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    keyword,
    selectedCategoryId,
    minPrice,
    maxPrice,
    productSortBy,
    productSortDir,
    productPage,
    activeTab,
  ]);

  // Shop search query
  useEffect(() => {
    if (activeTab !== "shops") return;

    const fetchShops = async () => {
      setLoading(true);
      try {
        const params = {
          keyword: keyword || undefined,
          page: shopPage - 1,
          size: 12,
          sortBy: shopSortBy,
          sortDir: shopSortDir,
        };
        const res = await shopService.searchShops(params);
        setShops(res.content);
        setShopTotalPages(res.totalPages || 1);
        setShopTotalElements(res.totalElements || 0);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được kết quả tìm kiếm cửa hàng!");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [keyword, shopSortBy, shopSortDir, shopPage, activeTab]);

  // Reset pagination when filter updates
  useEffect(() => {
    setProductPage(1);
  }, [
    keyword,
    selectedCategoryId,
    minPrice,
    maxPrice,
    productSortBy,
    productSortDir,
  ]);

  useEffect(() => {
    setShopPage(1);
  }, [keyword, shopSortBy, shopSortDir]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            Kết quả tìm kiếm
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {activeTab === "products" ? (
              <span>
                Tìm thấy{" "}
                <strong className="text-indigo-900 font-bold">
                  {productTotalElements}
                </strong>{" "}
                sản phẩm linh kiện phù hợp.
              </span>
            ) : (
              <span>
                Tìm thấy{" "}
                <strong className="text-indigo-900 font-bold">
                  {shopTotalElements}
                </strong>{" "}
                cửa hàng phù hợp.
              </span>
            )}
            {keyword && (
              <span>
                {" "}
                cho từ khóa "
                <strong className="text-slate-700 font-semibold">
                  {keyword}
                </strong>
                "
              </span>
            )}
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "products"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sản phẩm ({productTotalElements})
          </button>
          <button
            onClick={() => setActiveTab("shops")}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "shops"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Cửa hàng ({shopTotalElements})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters - Only display for products */}
        <div
          className={`lg:col-span-1 space-y-6 ${activeTab === "shops" ? "hidden lg:block lg:opacity-40 lg:pointer-events-none" : ""}`}
        >
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-100 pb-3">
              <SlidersHorizontal size={18} />
              Bộ lọc tìm kiếm
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 block">
                Danh mục sản phẩm
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedCategoryId === undefined}
                    onChange={() => setSelectedCategoryId(undefined)}
                    className="w-4 h-4 text-indigo-900 focus:ring-indigo-900 border-slate-300 rounded"
                  />
                  Tất cả danh mục
                </label>
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <input
                      type="radio"
                      checked={selectedCategoryId === cat.id}
                      onChange={() => setSelectedCategoryId(cat.id)}
                      className="w-4 h-4 text-indigo-900 focus:ring-indigo-900 border-slate-300 rounded"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 block">
                Khoảng giá (đ)
              </label>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Giá từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Giá đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Results Content */}
        <div
          className={`lg:col-span-3 space-y-6 ${activeTab === "shops" ? "lg:col-span-4" : ""}`}
        >
          {/* Sort Options */}
          <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <span className="text-sm text-slate-500 font-medium">
              Sắp xếp kết quả tìm kiếm theo:
            </span>

            <div className="flex items-center gap-3">
              <ArrowUpDown className="text-slate-400" size={16} />
              {activeTab === "products" ? (
                <select
                  value={`${productSortBy}-${productSortDir}`}
                  onChange={(e) => {
                    const [by, dir] = e.target.value.split("-");
                    setProductSortBy(by);
                    setProductSortDir(dir);
                  }}
                  className="border border-slate-200 p-2 rounded-xl text-sm bg-white font-semibold outline-none cursor-pointer focus:border-indigo-500"
                >
                  <option value="id-asc">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="ratingAverage-desc">Đánh giá tốt nhất</option>
                  <option value="createdAt-desc">Mới nhất</option>
                </select>
              ) : (
                <select
                  value={`${shopSortBy}-${shopSortDir}`}
                  onChange={(e) => {
                    const [by, dir] = e.target.value.split("-");
                    setShopSortBy(by);
                    setShopSortDir(dir);
                  }}
                  className="border border-slate-200 p-2 rounded-xl text-sm bg-white font-semibold outline-none cursor-pointer focus:border-indigo-500"
                >
                  <option value="id-asc">Mặc định</option>
                  <option value="rating-desc">Đánh giá tốt nhất</option>
                  <option value="fullName-asc">Tên cửa hàng (A-Z)</option>
                </select>
              )}
            </div>
          </div>

          {/* Loading or Results grid */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
            </div>
          ) : activeTab === "products" ? (
            /* Products Grid */
            products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/shopPage/${prod.sellerId}`}
                      className="block h-full group"
                    >
                      <ProductCard product={prod} />
                    </Link>
                  ))}
                </div>
                {productTotalPages > 1 && (
                  <Pagination
                    currentPage={productPage}
                    totalPages={productTotalPages}
                    setCurrentPage={setProductPage}
                  />
                )}
              </>
            ) : (
              <div className="bg-white py-16 text-center border border-slate-100 rounded-3xl shadow-sm">
                <Cpu className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-slate-500 text-sm">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác nhé.
                </p>
              </div>
            )
          ) : /* Shops Grid */
          shops.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
              {shopTotalPages > 1 && (
                <Pagination
                  currentPage={shopPage}
                  totalPages={shopTotalPages}
                  setCurrentPage={setShopPage}
                />
              )}
            </>
          ) : (
            <div className="bg-white py-16 text-center border border-slate-100 rounded-3xl shadow-sm">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Không tìm thấy cửa hàng
              </h3>
              <p className="text-slate-500 text-sm">
                Thử từ khóa tìm kiếm khác nhé.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
