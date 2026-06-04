import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, ArrowRight, Loader2, User, Store, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/components/Auth/authSlice";
import api from "@/utils/axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import type { MyJwtPayload } from "@/types/jwtPayload";
import { useGoogleLogin } from "@react-oauth/google";
import type { ErrorResponse } from "@/types/errorResponse";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Google Login and Registration States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState("");
  const [googleUserInfo, setGoogleUserInfo] = useState<{
    email: string;
    fullName: string;
    imageUrl: string;
  } | null>(null);
  const [selectedRole, setSelectedRole] = useState<
    "ROLE_BUYER" | "ROLE_SELLER" | ""
  >("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuthSuccess = (accessToken: string, refreshToken: string) => {
    const decoded = jwtDecode(accessToken) as MyJwtPayload;
    dispatch(
      loginUser({
        user: {
          id: Number(decoded.id),
          email: decoded.sub || "",
          role: decoded.role || "ROLE_BUYER",
          fullName: decoded.fullName || "",
          enabled: true,
        },
        accessToken,
        refreshToken,
      }),
    );

    toast.success("Đăng nhập thành công!");

    // Điều hướng theo vai trò
    const role = decoded.role;
    if (role === "ROLE_ADMIN") {
      navigate("/admin");
    } else if (role === "ROLE_SELLER") {
      navigate("/seller");
    } else {
      navigate("/");
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const response = await api.post("/auth/google", {
          accessToken: tokenResponse.access_token,
        });

        const data = response.data;
        if (!data.registered) {
          setGoogleAccessToken(tokenResponse.access_token);
          setGoogleUserInfo({
            email: data.email,
            fullName: data.fullName,
            imageUrl: data.imageUrl,
          });
          setIsRoleModalOpen(true);
        } else {
          handleAuthSuccess(data.accessToken, data.refreshToken);
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError<ErrorResponse>(error)) {
          const errMsg =
            error.response?.data.message || "Đăng nhập bằng Google thất bại.";
          toast.error(errMsg);
        } else {
          toast.error("Đăng nhập bằng Google thất bại.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Đăng nhập bằng Google thất bại.");
    },
  });

  const handleRegisterWithRole = async () => {
    if (!selectedRole) {
      toast.error("Vui lòng chọn vai trò trước khi tiếp tục!");
      return;
    }
    try {
      setIsRegistering(true);
      const response = await api.post("/auth/google", {
        accessToken: googleAccessToken,
        role: selectedRole,
      });

      const data = response.data;
      if (data.registered) {
        handleAuthSuccess(data.accessToken, data.refreshToken);
        setIsRoleModalOpen(false);
      } else {
        toast.error("Đăng ký vai trò thất bại. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error(error);
      const errMsg =
        error.response?.data?.message || "Đăng ký vai trò thất bại.";
      toast.error(errMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken } = response.data;
      handleAuthSuccess(accessToken, refreshToken);
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
              autoComplete="email"
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
              autoComplete="current-password"
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
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
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

      {/* Role Selection Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col relative animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsRoleModalOpen(false);
                setSelectedRole("");
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header info */}
            <div className="flex flex-col items-center mb-6">
              {googleUserInfo?.imageUrl ? (
                <img
                  src={googleUserInfo.imageUrl}
                  alt="Google Avatar"
                  className="w-16 h-16 rounded-full border-2 border-primary-500 shadow-md mb-3 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-2xl mb-3 shadow-inner">
                  {googleUserInfo?.fullName?.[0]?.toUpperCase()}
                </div>
              )}
              <h2 className="text-xl font-bold text-slate-800 text-center">
                Chào mừng, {googleUserInfo?.fullName}!
              </h2>
              <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">
                Tài khoản Google{" "}
                <span className="font-semibold text-slate-700">
                  {googleUserInfo?.email}
                </span>{" "}
                chưa được đăng ký trên hệ thống. Vui lòng chọn vai trò hoạt động
                của bạn.
              </p>
            </div>

            {/* Role Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Buyer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("ROLE_BUYER")}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 group cursor-pointer text-center ${
                  selectedRole === "ROLE_BUYER"
                    ? "border-primary-600 bg-primary-50/40 shadow-md shadow-primary-500/10 scale-[1.02]"
                    : "border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.01]"
                }`}
              >
                <div
                  className={`p-3 rounded-xl mb-3 transition-colors ${
                    selectedRole === "ROLE_BUYER"
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600"
                  }`}
                >
                  <User size={24} />
                </div>
                <h3
                  className={`font-bold text-sm mb-1 ${
                    selectedRole === "ROLE_BUYER"
                      ? "text-primary-950"
                      : "text-slate-700"
                  }`}
                >
                  Người mua
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Đăng yêu cầu đấu giá ngược & chọn thầu tốt nhất
                </p>
              </button>

              {/* Seller Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("ROLE_SELLER")}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 group cursor-pointer text-center ${
                  selectedRole === "ROLE_SELLER"
                    ? "border-primary-600 bg-primary-50/40 shadow-md shadow-primary-500/10 scale-[1.02]"
                    : "border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.01]"
                }`}
              >
                <div
                  className={`p-3 rounded-xl mb-3 transition-colors ${
                    selectedRole === "ROLE_SELLER"
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600"
                  }`}
                >
                  <Store size={24} />
                </div>
                <h3
                  className={`font-bold text-sm mb-1 ${
                    selectedRole === "ROLE_SELLER"
                      ? "text-primary-950"
                      : "text-slate-700"
                  }`}
                >
                  Người bán
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Chào thầu các yêu cầu đấu giá & bán hàng
                </p>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setSelectedRole("");
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all cursor-pointer text-center text-sm"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRegisterWithRole}
                disabled={!selectedRole || isRegistering}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center cursor-pointer text-sm"
              >
                {isRegistering ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
