import { Link } from "react-router";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Chào mừng trở lại!
        </h1>
        <p className="text-slate-500">Bắt đầu thôi</p>
      </div>

      <form className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
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
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center group mt-6"
        >
          Đăng nhập
          <ArrowRight
            size={18}
            className="ml-2 group-hover:translate-x-1 transition-transform"
          />
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
