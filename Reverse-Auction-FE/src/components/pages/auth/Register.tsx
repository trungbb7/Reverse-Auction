import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import api from "@/utils/axios";
import toast from "react-hot-toast";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    if (!agreeTerms) {
      toast.error("Vui lòng đồng ý với các điều khoản!");
      return;
    }

    try {
      setIsLoading(true);
      // Assuming role is USER by default
      await api.post("/auth/register", {
        fullName,
        email,
        password,
        role: "ROLE_BUYER",
      });

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/auth/login");
    } catch (error) {
      toast.error(
        error.response?.data ||
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Tạo tài khoản mới
        </h1>
        <p className="text-slate-500">Bắt đầu đấu giá linh kiện ngay hôm nay</p>
      </div>

      <form className="space-y-4" onSubmit={handleRegister}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Họ và tên
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800"
              placeholder="nhapemail@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Nhập lại mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-slate-800"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex items-start py-2">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 bg-white border-slate-300 rounded text-primary-600 focus:ring-primary-500"
              required
            />
          </div>
          <label htmlFor="terms" className="ml-2 text-sm text-slate-600">
            Tôi đồng ý với các{" "}
            <a href="#" className="text-primary-600 hover:underline">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-primary-600 hover:underline">
              Chính sách bảo mật
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center group mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Đăng ký tài khoản
              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-slate-600 text-sm">
        Đã có tài khoản?{" "}
        <Link
          to="/auth/login"
          className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
