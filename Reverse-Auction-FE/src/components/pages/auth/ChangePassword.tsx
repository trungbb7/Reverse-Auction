import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import api from "@/utils/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/errorResponse";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu mới không khớp!");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("Mật khẩu mới không được trùng với mật khẩu cũ!");
      return;
    }

    try {
      setIsLoading(true);
      await api.put("/users/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success("Thay đổi mật khẩu thành công!");
      navigate("/profile");
    } catch (err) {
      const axiosError = err as AxiosError;
      const errRes = axiosError.response?.data as ErrorResponse;
      toast.error(errRes?.message || "Đã xảy ra lỗi khi đổi mật khẩu.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto p-4">
      <Link
        to="/profile"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1.5" /> Quay lại Hồ sơ cá nhân
      </Link>

      <div className="mb-6 text-center sm:text-left flex flex-col items-center sm:items-start">
        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-4 shadow-sm">
          <KeyRound size={24} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Đổi mật khẩu</h1>
        <p className="text-slate-500 leading-relaxed text-sm">
          Mật khẩu mới của bạn phải có độ bảo mật cao và khác với mật khẩu hiện tại.
        </p>
      </div>

      <form className="space-y-4 bg-white p-6 border border-slate-100 rounded-2xl shadow-sm" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800 text-sm"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800 text-sm"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>
          <p className="text-xs text-slate-400">Mật khẩu phải dài tối thiểu 8 ký tự.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800 text-sm"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center mt-6 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Cập nhật mật khẩu"
          )}
        </button>
      </form>
    </div>
  );
}
