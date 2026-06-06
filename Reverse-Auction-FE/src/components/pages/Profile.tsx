import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { userService } from "@/services/userService";
import { logoutUser } from "../Auth/authSlice";
import { useAppDispatch } from "@/hooks/redux";
import type { User } from "@/types/user";
import toast from "react-hot-toast";

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const defaultUser: User = {
  id: 1,
  fullName: "Nguyen A",
  email: "nguyenA@gmail.com",
  phone: "+84 90 123 4567",
  role: "ROLE_BUYER",
  enabled: true,
  verified: true,
  provider: "LOCAL",
};

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User>(defaultUser);
  const [form, setForm] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [submittingTopup, setSubmittingTopup] = useState(false);
  const dispatch = useAppDispatch();

  const getUserData = async () => {
    try {
      const data = await userService.fetchUser();
      setUser(data);
      setForm(data);
    } catch {
      console.warn("API failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleTopup = async () => {
    const amountNum = Number(topupAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ!");
      return;
    }
    setSubmittingTopup(true);
    try {
      await userService.topupBalance(amountNum);
      toast.success(`Nạp thành công ${formatVND(amountNum)} vào tài khoản!`);
      setIsTopupOpen(false);
      setTopupAmount("");
      getUserData();
    } catch (err) {
      console.error(err);
      toast.error("Nạp tiền thất bại, vui lòng thử lại!");
    } finally {
      setSubmittingTopup(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const data = await userService.updateUser(form);
      setUser(data);
      setForm(data);
      console.log("Updated:", data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Hồ sơ người dùng</h1>

        <p className="text-gray-500 mt-2">
          Quản lý thông tin tài khoản và bảo mật
        </p>

        <div className="grid grid-cols-3 gap-6 mt-8">
          {/* LEFT */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="relative">
              <img
                src="https://i.pravatar.cc/150"
                alt=""
                className="w-24 h-24 rounded-full"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-white" />
            </div>
            <h2 className="mt-4 font-semibold text-lg">{user.fullName}</h2>

            <div className="w-full mt-6 text-sm">
              <p className="text-gray-400 text-xs uppercase">Email</p>
              <p>{user.email}</p>

              <p className="text-gray-400 text-xs uppercase mt-3">
                Số điện thoại
              </p>
              <p>{user.phone}</p>
            </div>

            {/* Wallet Section */}
            <div className="w-full mt-6 bg-gradient-to-br from-[#375F97] to-blue-600 rounded-xl p-4 text-white shadow-md">
              <p className="text-xs opacity-90 uppercase tracking-wider font-bold">Số dư tài khoản</p>
              <p className="text-2xl font-black mt-1">{formatVND(user.balance || 0)}</p>
              <button
                onClick={() => setIsTopupOpen(true)}
                className="mt-3 w-full bg-white text-[#375F97] hover:bg-blue-50 font-bold text-xs py-2 px-4 rounded-lg transition-all shadow-sm active:scale-95"
              >
                Nạp tiền vào ví
              </button>
            </div>

            <button
              onClick={() => navigate("/orderHistory")}
              className="mt-6 w-full border border-blue-500 text-blue-600 py-2 rounded-full hover:bg-blue-50"
            >
              Lịch sử đơn hàng
            </button>

            {user.provider === "LOCAL" ? (
              <button
                onClick={() => navigate("/auth/change-password")}
                className="mt-3 w-full border border-blue-500 text-blue-600 py-2 rounded-full hover:bg-blue-50 transition-colors"
              >
                Đổi mật khẩu
              </button>
            ) : (
              <div className="mt-3 w-full py-2 px-4 bg-slate-50 text-slate-400 border border-slate-200 rounded-full text-center text-xs font-medium">
                Đăng nhập bằng Google
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Cập nhật thông tin</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                name="fullName"
                value={form.fullName || ""}
                onChange={handleChange}
              />
              <Input
                label="Địa chỉ"
                name="address"
                value={form.address || ""}
                onChange={handleChange}
              />
              <Input
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                label="Số điện thoại"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-6 w-80">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Phiên làm việc</p>
              <p className="text-sm text-gray-400">Kết thúc phiên hiện tại</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 font-medium cursor-pointer hover:text-red-600"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      {isTopupOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Nạp tiền vào tài khoản</h2>
              <button
                onClick={() => setIsTopupOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nhập số tiền nạp (VND)
                </label>
                <input
                  type="number"
                  required
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Ví dụ: 100000"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTopupOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleTopup}
                  disabled={submittingTopup}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition-all text-sm disabled:opacity-60"
                >
                  {submittingTopup ? "Đang xử lý..." : "Xác nhận nạp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, name, value, onChange }: InputProps) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
      />
    </div>
  );
}
