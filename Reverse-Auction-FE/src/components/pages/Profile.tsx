import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "@/utils/axios";
import { logoutUser } from "../Auth/authSlice";
import { useAppDispatch } from "@/hooks/redux";
import type { User } from "@/types/user";

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const defaultUser: User = {
  id: "0",
  fullName: "Nguyen A",
  email: "nguyenA@gmail.com",
  phone: "+84 90 123 4567",
  role: "ROLE_BUYER",
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User>(defaultUser);
  const [form, setForm] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
        setForm(res.data);
      } catch {
        console.warn("API failed");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await api.put("/users/me", form);
      setUser(res.data);
      setForm(res.data);
      console.log("Updated:", res.data);
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

            <button
              onClick={() => navigate("")}
              className="mt-6 w-full border border-blue-500 text-blue-600 py-2 rounded-full hover:bg-blue-50"
            >
              Lịch sử đơn hàng
            </button>

            <button
              onClick={() => navigate("")}
              className="mt-3 w-full border border-blue-500 text-blue-600 py-2 rounded-full hover:bg-blue-50"
            >
              Đặt lại mật khẩu
            </button>
          </div>

          {/* RIGHT */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Cập nhật thông tin</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                name="name"
                value={form.fullName || ""}
                onChange={handleChange}
              />
              <Input
                label="Tên hiển thị"
                name="username"
                value={form.fullName || ""}
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
