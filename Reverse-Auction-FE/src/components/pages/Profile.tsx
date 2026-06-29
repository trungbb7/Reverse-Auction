import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { userService } from "@/services/userService";
import { logoutUser } from "../Auth/authSlice";
import { useAppDispatch } from "@/hooks/redux";
import type { User } from "@/types/user";
import { cloudinaryService } from "@/services/cloudinaryService";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/errorResponse";

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
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User>(defaultUser);
  const [form, setForm] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);
  const [identityNumber, setIdentityNumber] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const getUser = async () => {
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
    getUser();
  }, []);

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

  const handleKycSubmit = async () => {
    if (!identityNumber || !frontImage || !backImage || !businessLicense) {
      alert(
        "Vui lòng điền đủ Số CCCD và 2 mặt ảnh cùng với giấy phép kinh doanh!",
      );
      return;
    }
    setKycLoading(true);
    try {
      const fileList: File[] = [];
      fileList.push(frontImage);
      fileList.push(backImage);
      fileList.push(businessLicense);

      const imageUrls = await cloudinaryService.uploadMultiImages(fileList);

      console.log(imageUrls);

      const payload = {
        identityNumber,
        frontIdentity: imageUrls[0],
        backIdentity: imageUrls[1],
        businessLicense: imageUrls[2],
      };

      const updatedUser = await userService.submitKyc(payload);
      setUser(updatedUser);
      setForm(updatedUser);
      toast.success("Gửi yêu cầu xác minh thành công!");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 400) {
        const { fieldErrors } = err.response?.data as ErrorResponse;
        toast.error(`${Object.values(fieldErrors || {})[0]}`);
      } else {
        toast.error("Đã xảy ra lỗi khi gửi yêu cầu xác minh!");
      }
    } finally {
      setKycLoading(false);
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
              onClick={() => navigate("/orderHistory")}
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
                name="fullName"
                value={form.fullName || ""}
                onChange={handleChange}
              />
              <Input
                label="Tên hiển thị"
                name="username"
                value={""}
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

          {/* KYC SECTION */}
          <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm mt-6">
            <h2 className="text-lg font-semibold mb-4">
              Xác minh danh tính (KYC)
            </h2>

            <div className="mb-4">
              <span className="text-sm font-medium">Trạng thái hiện tại: </span>
              <span
                className={`font-bold ${user.kycStatus === "APPROVED" ? "text-green-600" : user.kycStatus === "REJECTED" ? "text-red-600" : user.kycStatus === "PENDING" ? "text-yellow-600" : "text-gray-500"}`}
              >
                {user.kycStatus === "APPROVED"
                  ? "Đã xác minh"
                  : user.kycStatus === "REJECTED"
                    ? "Bị từ chối"
                    : user.kycStatus === "PENDING"
                      ? "Đang chờ duyệt"
                      : "Chưa xác minh"}
              </span>
              {user.kycStatus === "REJECTED" && user.kycMessage && (
                <p className="text-red-500 text-sm mt-1">
                  Lý do: {user.kycMessage}
                </p>
              )}
            </div>

            {(user.kycStatus === "UNVERIFIED" ||
              user.kycStatus === "REJECTED") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Số CCCD</label>
                  <input
                    type="text"
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Ảnh mặt trước CCCD
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                    className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Ảnh mặt sau CCCD
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                    className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">
                    Giấy phép kinh doanh
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setBusinessLicense(e.target.files?.[0] || null)
                    }
                    className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
                  />
                </div>
              </div>
            )}

            {(user.kycStatus === "UNVERIFIED" ||
              user.kycStatus === "REJECTED") && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleKycSubmit}
                  disabled={kycLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 disabled:opacity-50"
                >
                  {kycLoading ? "Đang gửi..." : "Gửi xác minh"}
                </button>
              </div>
            )}
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
