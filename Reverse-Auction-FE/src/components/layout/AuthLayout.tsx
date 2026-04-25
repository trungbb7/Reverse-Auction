import { Outlet, Link } from "react-router";
import { Cpu } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left side: Form content */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 md:px-24 xl:px-32 relative">
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32">
          <Link to="/" className="flex items-center space-x-2 text-slate-800 hover:text-primary-600 transition-colors">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">HardwardBid</span>
          </Link>
        </div>
        
        <div className="w-full max-w-md mx-auto mt-16 lg:mt-0">
          <Outlet />
        </div>
      </div>

      {/* Right side: Background/Splash (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-center items-center text-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-slate-900 z-10"></div>
        
        {/* Abstract floating shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-20 text-white max-w-lg">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Cpu size={40} className="text-primary-300" />
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Nền tảng đấu giá ngược <br /> <span className="text-primary-300">linh kiện PC hàng đầu</span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Tìm kiếm mức giá tốt nhất cho bộ PC mơ ước của bạn bằng cách để các người bán tự động cạnh tranh với nhau.
          </p>
          
          <div className="inline-flex p-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 items-center">
            <div className="flex -space-x-3 px-4">
              <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-300"></div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-400"></div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-500"></div>
            </div>
            <div className="pr-5 text-sm text-slate-300 font-medium">
              Hơn <span className="text-white font-bold">10,000+</span> người bán uy tín
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
