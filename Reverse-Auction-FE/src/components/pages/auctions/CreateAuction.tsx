import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { UploadCloud, CheckCircle2, ShieldCheck, Zap, X } from "lucide-react";
import api from "@/utils/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/errorResponse";

const CATEGORIES = [
  { id: 1, name: "CPU - Bộ vi xử lý" },
  { id: 2, name: "VGA - Card màn hình" },
  { id: 3, name: "RAM - Bộ nhớ trong" },
  { id: 4, name: "Ổ cứng (SSD/HDD)" },
  { id: 5, name: "Mainboard - Bo mạch chủ" },
  { id: 6, name: "Nguồn (PSU)" },
  { id: 7, name: "Khác" },
];

const CreateAuction = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    quantity: 1,
    budgetMax: "",
    endDate: "",
    description: "",
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    console.log(`${e.target.name} - ${e.target.value}`);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auctions", formData);
      toast.success("Đăng yêu cầu thành công!");
      navigate("/my-auctions");
    } catch (err) {
      console.error(err);

      if (err instanceof AxiosError && err.status === 400) {
        const { fieldErrors } = err.response?.data as ErrorResponse;
        toast.error(`${Object.values(fieldErrors)[0]}`);
      } else {
        toast.error("Đăng yêu cầu thất bại!");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...urls].slice(0, 5)); // max 5 images
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column - Info & Features */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
              Tạo yêu cầu
              <br />
              đấu giá
            </h1>
            <p className="text-slate-600 text-lg">
              Mô tả chi tiết linh kiện bạn cần để nhận báo giá cạnh tranh nhất
              từ hàng trăm người bán uy tín.
            </p>
          </div>

          <div className="bg-slate-100/70 rounded-3xl p-8 space-y-6">
            <h3 className="font-bold text-slate-800 text-lg">
              Tại sao nên tạo đấu giá?
            </h3>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">
                  Miễn phí hoàn toàn
                </h4>
                <p className="text-slate-500 text-sm mt-1">
                  Người mua không phải trả bất kỳ khoản phí niêm yết nào.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">
                  Bảo vệ thanh toán
                </h4>
                <p className="text-slate-500 text-sm mt-1">
                  Tiền của bạn được giữ an toàn cho đến khi nhận và kiểm tra
                  hàng.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">
                  Nhận báo giá nhanh
                </h4>
                <p className="text-slate-500 text-sm mt-1">
                  Hệ thống thông báo tức thì đến người bán phù hợp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-8 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Row 1: Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="VD: Cần mua RTX 3060 12GB..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Danh mục *
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    -- Chọn danh mục --
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Quantity, Budget, End Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Số lượng
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ngân sách dự kiến *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="budgetMax"
                    required
                    min="0"
                    placeholder="5,000,000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-16 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                    value={formData.budgetMax}
                    onChange={handleChange}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200/50 rounded-md text-sm font-medium text-slate-600">
                    VNĐ
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Thời hạn kết thúc *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mô tả chi tiết *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Mô tả rõ yêu cầu về tình trạng (mới/cũ), thương hiệu, bảo hành, các phụ kiện đi kèm..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Row 4: Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Hình ảnh tham khảo
              </label>
              <div
                className="w-full border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 hover:bg-slate-100/50 hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-blue-500">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-700">
                  Kéo thả ảnh vào đây hoặc nhấn để chọn
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Hỗ trợ JPG, PNG (Tối đa 5MB/ảnh)
                </p>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                  {previewImages.map((src, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 group"
                    >
                      <img
                        src={src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Area */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                  i
                </span>
                Phí niêm yết:{" "}
                <strong className="text-slate-900">
                  Miễn phí cho người mua
                </strong>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-4 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all"
              >
                Bắt đầu đấu giá
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;
