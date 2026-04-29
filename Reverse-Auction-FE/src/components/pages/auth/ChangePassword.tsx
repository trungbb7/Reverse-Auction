import { Link } from "react-router";
import { Lock, ArrowLeft } from "lucide-react";

export default function ChangePassword() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/auth/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-1.5" /> Quay lại đăng nhập
      </Link>
      
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Tạo mật khẩu mới</h1>
        <p className="text-slate-500 leading-relaxed">
          Mật khẩu mới của bạn phải khác với các mật khẩu đã sử dụng trước đây.
        </p>
      </div>

      <form className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
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
          <p className="text-xs text-slate-500">Mật khẩu phải có ít nhất 8 ký tự.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
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
        </div>

        <button type="submit" className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center mt-6">
          Đặt lại mật khẩu
        </button>
      </form>
    </div>
  );
}
