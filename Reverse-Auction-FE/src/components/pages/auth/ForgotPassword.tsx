import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { publicApi } from "@/utils/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/errorResponse";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await publicApi.post("/auth/forgot-password", { email });
      setIsSent(true);
    } catch (error) {
      const axiosError = error as AxiosError<string>;
      const errorObj = axiosError.response?.data as unknown as ErrorResponse;
      toast.error(errorObj.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link
          to="/auth/login"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1.5" /> Quay lại đăng nhập
        </Link>

        <div className="text-center py-8">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={36} className="text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Email đã được gửi!
          </h1>
          <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
            Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
            <span className="font-semibold text-slate-700">{email}</span>. Vui
            lòng kiểm tra hộp thư của bạn.
          </p>
          <p className="text-slate-400 text-sm mt-4">
            Link sẽ hết hạn sau <strong>15 phút</strong>.
          </p>

          <button
            onClick={() => setIsSent(false)}
            className="mt-8 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Gửi lại email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        to="/auth/login"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1.5" /> Quay lại đăng nhập
      </Link>

      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Quên mật khẩu?
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Đừng lo lắng! Vui lòng nhập email liên kết với tài khoản của bạn,
          chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Email của bạn
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800 text-base"
              placeholder="nhapemail@example.com"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Gửi liên kết khôi phục"
          )}
        </button>
      </form>
    </div>
  );
}
