import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Lock, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/utils/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Nếu không có token trong URL
  if (!token) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-8">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle size={36} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Liên kết không hợp lệ</h1>
        <p className="text-slate-500 mb-6">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <Link
          to="/auth/forgot-password"
          className="inline-block py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all"
        >
          Yêu cầu lại
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/auth/reset-password", { token, newPassword });
      setIsDone(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const msg =
        axiosError.response?.data?.message ||
        "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-8">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={36} className="text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Đặt lại mật khẩu thành công!</h1>
        <p className="text-slate-500 mb-8">
          Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.
        </p>
        <button
          onClick={() => navigate("/auth/login")}
          className="inline-block py-3 px-8 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20"
        >
          Đăng nhập ngay
        </button>
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
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Tạo mật khẩu mới</h1>
        <p className="text-slate-500 leading-relaxed">
          Mật khẩu mới của bạn phải khác với các mật khẩu đã sử dụng trước đây.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800"
              placeholder="••••••••"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500">Mật khẩu phải có ít nhất 8 ký tự.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> Mật khẩu không khớp
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Đặt lại mật khẩu"
          )}
        </button>
      </form>
    </div>
  );
}
