import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import api from "@/utils/axios";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/errorResponse";

type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token xác nhận không hợp lệ hoặc thiếu.");
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data || "Kích hoạt tài khoản thành công!");
      } catch (err) {
        setStatus("error");
        const axiosError = err as AxiosError;
        const errRes = axiosError.response?.data as ErrorResponse;
        setMessage(errRes?.message || "Kích hoạt tài khoản thất bại. Token có thể đã hết hạn hoặc không tồn tại.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[400px] flex flex-col justify-center items-center p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-6 shadow-inner animate-pulse">
        <ShieldCheck size={32} />
      </div>

      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100/50 flex flex-col items-center">
        {status === "loading" && (
          <div className="flex flex-col items-center py-6">
            <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Đang xác thực tài khoản</h2>
            <p className="text-slate-500 text-sm">Vui lòng chờ trong giây lát khi chúng tôi xác nhận liên kết của bạn...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-5 scale-in duration-500">
              <CheckCircle2 size={40} className="animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Kích hoạt thành công!</h2>
            <p className="text-emerald-700 bg-emerald-50/50 px-4 py-2.5 rounded-xl border border-emerald-100/50 text-sm mb-6 leading-relaxed">
              {message}
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Chúc mừng! Tài khoản của bạn đã được xác minh thành công. Bạn có thể sử dụng đầy đủ các tính năng của hệ thống đấu giá.
            </p>
            <Link
              to="/auth/login"
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center group"
            >
              Đăng nhập ngay
              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-5">
              <XCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Xác thực thất bại</h2>
            <p className="text-rose-700 bg-rose-50/50 px-4 py-2.5 rounded-xl border border-rose-100/50 text-sm mb-6 leading-relaxed">
              {message}
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Liên kết kích hoạt có thể đã hết hạn (24 giờ) hoặc đã được sử dụng trước đó. Vui lòng liên hệ hỗ trợ hoặc thử đăng ký lại.
            </p>
            <Link
              to="/auth/register"
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center group"
            >
              Quay lại đăng ký
              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
