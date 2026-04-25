import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/components/Auth/authSlice";
import api from "@/utils/axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import type { MyJwtPayload } from "@/types/jwtPayload";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", { email, password });

      const { accessToken, refreshToken } = response.data;

      // Decode token to get user info
      const decoded = jwtDecode(accessToken) as MyJwtPayload;

      dispatch(
        loginUser({
          user: {
            email: decoded.sub || email,
            role: decoded.role || "ROLE_BUYER",
            fullName: decoded.fullName || email.split("@")[0],
          },
          accessToken,
          refreshToken,
        }),
      );

      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Chào mừng trở lại!
        </h1>
        <p className="text-slate-500">Bắt đầu thôi</p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin}>
        <div className="space-y-2">
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

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
          </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 accent-primary-600 cursor-pointer"
              />
              <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>

            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center group mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Đăng nhập
              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-slate-600 text-sm">
        Chưa có tài khoản?{" "}
        <Link
          to="/auth/register"
          className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
        >
          Tạo tài khoản
        </Link>
      </p>

      <div className="mt-8 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative bg-white px-4 text-sm text-slate-500">
          Hoặc đăng nhập với
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          <span className="text-slate-700 font-medium text-sm">Google</span>
        </button>
        <button className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2">
          <img
            src="https://www.svgrepo.com/show/475647/facebook-color.svg"
            className="w-5 h-5"
            alt="Facebook"
          />
          <span className="text-slate-700 font-medium text-sm">Facebook</span>
        </button>
      </div>
    </div>
  );
}
